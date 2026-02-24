import React from 'react';
import { motion } from 'framer-motion';
import SplitText from './SplitText';

const Features = () => {
    const features = [
        {
            icon: "ri-user-star-line",
            title: "Member Management",
            desc: "360° member profiles with history, payments, and health stats in one view.",
        },
        {
            icon: "ri-bank-card-line",
            title: "Billing Automation",
            desc: "Auto-renewals, GST invoices, and multi-mode payment tracking.",
        },
        {
            icon: "ri-whatsapp-line",
            title: "WhatsApp Reminders",
            desc: "Automated renewal alerts, birthday wishes & bulk announcements.",
        },
        {
            icon: "ri-user-settings-line",
            title: "Staff Management",
            desc: "Role-based access, staff permissions, and performance tracking.",
        },
        {
            icon: "ri-store-2-line",
            title: "Multi-Branch Ready",
            desc: "Manage multiple locations from a single super admin dashboard.",
        },
        {
            icon: "ri-pie-chart-line",
            title: "Advanced Analytics",
            desc: "Real-time revenue, retention, and growth reports at a glance.",
        },
        {
            icon: "ri-money-rupee-circle-line",
            title: "Expense Tracking",
            desc: "Track expenses, profit/loss, and get financial clarity instantly.",
        },
        {
            icon: "ri-notification-3-line",
            title: "Smart Notifications",
            desc: "Real-time alerts for expirations, payments, and important updates.",
        }
    ];

    return (
        <section className="py-24" id="features" style={{ background: '#0a0a0a' }}>
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-sm font-semibold tracking-widest uppercase mb-4 block" style={{ color: '#00d4ff' }}>
                        Powerful Features
                    </span>
                    <div className="mb-6" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                        <SplitText
                            text="EVERYTHING TO RUN A"
                            className="text-3xl md:text-5xl font-extrabold text-white mr-3 block md:inline-block"
                            delay={30} duration={1} ease="power3.out" splitType="chars"
                            from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                            tag="h2"
                        />
                        <SplitText
                            text="WORLD-CLASS FIT CLUB"
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
                    <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.7 }}>
                        Powerful automation packed into a simple, intuitive interface — designed for fit club owners, not IT experts.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.4 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6, borderColor: 'rgba(0,212,255,0.15)' }}
                            className="relative p-6 rounded-2xl transition-all duration-300 group cursor-default"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >

                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 transition-transform group-hover:scale-110"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(64,64,224,0.15), rgba(0,212,255,0.15))',
                                    color: '#00d4ff',
                                }}
                            >
                                <i className={feature.icon}></i>
                            </div>
                            <h3 className="text-lg font-bold mb-2 transition-colors" style={{ color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
