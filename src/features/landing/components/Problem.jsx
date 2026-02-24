import React from 'react';
import { motion } from 'framer-motion';
import SplitText from './SplitText';

const Problem = () => {
    const ecosystem = [
        {
            icon: "ri-user-star-line",
            title: "N3 MEMBERS",
            description: "Complete 360° member lifecycle management. Track profiles, history, health stats, and engagement from signup to renewal.",
        },
        {
            icon: "ri-bank-card-line",
            title: "N3 BILLING",
            description: "Automated billing, GST invoicing, payment tracking, and smart renewal reminders. Never miss revenue again.",
        },
        {
            icon: "ri-whatsapp-line",
            title: "N3 CONNECT",
            description: "WhatsApp Cloud API integration for automated renewal alerts, birthday wishes, and bulk announcements.",
        },
        {
            icon: "ri-pie-chart-line",
            title: "N3 ANALYTICS",
            description: "Real-time dashboards with revenue, retention, staff performance, and growth metrics — data-driven decisions.",
        },
        {
            icon: "ri-user-settings-line",
            title: "N3 STAFF",
            description: "Role-based access control, staff performance tracking, permissions management, and trainer scheduling.",
        },
        {
            icon: "ri-store-2-line",
            title: "N3 BRANCHES",
            description: "Multi-location management from a single super admin dashboard. Per-branch analytics and centralized control.",
        },
    ];

    return (
        <section className="py-24 overflow-hidden" style={{ background: '#0f0f0f' }}>
            <div className="container mx-auto px-4">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span
                        className="text-sm font-semibold tracking-widest uppercase mb-4 block"
                        style={{ color: '#00d4ff' }}
                    >
                        Our Ecosystem
                    </span>
                    <div className="mb-5" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                        <SplitText
                            text="ONE PLATFORM."
                            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mr-3 block md:inline-block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="h2"
                        />
                        <SplitText
                            text="INFINITE POWER."
                            className="text-3xl md:text-5xl lg:text-6xl font-extrabold block md:inline-block"
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
                    <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.7 }}>
                        A complete ecosystem of fitness management solutions — everything you need to run, grow, and scale your fitness business.
                    </p>
                </motion.div>

                {/* Horizontal scrolling cards */}
                <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    <style>{`.flex::-webkit-scrollbar { display: none; }`}</style>
                    {ecosystem.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, borderColor: 'rgba(0,212,255,0.25)' }}
                            className="flex-shrink-0 w-[320px] md:w-[350px] p-7 rounded-2xl snap-start transition-all duration-300 cursor-default group"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(64,64,224,0.12), rgba(0,212,255,0.12))',
                                    color: '#00d4ff',
                                }}
                            >
                                <i className={item.icon}></i>
                            </div>
                            <h3 className="text-lg font-bold mb-3 tracking-wide transition-colors" style={{
                                color: '#fff',
                                fontFamily: "'Outfit', sans-serif",
                                letterSpacing: '0.05em',
                            }}>
                                {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Problem;
