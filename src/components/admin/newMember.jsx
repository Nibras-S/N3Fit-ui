import React, { useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaMale, FaFemale } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import PageHeader from '../ui/PageHeader';

function NewMember() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [plan, setPlan] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [gender, setGender] = useState("");

  // Payment State
  const [amount, setAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [settings, setSettings] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch Settings
  React.useEffect(() => {
    axios.get(`${backendUrl}/api/settings`)
      .then(res => setSettings(res.data))
      .catch(err => console.error("Failed to fetch settings", err));
  }, [backendUrl]);

  // Auto-fill amount when plan changes
  React.useEffect(() => {
    if (plan && settings?.subscriptionPrices) {
      const price = settings.subscriptionPrices[plan] || 0;
      setAmount(price);
    }
  }, [plan, settings]);

  const Submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) { toast.error('Enter name'); return; }
    if (!phone || phone.length < 10) { toast.error('Enter phone'); return; }
    if (!plan) { toast.error('Select plan'); return; }
    if (!gender) { toast.error('Select gender'); return; }
    if (!date) { toast.error('Select date'); return; }

    setSubmitting(true);

    let daysToAdd = plan === "1-Month" ? 30 : plan === "2-Month" ? 60 : 90;
    const startDate = new Date(date);
    const expirationDate = new Date(startDate);
    expirationDate.setDate(startDate.getDate() + daysToAdd);
    const dews = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));

    try {
      await axios.post(`${backendUrl}/api/contacts/`, {
        name, phone, plan, date, gender, dews,
        status: dews >= 0 ? "Active" : "InActive",
        amount: parseInt(amount) - parseInt(discount || 0), // Calculate final amount
        discount: parseInt(discount || 0),
        paymentMethod,
        paymentStatus
      });
      toast.success('Added successfully!');
      setTimeout(() => navigate('/active'), 1000);
    } catch (err) {
      toast.error('Failed to add');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-3 lg:p-4">
      <Toaster position="top-center" />

      {submitting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center gap-3 shadow-xl border border-gray-100 dark:border-slate-700">
            <div className="loading-spinner border-blue-500 border-t-transparent"></div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">Adding...</span>
          </div>
        </div>
      )}

      <div className="max-w-sm mx-auto">
        {/* Page Header */}
        <PageHeader
          title="Add Member"
          gender={gender}
        />

        {/* Form - Compact */}
        <form onSubmit={Submit} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3 transition-colors">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
            <PhoneInput
              country="in"
              value={phone}
              onlyCountries={['in']}
              onChange={(value) => setPhone(value)}
              containerClass="w-full"
              inputClass="!w-full !py-2 !px-3 !rounded-lg !bg-gray-50 dark:!bg-slate-700 !border-gray-200 dark:!border-slate-600 !text-gray-900 dark:!text-white !text-sm focus:!border-blue-500 dark:focus:!border-blue-400"
              buttonClass="!bg-gray-50 dark:!bg-slate-700 !border-gray-200 dark:!border-slate-600 !rounded-l-lg"
              dropdownClass="!bg-white dark:!bg-slate-800 !text-gray-900 dark:!text-white"
            />
          </div>

          {/* Gender - Inline */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('Male')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-all ${gender === 'Male'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
              >
                <FaMale /> Male
              </button>
              <button
                type="button"
                onClick={() => setGender('Female')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-all ${gender === 'Female'
                  ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-medium'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
              >
                <FaFemale /> Female
              </button>
            </div>
          </div>

          {/* Plan - Inline pills */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Plan</label>
            <div className="flex gap-2">
              {["1-Month", "2-Month", "3-Month"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`flex-1 py-2 rounded-lg border text-sm transition-all ${plan === p
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>


          {/* Payment Section */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Amount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Discount</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">₹</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 ${paymentStatus === 'Paid' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white'
                  }`}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Start Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 cursor-pointer outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <FaUserPlus className="text-sm" />
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewMember;
