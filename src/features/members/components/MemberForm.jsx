import React, { useState, useRef, useEffect } from 'react';
import api from '../../../shared/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useFormState } from '../../../shared/context/FormStateContext';
import {
  FaUser, FaCamera, FaUpload,
  FaTrash, FaCrown,
  FaMoneyBillWave, FaArrowLeft, FaArrowRight, FaTimes, FaCropAlt,
  FaDumbbell, FaWeight, FaRulerVertical, FaSyncAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { DatePicker } from '../../../shared/components/ui/DatePicker';
import { ButtonSpinner } from '../../../shared/components/ui/Skeleton';

// Canonical goal keys — must match FITNESS_GOALS in
// N3Fit-api/src/modules/member/member.validation.js. The label/icon are
// frontend-only; the backend stores the keys.
const FITNESS_GOAL_OPTIONS = [
  { key: 'weightLoss', label: 'Weight Loss' },
  { key: 'muscleGain', label: 'Muscle Gain' },
  { key: 'betterPhysique', label: 'Better Physique' },
  { key: 'sixPack', label: 'Six Pack' },
  { key: 'weightLifting', label: 'Weight Lifting' },
  { key: 'endurance', label: 'Endurance' },
  { key: 'flexibility', label: 'Flexibility' },
  { key: 'generalFitness', label: 'General Fitness' },
  { key: 'other', label: 'Other' },
];

function NewMember() {
  const { setDirty } = useFormState();
  const [step, setStep] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [dob, setDob] = useState("");
  const [plan, setPlan] = useState("1-Month");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gender, setGender] = useState("");

  // Optional fitness profile — captured at enrollment so trainers have a
  // baseline. All four fields are optional; an empty selection submits cleanly.
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goals, setGoals] = useState([]);     // array of goal keys
  const [customGoal, setCustomGoal] = useState(""); // free text when goals includes 'other'

  const toggleGoal = (key) => {
    setGoals((prev) => {
      const next = prev.includes(key)
        ? prev.filter((g) => g !== key)
        : [...prev, key];
      // Clearing the 'other' chip should also blank the free-text field so it
      // doesn't quietly hitch a ride on the next submit.
      if (key === 'other' && prev.includes('other')) setCustomGoal('');
      return next;
    });
  };

  // Photo State
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Payment State
  const [amount, setAmount] = useState('');
  const [admissionFee, setAdmissionFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [settings, setSettings] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { hasFeature } = useAuth();

  useEffect(() => {
    api.get(`/settings`)
      .then(res => {
        // response.data IS already the unwrapped payload — don't re-unwrap in feature code
        const data = res.data;
        setAdmissionFee(data?.admissionFee || 0);
        setSettings(data);
        // Set default plan to first active plan
        if (data?.plans && data.plans.length > 0) {
          const activePlans = data.plans.filter(p => p.isActive);
          if (activePlans.length > 0) {
            setPlan(activePlans[0].name);
          }
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, []);

  useEffect(() => {
    if (settings?.plans && settings.plans.length > 0) {
      const selectedPlan = settings.plans.find(p => p.name === plan);
      if (selectedPlan) {
        setAmount(selectedPlan.price);
        return;
      }
    }
    if (plan && settings?.subscriptionPrices) {
      const price = settings.subscriptionPrices[plan] || 0;
      setAmount(price);
    }
  }, [plan, settings]);

  // Cleanup camera on unmount
  useEffect(() => {
    const video = modalVideoRef.current;
    return () => {
      if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Camera Modal State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [tempCapturedImage, setTempCapturedImage] = useState(null);
  const modalVideoRef = useRef(null);
  const modalCanvasRef = useRef(null);
  const streamRef = useRef(null);

  // Track unsaved-changes state via shared context (replaces window.isRegistrationDirty).
  // The FormStateProvider already installs a beforeunload handler when isDirty=true.
  useEffect(() => {
    const isDirty = name.trim() !== "" ||
      phone !== "" ||
      photoBlob !== null ||
      gender !== "" ||
      dob !== "" ||
      discount !== '' ||
      weight !== "" ||
      height !== "" ||
      goals.length > 0 ||
      customGoal !== "";

    setDirty(isDirty);

    return () => {
      setDirty(false);
      // Ensure camera stops on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [name, phone, photoBlob, gender, dob, discount, weight, height, goals, customGoal, setDirty]);

  // Camera Logic
  const [facingMode, setFacingMode] = useState('user');

  const startCamera = async (mode = facingMode) => {
    setIsCameraModalOpen(true);
    setTempCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Could not access camera");
      setIsCameraModalOpen(false);
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    // Stop current stream and restart with new facing mode
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    startCamera(newMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (modalVideoRef.current) {
      modalVideoRef.current.srcObject = null;
    }
    setIsCameraModalOpen(false);
  };

  // After Retake, the <video> element is freshly mounted and its srcObject is
  // null even though the stream is still alive in streamRef. Reattach so the
  // live preview comes back instead of a frozen black frame.
  useEffect(() => {
    if (isCameraModalOpen && !tempCapturedImage && streamRef.current && modalVideoRef.current) {
      if (modalVideoRef.current.srcObject !== streamRef.current) {
        modalVideoRef.current.srcObject = streamRef.current;
      }
    }
  }, [isCameraModalOpen, tempCapturedImage]);

  const captureFrame = () => {
    const video = modalVideoRef.current;
    const canvas = modalCanvasRef.current;
    if (video && canvas) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      setTempCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
    }
  };

  const saveCroppedPhoto = () => {
    const canvas = modalCanvasRef.current;
    if (!canvas || !tempCapturedImage) return;

    // Create a square crop from the center
    const size = Math.min(canvas.width, canvas.height);
    const startX = (canvas.width - size) / 2;
    const startY = (canvas.height - size) / 2;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = 600; // Target size
    cropCanvas.height = 600;
    const ctx = cropCanvas.getContext('2d');

    // Draw the source canvas onto the crop canvas (clipping to square)
    ctx.drawImage(canvas, startX, startY, size, size, 0, 0, 600, 600);

    cropCanvas.toBlob((blob) => {
      setPhotoBlob(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      stopCamera();
      toast.success("Photo captured successfully");
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoBlob(file);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success("Photo uploaded");
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!name.trim()) return toast.error("Enter Name");
      if (phone.length < 10) return toast.error("Enter valid phone");
      if (!gender) return toast.error("Select Gender");
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const Submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    // Sanitize phone
    formData.append('phone', `${countryCode}${phone}`.replace(/[ \-()]/g, ''));
    formData.append('plan', plan);
    if (date) formData.append('date', date);
    formData.append('gender', gender);
    if (dob) formData.append('dob', dob);

    // Status and Dews are calculated by backend model pre-save hook

    const safeAmount = (val) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    };

    const baseAmount = safeAmount(amount);
    const admFee = safeAmount(admissionFee);
    const disc = safeAmount(discount);
    const totalAmount = baseAmount + admFee - disc;

    formData.append('amount', totalAmount);
    formData.append('discount', disc);
    // Payment method and status are NOT sent here — enrollment always creates
    // a Pending transaction. Staff records the actual payment via the
    // MembershipCard / RecordPaymentModal immediately after enrollment.

    // Compute planDays from settings plan duration + durationType
    if (settings?.plans && settings.plans.length > 0) {
      const selectedPlan = settings.plans.find(p => p.name === plan);
      if (selectedPlan) {
        let days = selectedPlan.duration;
        const type = selectedPlan.durationType || 'months';
        if (type === 'weeks') days = selectedPlan.duration * 7;
        else if (type === 'months') days = selectedPlan.duration * 30;
        formData.append('planDays', days);
      }
    }

    if (photoBlob) {
      formData.append('profileImage', photoBlob, 'profile.jpg');
    }

    // Optional fitness profile — skip blank fields entirely so the request
    // doesn't carry empty strings the backend would have to coerce. Goals is
    // JSON-encoded because multipart turns arrays into repeated fields, which
    // the parseGoalsField middleware on the API explicitly looks for.
    if (weight !== '' && weight != null) formData.append('weight', weight);
    if (height !== '' && height != null) formData.append('height', height);
    if (goals.length > 0) formData.append('goals', JSON.stringify(goals));
    if (goals.includes('other') && customGoal.trim() !== '') {
      formData.append('customGoal', customGoal.trim());
    }

    try {
      const res = await api.post(`/contacts/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { member, transaction } = res.data;
      toast.success('Member enrolled! Record payment below.');
      // Navigate to the membership card — the transaction is Pending until
      // staff records the payment via the Mark-as-Paid flow.
      const txnParam = transaction?._id ? `?txn=${transaction._id}` : '';
      navigate(`/members/${member._id}/card${txnParam}`);
    } catch (err) {
      // The axios response interceptor (shared/services/api.js) already shows
      // a toast with the actual server message (e.g. "phone already exists").
      // Don't toast a generic "Enrollment failed" on top of it — that's where
      // the duplicate-toast bug was coming from.
    } finally {
      setSubmitting(false);
    }
  };

  const renderMobileActionBar = () => {
    let left = null;
    let right = null;
    if (step === 1) {
      right = (
        <button
          onClick={nextStep}
          type="button"
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all text-[11px]"
        >
          Continue <FaArrowRight size={12} />
        </button>
      );
    } else if (step === 2) {
      left = (
        <button
          onClick={prevStep}
          type="button"
          className="px-5 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all text-[10px]"
        >
          <FaArrowLeft size={10} /> Back
        </button>
      );
      right = (
        <button
          onClick={nextStep}
          type="button"
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all text-[11px]"
        >
          Review <FaArrowRight size={12} />
        </button>
      );
    } else if (step === 3) {
      left = (
        <button
          onClick={prevStep}
          type="button"
          className="px-5 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all text-[10px]"
        >
          Modify
        </button>
      );
      right = (
        <button
          onClick={Submit}
          type="button"
          disabled={submitting}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Add Member
        </button>
      );
    }
    return (
      <div
        className="lg:hidden fixed left-0 right-0 z-30 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-4 pt-2 pb-1.5 flex items-center gap-3"
        style={{ bottom: 'calc(68px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex-1 flex justify-start">{left}</div>
        <div className="shrink-0">{renderStepDots()}</div>
        <div className="flex-1 flex justify-end">{right}</div>
      </div>
    );
  };

  const renderStepDots = () => (
    <div className="flex items-center justify-center gap-1.5">
      {[1, 2, 3].map((s) => {
        const isDone = step > s;
        const isCurrent = step === s;
        return (
          <span
            key={s}
            className={`h-2 rounded-full transition-all ${
              isCurrent
                ? 'w-5 bg-zinc-900 dark:bg-white'
                : isDone
                ? 'w-2 bg-green-500'
                : 'w-2 bg-gray-200 dark:bg-zinc-700'
            }`}
            aria-current={isCurrent ? 'step' : undefined}
          />
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-2 lg:p-6 pb-[88px] lg:pb-6">
      <Toaster position="top-right" />
      {submitting && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="bg-[#1c1c1c] rounded-2xl px-8 py-6 flex flex-col items-center gap-4 border border-[#2a2a2a]">
            <ButtonSpinner className="scale-150 text-white" />
            <span className="text-white font-semibold text-sm tracking-widest uppercase">Processing...</span>
          </div>
        </div>
      )}

      <div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden p-6 lg:p-8"
            >
              <div className={`grid grid-cols-1 ${hasFeature('profilePhoto') ? 'lg:grid-cols-2' : ''} gap-8`}>
                {/* Photo Column — only if profilePhoto feature is enabled */}
                {hasFeature('profilePhoto') && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-56 h-56 rounded-2xl bg-gray-50 dark:bg-zinc-950 border-2 border-dashed border-gray-200 dark:border-zinc-800 overflow-hidden relative group shadow-inner">
                      {photoPreview ? (
                        <div className="relative w-full h-full group">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => { setPhotoPreview(null); setPhotoBlob(null); }}
                            className="absolute top-2 right-2 p-1.5 bg-zinc-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                          <FaUser size={32} className="opacity-10" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">Athlete Profile Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 w-full max-w-[224px]">
                      <button
                        onClick={startCamera}
                        type="button"
                        className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md"
                      >
                        <FaCamera /> Capture
                      </button>
                      <label className="flex-1 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-200 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer transition-all border border-gray-100 dark:border-zinc-700">
                        <FaUpload /> Upload
                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                )}

                {/* Identity Form */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                    <FaUser className="text-zinc-900" size={18} /> Identity
                  </h2>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 font-medium text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-16 shrink-0 px-2 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-r-0 border-gray-100 dark:border-zinc-800 rounded-l-xl outline-none focus:border-zinc-900 text-sm font-bold text-center text-gray-600 dark:text-gray-300"
                        placeholder="+91"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-r-xl outline-none focus:border-zinc-900 text-sm font-medium"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">DOB</label>
                    <DatePicker
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="!bg-gray-50 dark:!bg-zinc-950/50 !border-gray-100 dark:!border-zinc-800 !rounded-xl !py-2.5 !pl-9 !pr-3 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2.5 rounded-xl border font-black text-[10px] uppercase transition-all ${gender === g ? 'border-zinc-900 bg-zinc-50 text-zinc-900 dark:bg-zinc-800/50' :
                            'border-gray-50 dark:border-zinc-800 text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Optional Fitness Profile ──
                  Trainers want a baseline at enrollment time. The whole
                  section is optional — the form submits cleanly even if every
                  field stays blank. */}
              <div className="mt-8 pt-6 border-t border-dashed border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                    <FaDumbbell className="text-zinc-900" size={14} /> Fitness Profile
                  </h3>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Optional</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                      <FaWeight size={8} /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 font-medium text-sm"
                      placeholder="e.g. 72"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block flex items-center gap-1">
                      <FaRulerVertical size={8} /> Height (cm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 font-medium text-sm"
                      placeholder="e.g. 175"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Goals <span className="text-gray-300">(select any that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FITNESS_GOAL_OPTIONS.map((g) => {
                      const active = goals.includes(g.key);
                      return (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => toggleGoal(g.key)}
                          className={`px-3 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-wide transition-all ${active
                            ? 'border-zinc-900 bg-zinc-50 text-zinc-900 dark:bg-zinc-800/50'
                            : 'border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-zinc-600'
                            }`}
                        >
                          {g.label}
                        </button>
                      );
                    })}
                  </div>

                  {goals.includes('other') && (
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      maxLength={200}
                      className="mt-3 w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl outline-none focus:border-zinc-900 font-medium text-sm"
                      placeholder="Describe the goal in your own words…"
                    />
                  )}
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-between pt-6 border-t border-gray-50 dark:border-zinc-800 mt-6">
                <div className="flex-1" />
                <div className="flex-1 flex justify-center">{renderStepDots()}</div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={nextStep}
                    type="button"
                    className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all text-[11px]"
                  >
                    Continue <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden p-6 lg:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                    <FaCrown className="text-orange-500" size={18} /> Membership
                  </h2>

                  <div className="space-y-2">
                    {settings?.plans && settings.plans.filter(p => p.isActive).length > 0 ? (
                      settings.plans.filter(p => p.isActive).map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setPlan(p.name)}
                          className={`w-full px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${plan === p.name ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50' : 'border-gray-50 dark:border-zinc-800'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${plan === p.name ? 'bg-zinc-900' : 'bg-gray-200'}`} />
                            <span className={`font-black uppercase tracking-wide text-xs ${plan === p.name ? 'text-zinc-900' : 'text-gray-400'}`}>{p.name}</span>
                          </div>
                          <span className="font-bold text-[11px] text-gray-400">₹{p.price.toLocaleString('en-IN')}</span>
                        </button>
                      ))
                    ) : (
                      ["1-Month", "2-Month", "3-Month", "6-Month", "12-Month"].map((p) => {
                        const price = settings?.subscriptionPrices?.[p];
                        if (!price && price !== 0) return null;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPlan(p)}
                            className={`w-full px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${plan === p ? 'border-zinc-900 bg-zinc-50 dark:bg-zinc-800/50' : 'border-gray-50 dark:border-zinc-800'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${plan === p ? 'bg-zinc-900' : 'bg-gray-200'}`} />
                              <span className={`font-black uppercase tracking-wide text-xs ${plan === p ? 'text-zinc-900' : 'text-gray-400'}`}>{p}</span>
                            </div>
                            <span className="font-bold text-[11px] text-gray-400">₹{price || 0}</span>
                          </button>
                        );
                      })
                    )}

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Start Date</label>
                      <DatePicker
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="!bg-gray-50 dark:!bg-zinc-950/50 !border-gray-100 dark:!border-zinc-800 !rounded-xl !py-2.5 !px-10 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                    <FaMoneyBillWave className="text-green-500" size={18} /> Payment
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Plan (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl font-black text-base outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Admission (₹)</label>
                      <input
                        type="number"
                        value={admissionFee}
                        onChange={(e) => setAdmissionFee(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl font-black text-base outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Discount (₹)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl font-bold text-base text-zinc-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-950/30 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400 font-bold uppercase">Standard</span>
                        <span className="text-gray-900 dark:text-white font-bold">₹{amount}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400 font-bold uppercase">Admission Fee</span>
                        <span className="text-gray-900 dark:text-white font-bold">₹{admissionFee || 0}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-400 font-bold uppercase">Discount</span>
                        <span className="text-zinc-700 font-bold">-₹{discount || 0}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-zinc-900">Total</span>
                        <span className="text-2xl font-black text-zinc-900">₹{parseInt(amount) + parseInt(admissionFee || 0) - parseInt(discount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment status is always set to Pending at enrollment;
                      staff records the actual payment on the next screen
                      (MembershipCard → Mark as Paid flow). */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      Payment will be recorded on the next screen — you can choose Cash, UPI, Card, or split.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-between pt-6 border-t border-gray-50 dark:border-zinc-800 mt-6">
                <div className="flex-1 flex justify-start">
                  <button
                    onClick={prevStep}
                    type="button"
                    className="px-6 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all text-[10px]"
                  >
                    <FaArrowLeft size={10} /> Back
                  </button>
                </div>
                <div className="flex-1 flex justify-center">{renderStepDots()}</div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={nextStep}
                    type="button"
                    className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all text-[11px]"
                  >
                    Review <FaArrowRight size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
                <div className="p-6 lg:p-10 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                      {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <FaUser size={24} className="text-gray-200" />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase leading-tight truncate">{name}</h2>
                      <p className="text-zinc-900 font-bold tracking-widest text-[10px] uppercase mt-0.5 truncate">{gender} • {countryCode}{phone}</p>
                    </div>
                  </div>

                  {/* Additional Demographic Details */}
                  <div className="bg-gray-50 dark:bg-zinc-950/40 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Member Details</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {dob && (
                        <div>
                          <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Date of Birth</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{new Date(dob).toLocaleDateString('en-IN')}</p>
                        </div>
                      )}
                      {!dob && (
                        <p className="text-xs text-gray-400 font-medium italic col-span-2">No additional demographic details provided.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-zinc-950/50 p-5 rounded-2xl">
                    <div className="border-r border-gray-100 dark:border-zinc-800 pr-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Membership Plan</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{plan.toUpperCase()}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Starts {new Date(date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="pl-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Settlement</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">₹{parseInt(amount) + parseInt(admissionFee || 0) - parseInt(discount || 0)}</p>
                      <p className="text-[9px] font-black px-2 py-0.5 rounded-full inline-block mt-1 bg-amber-100 text-amber-700">
                        PENDING — Pay on next screen
                      </p>
                    </div>
                  </div>

                  <div className="hidden lg:block pt-2">
                    <div className="flex justify-center mb-4">{renderStepDots()}</div>
                    <div className="flex gap-3">
                      <button
                        onClick={prevStep}
                        className="flex-1 py-3.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-gray-200 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 text-[10px]"
                      >
                        Modify
                      </button>
                      <button
                        onClick={Submit}
                        disabled={submitting}
                        className="flex-[1.5] py-3.5 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {renderMobileActionBar()}

      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <FaCamera className="text-zinc-700" /> Photo Lab
                </h3>
                <button onClick={stopCamera} className="p-2 text-white/50 hover:text-white transition-colors">
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="relative aspect-square md:aspect-video bg-black overflow-hidden group">
                {!tempCapturedImage ? (
                  <>
                    <video ref={modalVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[300px] h-[300px] border-2 border-white/30 border-dashed rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
                    </div>
                  </>
                ) : (
                  <img src={tempCapturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
                <canvas ref={modalCanvasRef} className="hidden" />
              </div>

              <div className="p-6 bg-slate-900/50 flex items-center justify-center gap-4">
                {!tempCapturedImage ? (
                  <>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 bg-white/5 text-white/70 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={captureFrame}
                      className="px-10 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      Snap
                    </button>
                    <button
                      onClick={switchCamera}
                      className="px-6 py-3 bg-white/5 text-white/70 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                      title="Switch Camera"
                    >
                      <FaSyncAlt size={14} />
                      Flip
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setTempCapturedImage(null)}
                      className="px-6 py-3 bg-white/5 text-white/70 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      Retake
                    </button>
                    <button
                      onClick={saveCroppedPhoto}
                      className="px-10 py-3 bg-green-500 text-white hover:bg-green-600 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-green-500/20 flex items-center gap-2"
                    >
                      <FaCropAlt /> Save & Crop
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NewMember;
