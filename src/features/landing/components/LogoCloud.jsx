import React from 'react';

const LogoCloud = () => {
    const brands = [
        'POWERFIT', 'IRON PARADISE', 'YOGA BLISS', 'FITZONE',
        'CROSSFIT ELITE', 'MUSCLE FACTORY', 'BODY RUSH', 'FLEX GYM',
        'POWER HOUSE', 'FIT NATION', 'CORE STRENGTH', 'APEX FITNESS',
    ];

    // Double the brands for seamless infinite scroll
    const marqueeItems = [...brands, ...brands];

    return (
        <section className="py-8 overflow-hidden" style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="relative">
                {/* Gradient fades on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to right, #0a0a0a, transparent)' }}></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to left, #0a0a0a, transparent)' }}></div>

                <div className="marquee-track">
                    {marqueeItems.map((brand, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-8 px-8"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            <span
                                className="text-xl font-bold tracking-widest uppercase"
                                style={{
                                    color: 'rgba(255,255,255,0.12)',
                                    fontFamily: "'Outfit', sans-serif",
                                    letterSpacing: '0.15em',
                                    fontSize: '1.1rem',
                                }}
                            >
                                {brand}
                            </span>
                            <span style={{ color: 'rgba(0,212,255,0.3)', fontSize: '0.5rem' }}>◆</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogoCloud;
