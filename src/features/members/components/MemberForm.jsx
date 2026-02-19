import React, { useState, useRef, useEffect } from 'react';
import api from '../../../shared/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  FaUser, FaCamera, FaUpload, FaChevronRight, FaChevronLeft,
  FaCheckCircle, FaTrash, FaIdCard, FaHistory, FaCrown, FaCalendarAlt,
  FaMoneyBillWave, FaArrowLeft, FaArrowRight, FaTimes, FaCropAlt,
  FaMale, FaFemale
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

function NewMember() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [dob, setDob] = useState("");
  const [plan, setPlan] = useState("1-Month");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [gender, setGender] = useState("");

  // Photo State
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Payment State
  const [amount, setAmount] = useState(0);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [settings, setSettings] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { hasFeature } = useAuth();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  useEffect(() => {
    api.get(`${backendUrl}/api/settings`)
      .then(res => {
        // Handle both new { success, data: {...} } and old direct object shapes
        const data = res.data?.data ?? res.data;
        setAdmissionFee(data?.admissionFee || 0);
        setSettings(data);
        // Set default plan to first active plan if available
        if (data?.plans && data.plans.length > 0) {
          const activePlans = data.plans.filter(p => p.isActive);
          if (activePlans.length > 0) {
            setPlan(activePlans[0].name);
          }
        }
      })
      .catch(err => console.error("Failed to fetch settings", err));
  }, [backendUrl]);

  useEffect(() => {
    if (settings?.plans && settings.plans.length > 0) {
      const selectedPlan = settings.plans.find(p => p.name === plan);
      if (selectedPlan) {
        setAmount(selectedPlan.price);
      }
    } else if (plan && settings?.subscriptionPrices) {
      const price = settings.subscriptionPrices[plan] || 0;
      setAmount(price);
    }
  }, [plan, settings]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (modalVideoRef.current && modalVideoRef.current.srcObject) {
        const stream = modalVideoRef.current.srcObject;
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

  // Browser Tab Closure Protection & Cleanup
  useEffect(() => {
    const isDirty = name.trim() !== "" ||
      (phone !== "" && phone !== "") ||
      photoBlob !== null ||
      gender !== "" ||
      dob !== "" ||
      discount !== 0;

    window.isRegistrationDirty = isDirty;

    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.isRegistrationDirty = false;
      // Ensure camera stops on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [name, phone, photoBlob]);

  // Camera Logic
  const startCamera = async () => {
    setIsCameraModalOpen(true);
    setTempCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
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
    formData.append('paymentMethod', paymentMethod);
    formData.append('paymentStatus', paymentStatus);

    if (photoBlob) {
      formData.append('profileImage', photoBlob, 'profile.jpg');
    }

    try {
      await api.post(`${backendUrl}/api/contacts/`, formData);
      toast.success('Member enrolled successfully!');
      setTimeout(() => navigate('/members'), 1500);
    } catch (err) {
      toast.error('Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${step === s ? 'bg-blue-600 text-white scale-105 shadow-md' :
            step > s ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
            }`}>
            {step > s ? <FaCheckCircle size={14} /> : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-green-500' : 'bg-gray-100 dark:bg-slate-700'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-2 lg:p-6 min-h-[85vh] flex flex-col justify-center">
      <Toaster position="top-right" />
      {submitting && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex flex-col items-center justify-center backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-white font-bold uppercase tracking-widest text-[10px]">Processing...</span>
        </div>
      )}

      {renderStepIndicator()}

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden p-6 lg:p-8"
            >
              <div className={`grid grid-cols-1 ${hasFeature('profilePhoto') ? 'lg:grid-cols-2' : ''} gap-8`}>
                {/* Photo Column — only if profilePhoto feature is enabled */}
                {hasFeature('profilePhoto') && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-56 h-56 rounded-2xl bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden relative group shadow-inner">
                      {photoPreview ? (
                        <div className="relative w-full h-full group">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => { setPhotoPreview(null); setPhotoBlob(null); }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
                      >
                        <FaCamera /> Capture
                      </button>
                      <label className="flex-1 py-2.5 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-200 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer transition-all border border-gray-100 dark:border-slate-600">
                        <FaUpload /> Upload
                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                )}

                {/* Identity Form */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                    <FaUser className="text-blue-600" size={18} /> Identity
                  </h2>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium text-sm"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-16 px-2 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-r-0 border-gray-100 dark:border-slate-700 rounded-l-xl outline-none focus:border-blue-500 text-sm font-bold text-center text-gray-600 dark:text-gray-300"
                          placeholder="+91"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-r-xl outline-none focus:border-blue-500 text-sm font-medium"
                          placeholder="9876543210"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">DOB</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Male', 'Female'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2.5 rounded-xl border font-black text-[10px] uppercase transition-all ${gender === g ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                            'border-gray-50 dark:border-slate-800 text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-50 dark:border-slate-700 mt-6">
                <button
                  onClick={nextStep}
                  type="button"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all text-[11px]"
                >
                  Continue <FaArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl overflow-hidden p-6 lg:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                    <FaCrown className="text-orange-500" size={18} /> Membership
                  </h2>

                  <div className="space-y-2">
                    {settings?.plans && settings.plans.length > 0 ? (
                      settings.plans.filter(p => p.isActive).map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setPlan(p.name)}
                          className={`w-full px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${plan === p.name ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-slate-800'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${plan === p.name ? 'bg-blue-500' : 'bg-gray-200'}`} />
                            <span className={`font-black uppercase tracking-wide text-xs ${plan === p.name ? 'text-blue-600' : 'text-gray-400'}`}>{p.name}</span>
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
                            className={`w-full px-5 py-4 rounded-xl border transition-all flex items-center justify-between group ${plan === p ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-slate-800'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${plan === p ? 'bg-blue-500' : 'bg-gray-200'}`} />
                              <span className={`font-black uppercase tracking-wide text-xs ${plan === p ? 'text-blue-600' : 'text-gray-400'}`}>{p}</span>
                            </div>
                            <span className="font-bold text-[11px] text-gray-400">₹{price || 0}</span>
                          </button>
                        );
                      })
                    )}

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-medium outline-none"
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
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl font-black text-base outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Admission (₹)</label>
                      <input
                        type="number"
                        value={admissionFee}
                        onChange={(e) => setAdmissionFee(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl font-black text-base outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Discount (₹)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-xl font-bold text-base text-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
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
                        <span className="text-red-500 font-bold">-₹{discount || 0}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase text-blue-600">Total</span>
                        <span className="text-2xl font-black text-blue-600">₹{parseInt(amount) + parseInt(admissionFee || 0) - parseInt(discount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 p-2.5 rounded-xl outline-none font-bold text-[10px] uppercase"
                    >
                      {["Cash", "UPI", "Card", "Bank Transfer"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={paymentStatus}
                      onChange={e => setPaymentStatus(e.target.value)}
                      className={`p-2.5 rounded-xl border-2 outline-none transition-all font-black text-[10px] uppercase ${paymentStatus === 'Paid' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'}`}
                    >
                      <option value="Paid">PAID</option>
                      <option value="Pending">PENDING</option>
                      <option value="Partial">PARTIAL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-50 dark:border-slate-700 mt-6">
                <button
                  onClick={prevStep}
                  type="button"
                  className="px-6 py-3 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-300 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all text-[10px]"
                >
                  <FaArrowLeft size={10} /> Back
                </button>
                <button
                  onClick={nextStep}
                  type="button"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all text-[11px]"
                >
                  Review <FaArrowRight size={12} />
                </button>
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
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-2xl overflow-hidden">
                <div className="h-2 bg-blue-600 w-full" />
                <div className="p-6 lg:p-10 space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 overflow-hidden shadow-inner flex items-center justify-center">
                      {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <FaUser size={24} className="text-gray-200" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase leading-tight">{name}</h2>
                      <p className="text-blue-600 font-bold tracking-widest text-[10px] uppercase mt-0.5">{gender} • {countryCode}{phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-900/50 p-5 rounded-2xl">
                    <div className="border-r border-gray-100 dark:border-slate-700 pr-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Membership Plan</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{plan.toUpperCase()}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Starts {new Date(date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="pl-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Settlement</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">₹{parseInt(amount) + (settings?.admissionFee || 0) - parseInt(discount || 0)}</p>
                      <p className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {paymentStatus.toUpperCase()} ({paymentMethod.toUpperCase()})
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={prevStep}
                      className="flex-1 py-3.5 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-200 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 text-[10px]"
                    >
                      Modify
                    </button>
                    <button
                      onClick={Submit}
                      className="flex-[1.5] py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 text-[11px]"
                    >
                      Enroll Athlete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
                  <FaCamera className="text-blue-500" /> Photo Lab
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
                      className="px-10 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                    >
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      Take Snap
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
