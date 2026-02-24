import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplitText from './SplitText';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "Is N3 Fit cloud-based?",
            a: "Yes! N3 Fit is 100% cloud-based. Access your gym's data from any device — laptop, tablet, or phone — securely from anywhere."
        },
        {
            q: "Does N3 Fit support multi-branch gyms?",
            a: "Absolutely! Our Premium plan supports unlimited branches. Manage all locations from a single Super Admin dashboard with per-branch analytics."
        },
        {
            q: "Can I migrate data from Excel or another software?",
            a: "Yes, we offer free CSV/Excel data import. Upload your member list and N3 Fit auto-maps the fields. Our team assists with complex migrations."
        },
        {
            q: "How does the WhatsApp integration work?",
            a: "N3 Fit connects to the WhatsApp Cloud API to send automated renewal reminders, bulk announcements, and personalized birthday wishes — all from your dashboard."
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
        <section className="py-24" id="faq" style={{ background: '#0f0f0f' }}>
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#00d4ff' }}>
                        FAQ
                    </span>
                    <div className="mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                        <SplitText
                            text="GOT QUESTIONS?"
                            className="text-3xl md:text-5xl font-extrabold text-white block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="h2"
                        />
                    </div>
                    <p className="text-lg" style={{ color: '#666' }}>Everything you need to know about N3 Fit.</p>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="rounded-xl transition-all duration-200"
                            style={{
                                background: activeIndex === index ? 'rgba(0,212,255,0.03)' : 'rgba(255,255,255,0.03)',
                                border: activeIndex === index
                                    ? '1px solid rgba(0,212,255,0.15)'
                                    : '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <button
                                className="w-full text-left p-5 flex justify-between items-center focus:outline-none gap-4"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="font-semibold text-[15px]" style={{ color: '#e0e0e0' }}>{faq.q}</span>
                                <span
                                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                                    style={{
                                        background: activeIndex === index ? '#00d4ff' : 'rgba(255,255,255,0.05)',
                                        color: activeIndex === index ? '#ffffff' : '#666',
                                        transform: activeIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                                    }}
                                >
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
                                        <div
                                            className="px-5 pb-5 text-sm leading-relaxed pt-4"
                                            style={{ color: '#888', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                                        >
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
