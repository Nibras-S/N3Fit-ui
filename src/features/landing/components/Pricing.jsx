import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Pricing = () => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Starter",
            monthly: "999",
            yearly: "9,990",
            currency: "₹",
            tagline: "Perfect for small gyms",
            features: [
                "Up to 100 Members",
                "Basic Dashboard",
                "Attendance Tracking",
                "Payment Reminders",
                "Email Support",
            ],
            cta: "Start Free Trial",
            popular: false,
            icon: "ri-leaf-line",
        },
        {
            name: "Professional",
            monthly: "2,499",
            yearly: "24,990",
            currency: "₹",
            tagline: "Most popular for growing gyms",
            features: [
                "Unlimited Members",
                "Advanced Analytics",
                "WhatsApp Integration",
                "Staff Management",
                "Expense Tracking",
                "Invoice Generation",
                "Priority Support",
            ],
            cta: "Start Pro Trial",
            popular: true,
            icon: "ri-vip-crown-line",
        },
        {
            name: "Enterprise",
            monthly: "4,999",
            yearly: "49,990",
            currency: "₹",
            tagline: "For multi-branch chains",
            features: [
                "Multi-Branch Support",
                "White-label Dashboard",
                "Dedicated Account Manager",
                "Custom Reports & API",
                "24/7 Priority Support",
                "Data Migration Support",
            ],
            cta: "Contact Sales",
            popular: false,
            icon: "ri-building-2-line",
        }
    ];

    return (
        <section className="py-24 bg-slate-50" id="pricing">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Pricing</span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Simple, Transparent{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Pricing</span>
                    </h2>
                    <p className="text-lg text-slate-500 mb-8">
                        Choose the plan that fits your gym. No hidden fees. Cancel anytime.
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex bg-white rounded-full p-1.5 border border-slate-200 relative shadow-sm">
                        <div
                            className={`absolute top-1.5 h-[calc(100%-12px)] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 shadow-md ${isYearly ? 'left-[50%] w-[50%]' : 'left-1.5 w-[50%]'
                                }`}
                            style={{ width: 'calc(50% - 6px)' }}
                        ></div>
                        <button
                            className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}
                            onClick={() => setIsYearly(false)}
                        >
                            Monthly
                        </button>
                        <button
                            className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}
                            onClick={() => setIsYearly(true)}
                        >
                            Yearly <span className="text-[10px] ml-1 bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-bold">SAVE 20%</span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className={`relative p-8 rounded-2xl border transition-all duration-300 ${plan.popular
                                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-500 shadow-2xl shadow-blue-500/30 scale-[1.03] z-10'
                                    : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-lg'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${plan.popular ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-500'
                                }`}>
                                <i className={plan.icon}></i>
                            </div>

                            <h3 className={`text-2xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                            <p className={`text-sm mb-5 ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>{plan.tagline}</p>

                            <div className="flex items-baseline mb-6">
                                <span className={`text-4xl font-extrabold font-display ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.currency}{isYearly ? plan.yearly : plan.monthly}
                                </span>
                                <span className={`ml-2 ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>
                                    /{isYearly ? 'year' : 'month'}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className={`flex items-start gap-2.5 text-sm ${plan.popular ? 'text-blue-100' : 'text-slate-600'}`}>
                                        <i className={`ri-check-line mt-0.5 font-bold ${plan.popular ? 'text-blue-200' : 'text-blue-500'}`}></i>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3.5 rounded-xl font-bold transition-all ${plan.popular
                                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                                    : 'bg-slate-900 text-white hover:bg-blue-600 shadow-md'
                                }`}>
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
