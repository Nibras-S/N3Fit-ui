import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import SplitText from './SplitText';


/* ─── Animated Counter ─── */
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

    const stats = [
        { value: 500, suffix: '+', label: 'Active Clubs' },
        { value: 50000, suffix: '+', label: 'Members Managed' },
        { value: 99.9, suffix: '%', label: 'Uptime SLA' },
        { value: 4.9, suffix: '★', label: 'Rating' },
    ];

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#050505' }}>
            {/* Background Video/Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2670"
                    alt="Fitness Background"
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.15, filter: 'grayscale(30%)' }}
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.4) 50%, rgba(10,10,10,1) 100%)'
                }}></div>
            </div>



            <div className="container mx-auto px-4 relative z-10 pt-32 pb-20 lg:pt-40 lg:pb-32">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >

                        {/* Headline */}
                        <div className="mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            <SplitText
                                text="MANAGE YOUR"
                                className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight block text-white"
                                delay={50}
                                duration={1.25}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                tag="h1"
                            />
                            <SplitText
                                text="FITNESS EMPIRE"
                                className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight block"
                                delay={50}
                                duration={1.25}
                                ease="power3.out"
                                splitType="chars"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                tag="span"
                                style={{
                                    background: 'linear-gradient(135deg, #4040e0, #00e5ff, #4040e0)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            />
                        </div>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
                            style={{ color: '#888' }}
                        >
                            Automate billing, track attendance, boost retention, and grow your revenue — all from one powerful dashboard. Built for fit club owners, not IT experts.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                        >
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #4040e0, #00d4ff)',
                                    color: '#ffffff',
                                }}
                            >
                                <i className="ri-rocket-2-line mr-2"></i>
                                Start Free Trial
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#e0e0e0',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <i className="ri-play-circle-line mr-2"></i>
                                Watch Demo
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-extrabold font-display" style={{ color: '#00d4ff', fontFamily: "'Outfit', sans-serif" }}>
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm mt-1" style={{ color: '#555' }}>{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 z-10" style={{
                background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)'
            }}></div>
        </section>
    );
};

export default Hero;
