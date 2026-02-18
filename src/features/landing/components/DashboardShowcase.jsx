import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Animated Number ─── */
function AnimNum({ end, suffix = '', prefix = '' }) {
    const [val, setVal] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let cur = 0;
        const step = end / 60;
        const id = setInterval(() => {
            cur += step;
            if (cur >= end) { setVal(end); clearInterval(id); }
            else setVal(Math.floor(cur));
        }, 16);
        return () => clearInterval(id);
    }, [inView, end]);

    return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

const DashboardShowcase = () => {
    const dashboardStats = [
        { label: 'Revenue Growth', value: 32, suffix: '%', prefix: '+', icon: 'ri-arrow-up-line', color: 'text-green-500 bg-green-50' },
        { label: 'Retention Rate', value: 94, suffix: '%', prefix: '', icon: 'ri-heart-line', color: 'text-blue-500 bg-blue-50' },
        { label: 'Members Added', value: 248, suffix: '', prefix: '+', icon: 'ri-user-add-line', color: 'text-indigo-500 bg-indigo-50' },
    ];

    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Real-time Insights</span>
                            <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                                Make Data-Driven Decisions,{' '}
                                <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Not Guesses</span>
                            </h2>
                            <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                                Track every metric that matters — revenue, retention, staff efficiency — all from one beautiful dashboard updated in real-time.
                            </p>
                        </motion.div>

                        {/* Animated stat cards */}
                        <div className="space-y-4">
                            {dashboardStats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.15 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl flex-shrink-0`}>
                                        <i className={stat.icon}></i>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                                        <p className="text-2xl font-extrabold text-slate-900 font-display">
                                            <AnimNum end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                        </p>
                                    </div>
                                    <div className="w-16 h-8">
                                        {/* Mini sparkline visual */}
                                        <svg viewBox="0 0 64 32" fill="none" className="w-full h-full">
                                            <polyline
                                                points="0,28 12,22 24,25 36,15 48,18 64,6"
                                                stroke="#3b82f6"
                                                strokeWidth="2.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                            <polygon
                                                points="0,28 12,22 24,25 36,15 48,18 64,6 64,32 0,32"
                                                fill={`url(#grad-${i})`}
                                            />
                                        </svg>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Image */}
                    <motion.div
                        className="lg:w-1/2 relative"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/10 rounded-3xl blur-2xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                            alt="Analytics Dashboard"
                            className="relative rounded-2xl shadow-2xl border border-slate-200/60"
                        />
                        {/* Floating alert */}
                        <motion.div
                            className="absolute top-8 -left-8 bg-white p-4 rounded-xl shadow-xl border border-blue-100 hidden md:block"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                                    <i className="ri-alarm-warning-line"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">5 Memberships Expiring</p>
                                    <p className="text-[10px] text-slate-400">Action Required Today</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default DashboardShowcase;
