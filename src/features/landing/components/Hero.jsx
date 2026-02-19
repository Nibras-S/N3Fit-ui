import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const Hero = () => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) controls.start('visible');
    }, [controls, isInView]);

    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % 4);
        }, 4000); // Change image every 4 seconds
        return () => clearInterval(timer);
    }, []);

    const stats = [
        { value: 500, suffix: '+', label: 'Active Clubs' },
        { value: 50000, suffix: '+', label: 'Members Managed' },
        { value: 99.9, suffix: '%', label: 'Uptime SLA' },
        { value: 4.9, suffix: '★', label: 'Rating' },
    ];

    return (
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 -z-20">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2670"
                    alt="Fit Club Background"
                    className="w-full h-full object-cover opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/90 to-white/60"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-8 border border-blue-200/50">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            #1 Rated Fitness Management Platform
                        </span>

                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Run Your Fit Club Like a
                            <span className="block bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                                Modern Business
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Automate billing, track attendance, boost retention, and grow your revenue — all from one beautiful dashboard. Built for fit club owners, not IT experts.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30"
                            >
                                <i className="ri-rocket-2-line mr-2"></i>
                                Start Free Trial
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                <i className="ri-play-circle-line mr-2"></i>
                                Watch Demo
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Live Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto mb-16"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display">
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm text-slate-400 font-medium mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Dashboard Mockup */}
                    <motion.div
                        ref={ref}
                        initial="hidden"
                        animate={controls}
                        variants={{
                            hidden: { opacity: 0, y: 80, rotateX: 15 },
                            visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1, ease: "easeOut" } }
                        }}
                        style={{ perspective: '1200px' }}
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white aspect-[16/10] bg-slate-100 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none z-10"></div>

                            {/* Slideshow */}
                            {[
                                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2670", // Fit Club Interior
                                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2670", // Dark Fit Club
                                "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=2670", // Weights
                                "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=2670"  // Cardio
                            ].map((img, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: index === currentImage ? 1 : 0,
                                        scale: index === currentImage ? 1.05 : 1
                                    }}
                                    transition={{
                                        opacity: { duration: 1.5, ease: "easeInOut" },
                                        scale: { duration: 6, ease: "linear" }
                                    }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <img
                                        src={img}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ))}

                            {/* Floating Revenue Card */}
                            <motion.div
                                className="absolute -right-6 lg:-right-12 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-blue-100 hidden lg:block z-20"
                                animate={{ y: [0, -12, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                        <i className="ri-arrow-up-line text-lg font-bold"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">Monthly Revenue</p>
                                        <p className="font-bold text-slate-900">₹4,25,000</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Members Card */}
                            <motion.div
                                className="absolute -left-6 lg:-left-12 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-blue-100 hidden lg:block z-20"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                        <i className="ri-user-add-line text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium">New Members</p>
                                        <p className="font-bold text-slate-900">+124 this month</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Blue gradient decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-400/[0.05] rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-300/[0.03] rounded-full blur-3xl"></div>
            </div>
        </section>
    );
};

export default Hero;
