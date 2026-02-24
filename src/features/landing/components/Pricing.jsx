import React from 'react';
import { motion } from 'framer-motion';
import SplitText from './SplitText';

const Pricing = () => {
    const plans = [
        {
            name: "Basic",
            price: "5,999",
            currency: "₹",
            tagline: "Perfect for small gyms",
            features: [
                "Up to 100 Members",
                "Basic Dashboard",
                "Attendance Tracking",
                "Payment Reminders",
                "Email Support",
            ],
            cta: "Get Started",
            popular: false,
            icon: "ri-leaf-line",
        },
        {
            name: "Professional",
            price: "7,999",
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
            cta: "Start Pro Plan",
            popular: true,
            icon: "ri-vip-crown-line",
        },
        {
            name: "Premium",
            price: "30,000",
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
        <section className="py-24" id="pricing" style={{ background: '#0f0f0f' }}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#00d4ff' }}>
                        Pricing
                    </span>
                    <div className="mb-6" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                        <SplitText
                            text="SIMPLE, TRANSPARENT"
                            className="text-3xl md:text-5xl font-extrabold text-white mr-3 block md:inline-block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="h2"
                        />
                        <SplitText
                            text="PRICING"
                            className="text-3xl md:text-5xl font-extrabold block md:inline-block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="span"
                            style={{
                                background: 'linear-gradient(135deg, #4040e0, #00e5ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        />
                    </div>
                    <p className="text-lg mb-4" style={{ color: '#666' }}>
                        Choose the plan that fits your gym. No hidden fees. Cancel anytime.
                    </p>
                    <p className="text-sm" style={{ color: '#555' }}>
                        All plans are billed yearly.
                    </p>
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
                            className={`relative p-8 rounded-2xl transition-all duration-300 ${plan.popular ? 'scale-[1.03] z-10' : ''}`}
                            style={{
                                background: plan.popular
                                    ? 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))'
                                    : 'rgba(255,255,255,0.03)',
                                border: plan.popular
                                    ? '1px solid rgba(0,212,255,0.3)'
                                    : '1px solid rgba(255,255,255,0.06)',
                                boxShadow: plan.popular
                                    ? '0 4px 20px rgba(0,0,0,0.3)'
                                    : 'none',
                            }}
                        >
                            {plan.popular && (
                                <div
                                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    style={{
                                        background: 'linear-gradient(135deg, #4040e0, #00d4ff)',
                                        color: '#ffffff',
                                    }}
                                >
                                    Most Popular
                                </div>
                            )}

                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4"
                                style={{
                                    background: plan.popular ? 'linear-gradient(135deg, rgba(64,64,224,0.15), rgba(0,212,255,0.15))' : 'rgba(255,255,255,0.05)',
                                    color: plan.popular ? '#00d4ff' : '#888',
                                }}
                            >
                                <i className={plan.icon}></i>
                            </div>

                            <h3 className="text-2xl font-bold mb-1" style={{ color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                                {plan.name}
                            </h3>
                            <p className="text-sm mb-5" style={{ color: '#555' }}>{plan.tagline}</p>

                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold" style={{ color: plan.popular ? '#00d4ff' : '#fff', fontFamily: "'Outfit', sans-serif" }}>
                                    {plan.currency}{plan.price}
                                </span>
                                <span className="ml-2" style={{ color: '#555' }}>
                                    /year
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#888' }}>
                                        <i className="ri-check-line mt-0.5 font-bold" style={{ color: '#00d4ff' }}></i>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="w-full py-3.5 rounded-xl font-bold transition-all"
                                style={{
                                    background: plan.popular ? 'linear-gradient(135deg, #4040e0, #00d4ff)' : 'rgba(255,255,255,0.06)',
                                    color: plan.popular ? '#ffffff' : '#fff',
                                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: plan.popular ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (!plan.popular) {
                                        e.target.style.background = 'rgba(0,212,255,0.1)';
                                        e.target.style.borderColor = 'rgba(0,212,255,0.3)';
                                        e.target.style.color = '#00d4ff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!plan.popular) {
                                        e.target.style.background = 'rgba(255,255,255,0.06)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.color = '#fff';
                                    }
                                }}
                            >
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
