import React from 'react';
import { motion } from 'framer-motion';

const Problem = () => {
    const problems = [
        {
            icon: "ri-file-list-3-line",
            title: "Manual Tracking",
            description: "Hours wasted on paper registers and spreadsheets that are error-prone and impossible to scale.",
            stat: "20+ hrs/week",
            statLabel: "wasted on admin"
        },
        {
            icon: "ri-money-dollar-circle-line",
            title: "Revenue Leakage",
            description: "Missed renewals, forgotten payments, and unclear billing lead to thousands in lost revenue monthly.",
            stat: "₹50K+",
            statLabel: "avg. monthly loss"
        },
        {
            icon: "ri-user-unfollow-line",
            title: "Member Churn",
            description: "Without engagement tracking and reminders, members silently cancel and never return.",
            stat: "30%",
            statLabel: "avg. annual churn"
        },
        {
            icon: "ri-bar-chart-2-line",
            title: "Zero Insights",
            description: "Flying blind without data — which plans sell best? Which trainers retain members? No way to know.",
            stat: "0",
            statLabel: "data-driven decisions"
        }
    ];

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">The Problem</span>
                        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-5">
                            Still Running Your Gym on{' '}
                            <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Paper & Excel?</span>
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Manual processes cost gym owners time, money, and members every single day.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <i className={problem.icon}></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{problem.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-5">
                                {problem.description}
                            </p>
                            {/* Dynamic stat */}
                            <div className="pt-4 border-t border-slate-100">
                                <span className="text-2xl font-extrabold text-blue-600 font-display">{problem.stat}</span>
                                <span className="text-xs text-slate-400 ml-2">{problem.statLabel}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Problem;
