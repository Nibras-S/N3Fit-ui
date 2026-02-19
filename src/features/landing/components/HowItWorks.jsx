import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            num: "01",
            icon: "ri-settings-3-line",
            title: "Set Up Your Fit Club",
            desc: "Configure your fit club profile, membership plans, and staff roles in under 10 minutes.",
            color: "from-blue-400 to-blue-500"
        },
        {
            num: "02",
            icon: "ri-user-add-line",
            title: "Add Members",
            desc: "Import existing members via Excel or register new ones with a quick digital form.",
            color: "from-blue-500 to-blue-600"
        },
        {
            num: "03",
            icon: "ri-rocket-2-line",
            title: "Automate & Grow",
            desc: "Let N3 handle billing, reminders, and analytics while you focus on scaling your business.",
            color: "from-blue-600 to-indigo-600"
        }
    ];

    return (
        <section className="py-24 bg-white" id="how-it-works">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Getting Started</span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                        Go Live in{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">3 Simple Steps</span>
                    </h2>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">No credit card. No complex setup. Be running in minutes.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-4xl mx-auto">
                    {/* Connecting line */}
                    <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-300 z-0 rounded-full"></div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center relative z-10"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/20`}
                            >
                                <i className={`${step.icon} text-white text-3xl md:text-4xl`}></i>
                            </motion.div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 block">Step {step.num}</span>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                            <p className="text-slate-500 text-sm px-2 leading-relaxed">
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
