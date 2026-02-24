import React from 'react';
import { motion } from 'framer-motion';
import SplitText from './SplitText';

const HowItWorks = () => {
    const steps = [
        {
            num: "01",
            icon: "ri-settings-3-line",
            title: "Set Up Your Fit Club",
            desc: "Configure your fit club profile, membership plans, and staff roles in under 10 minutes.",
        },
        {
            num: "02",
            icon: "ri-user-add-line",
            title: "Add Members",
            desc: "Import existing members via Excel or register new ones with a quick digital form.",
        },
        {
            num: "03",
            icon: "ri-rocket-2-line",
            title: "Automate & Grow",
            desc: "Let N3 handle billing, reminders, and analytics while you focus on scaling your business.",
        }
    ];

    return (
        <section className="py-24" id="how-it-works" style={{ background: '#0a0a0a' }}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#00d4ff' }}>
                        Getting Started
                    </span>
                    <div className="mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                        <SplitText
                            text="GO LIVE IN"
                            className="text-3xl md:text-5xl font-extrabold text-white mr-3 block md:inline-block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="h2"
                        />
                        <SplitText
                            text="3 SIMPLE STEPS"
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
                    <p className="text-lg max-w-xl mx-auto" style={{ color: '#666' }}>No credit card. No complex setup. Be running in minutes.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
                    {/* Connecting line — behind icons */}
                    <div
                        className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] rounded-full"
                        style={{
                            background: 'linear-gradient(to right, rgba(0,212,255,0.1), rgba(0,212,255,0.3), rgba(0,212,255,0.1))',
                            zIndex: 0,
                        }}
                    ></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center relative" style={{ zIndex: 1 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center mx-auto mb-8"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(64,64,224,0.15), rgba(0,212,255,0.15))',
                                    border: '1px solid rgba(0,212,255,0.12)',
                                }}
                            >
                                <i className={`${step.icon} text-3xl md:text-4xl`} style={{ color: '#00d4ff' }}></i>
                            </motion.div>
                            <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: '#00d4ff', opacity: 0.6 }}>
                                Step {step.num}
                            </span>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                                {step.title}
                            </h3>
                            <p className="text-sm px-2 leading-relaxed" style={{ color: '#666' }}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
