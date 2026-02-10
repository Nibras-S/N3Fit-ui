import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    {
        id: 1,
        name: "Alex Thompson",
        role: "Director, Pulse Athletics",
        image: "https://randomuser.me/api/portraits/men/12.jpg",
        text: "The transition to N3 was seamless. Its intelligent dashboard gives us insights we never had before. It's the ChatGPT of gym management.",
        metric: "32% ROI Boost"
    },
    {
        id: 2,
        name: "Elena Vance",
        role: "Founder, Nova Yoga",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
        text: "The branded app feels so premium. Our members love tracking their progress and booking classes. It's truly elevated our brand presence.",
        metric: "98% Satisfaction"
    }
];

export default function SocialProof() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex(p => (p + 1) % testimonials.length), 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="section__container" style={{ padding: '10rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h2 className="section__header">Trusted by <span className="text-gradient">Visionaries.</span></h2>
                <p className="section__subheader">Join the world's most innovative studios using N3.</p>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.98 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="floating-card"
                        style={{ padding: '6rem 4rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}
                    >
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                {[1, 2, 3, 4, 5].map(i => <i key={i} className="ri-star-fill" style={{ color: 'var(--accent-indigo)', fontSize: '1.5rem' }}></i>)}
                            </div>
                            <p style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '3rem', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
                                "{testimonials[index].text}"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <img src={testimonials[index].image} alt={testimonials[index].name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: 'var(--shadow-floating)' }} />
                                <div>
                                    <h4 style={{ fontWeight: '900', fontSize: '1.25rem' }}>{testimonials[index].name}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{testimonials[index].role}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div className="pulse" style={{ fontSize: '5rem', fontWeight: '900', color: 'var(--accent-indigo)', letterSpacing: '-0.05em' }}>
                                {testimonials[index].metric.split(' ')[0]}
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', maxWidth: '180px', margin: '0 auto', color: 'var(--text-main)' }}>
                                {testimonials[index].metric.split(' ').slice(1).join(' ')}
                            </div>

                            {/* Decorative background circle */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', background: 'var(--accent-indigo)', filter: 'blur(100px)', opacity: '0.1', zIndex: -1 }}></div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
