import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        {
            icon: "ri-user-star-line",
            title: "Member Management",
            desc: "360° member profiles with history, payments, and health stats in one view.",
            color: "from-blue-500 to-blue-600"
        },
        {
            icon: "ri-bank-card-line",
            title: "Billing Automation",
            desc: "Auto-renewals, GST invoices, and multi-mode payment tracking.",
            color: "from-blue-400 to-blue-500"
        },
        {
            icon: "ri-whatsapp-line",
            title: "WhatsApp Reminders",
            desc: "Automated renewal alerts, birthday wishes & bulk announcements.",
            color: "from-blue-500 to-indigo-500"
        },
        {
            icon: "ri-user-settings-line",
            title: "Staff Management",
            desc: "Role-based access, staff permissions, and performance tracking.",
            color: "from-indigo-400 to-blue-500"
        },
        {
            icon: "ri-store-2-line",
            title: "Multi-Branch Ready",
            desc: "Manage multiple locations from a single super admin dashboard.",
            color: "from-blue-600 to-blue-700"
        },
        {
            icon: "ri-pie-chart-line",
            title: "Advanced Analytics",
            desc: "Real-time revenue, retention, and growth reports at a glance.",
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: "ri-money-rupee-circle-line",
            title: "Expense Tracking",
            desc: "Track expenses, profit/loss, and get financial clarity instantly.",
            color: "from-blue-400 to-blue-600"
        },
        {
            icon: "ri-notification-3-line",
            title: "Smart Notifications",
            desc: "Real-time alerts for expirations, payments, and important updates.",
            color: "from-indigo-500 to-blue-600"
        }
    ];

    return (
        <section className="py-24 bg-white" id="features">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Powerful Features</span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Everything to Run a{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">World-Class Fit Club</span>
                    </h2>
                    <p className="text-lg text-slate-500">
                        Powerful automation packed into a simple, intuitive interface — designed for fit club owners, not IT experts.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.4 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            className="relative p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all duration-300 group cursor-default"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white text-xl mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                                <i className={feature.icon}></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
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
