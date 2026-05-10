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
        { label: 'Revenue Growth', value: 32, suffix: '%', prefix: '+', icon: 'ri-arrow-up-line', color: '#00d4ff' },
        { label: 'Retention Rate', value: 94, suffix: '%', prefix: '', icon: 'ri-heart-line', color: '#00d4ff' },
        { label: 'Members Added', value: 248, suffix: '', prefix: '+', icon: 'ri-user-add-line', color: '#00d4ff' },
    ];

    return (
        <section className="py-24 overflow-hidden" style={{ background: '#0f0f0f' }}>
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#00d4ff' }}>
                                Real-time Insights
                            </span>
                            <h2
                                className="text-3xl md:text-5xl font-extrabold mb-6"
                                style={{ fontFamily: "'Outfit', sans-serif", color: '#fff', letterSpacing: '-0.03em' }}
                            >
                                MAKE DATA-DRIVEN DECISIONS,{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #4040e0, #00e5ff)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    NOT GUESSES
                                </span>
                            </h2>
                            <p className="text-lg mb-10 leading-relaxed" style={{ color: '#a3a3a3' }}>
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
                                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, rgba(64,64,224,0.12), rgba(0,212,255,0.12))', color: '#00d4ff' }}
                                    >
                                        <i className={stat.icon}></i>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>{stat.label}</p>
                                        <p className="text-2xl font-extrabold" style={{ color: '#00d4ff', fontFamily: "'Outfit', sans-serif" }}>
                                            <AnimNum end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                                        </p>
                                    </div>
                                    <div className="w-16 h-8">
                                        <svg viewBox="0 0 64 32" fill="none" className="w-full h-full">
                                            <polyline
                                                points="0,28 12,22 24,25 36,15 48,18 64,6"
                                                stroke="#00d4ff"
                                                strokeWidth="2.5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
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
                        {/* Background behind image */}
                        <div
                            className="absolute -inset-6 rounded-3xl"
                            style={{ background: 'rgba(0,212,255,0.02)' }}
                        ></div>
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
                            alt="Analytics Dashboard"
                            width={1200}
                            height={750}
                            loading="lazy"
                            decoding="async"
                            className="relative rounded-2xl shadow-2xl w-full h-auto"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        {/* Floating alert */}
                        <motion.div
                            className="absolute top-8 -left-8 p-4 rounded-xl shadow-xl hidden md:block"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                background: 'rgba(15,15,15,0.95)',
                                border: '1px solid rgba(0,212,255,0.15)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(64,64,224,0.12), rgba(0,212,255,0.12))', color: '#00d4ff' }}
                                >
                                    <i className="ri-alarm-warning-line"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold" style={{ color: '#fff' }}>5 Memberships Expiring</p>
                                    <p className="text-[10px]" style={{ color: '#9ca3af' }}>Action Required Today</p>
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
