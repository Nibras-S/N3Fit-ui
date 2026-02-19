import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "Is Fit cloud-based?",
            a: "Yes! Fit is 100% cloud-based. Access your gym's data from any device — laptop, tablet, or phone — securely from anywhere."
        },
        {
            q: "Does it support multi-branch gyms?",
            a: "Absolutely! Our Enterprise plan supports unlimited branches. Manage all locations from a single Super Admin dashboard with per-branch analytics."
        },
        {
            q: "Can I migrate data from Excel or another software?",
            a: "Yes, we offer free CSV/Excel data import. Upload your member list and Fit auto-maps the fields. Our team assists with complex migrations."
        },
        {
            q: "How does the WhatsApp integration work?",
            a: "Fit connects to the WhatsApp Cloud API to send automated renewal reminders, bulk announcements, and personalized birthday wishes — all from your dashboard."
        },
        {
            q: "Does it support GST billing?",
            a: "Yes! The billing module generates GST-compliant invoices automatically. You can customize tax rates per service and export financial reports for filing."
        },
        {
            q: "Is there a free trial?",
            a: "Yes, we offer a 14-day free trial on all plans with full access to features. No credit card required. Cancel anytime."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-24 bg-slate-50" id="faq">
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">FAQ</span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                        Got Questions?
                    </h2>
                    <p className="text-lg text-slate-500">Everything you need to know about Fit.</p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className={`bg-white rounded-xl border transition-all duration-200 ${activeIndex === index ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-blue-100'
                                }`}
                        >
                            <button
                                className="w-full text-left p-5 flex justify-between items-center focus:outline-none gap-4"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="font-semibold text-slate-900 text-[15px]">{faq.q}</span>
                                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${activeIndex === index ? 'bg-blue-500 text-white rotate-45' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    <i className="ri-add-line text-lg"></i>
                                </span>
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                                            {faq.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
