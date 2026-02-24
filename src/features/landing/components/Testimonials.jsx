import React from 'react';
import { motion, useInView } from 'framer-motion';
import CardSwap, { Card } from './CardSwap';
import SplitText from './SplitText';

const Testimonials = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

    return (
        <section className="py-24" id="testimonials" style={{ background: '#0a0a0a' }}>
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left Side: Header & Context */}
                    <div className="flex-1 text-left w-full lg:w-1/2">
                        <motion.div
                            ref={ref}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mb-6 font-display" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                                <SplitText
                                    text="Trusted by"
                                    className="text-3xl md:text-5xl font-extrabold inline-block mr-3 text-white"
                                    delay={30} duration={1} ease="power3.out" splitType="chars"
                                    from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }} threshold={0.1}
                                    tag="h2"
                                />
                                <SplitText
                                    text="Top Clubs"
                                    className="text-3xl md:text-5xl font-extrabold inline-block"
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
                            <p className="section__subheader text-left mx-0 mb-8 max-w-lg">
                                Join hundreds of fitness centers that have transformed their management with N3 Fit.
                            </p>

                            <div className="flex gap-4 max-w-md">
                                <div className="text-center bg-[#111] border border-white/5 p-4 rounded-xl flex-1">
                                    <div className="text-3xl font-bold text-white mb-1">500+</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Active Clubs</div>
                                </div>
                                <div className="text-center bg-[#111] border border-white/5 p-4 rounded-xl flex-1">
                                    <div className="text-3xl font-bold text-gradient mb-1">98%</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Satisfaction</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: CardSwap Animation */}
                    <div className="flex-1 w-full lg:w-1/2 h-[500px] relative flex justify-center items-center">
                        <CardSwap
                            width={350}
                            height={420}
                            cardDistance={50}
                            verticalDistance={50}
                            delay={4000}
                            pauseOnHover={true}
                        >
                            {/* Card 1: AzeeFit (Requested) */}
                            <Card customClass="glass-dark border border-white/10 p-8 flex flex-col justify-between">
                                <div className="mb-4">
                                    <div className="flex text-[#00d4ff] mb-4 gap-1">
                                        {[...Array(5)].map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                                    </div>
                                    <p className="text-xl text-gray-200 font-medium italic">
                                        "we are using this management for 1 year well satiiesd"
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4040e0] to-[#00d4ff] flex items-center justify-center font-bold text-white text-lg">
                                        A
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Azeez</h4>
                                        <p className="text-sm text-gray-400">Gym Trainer, AzeeFit</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Card 2: German Fitness */}
                            <Card customClass="glass-dark border border-white/10 p-8 flex flex-col justify-between">
                                <div className="mb-4">
                                    <div className="flex text-[#00d4ff] mb-4 gap-1">
                                        {[...Array(5)].map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                                    </div>
                                    <p className="text-xl text-gray-200 font-medium italic">
                                        "Billing used to be a nightmare. Now it's automated and seamless. Best investment we made."
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-lg">
                                        J
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">John D.</h4>
                                        <p className="text-sm text-gray-400">Owner, German Fitness</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Card 3: Iron Gym */}
                            <Card customClass="glass-dark border border-white/10 p-8 flex flex-col justify-between">
                                <div className="mb-4">
                                    <div className="flex text-[#00d4ff] mb-4 gap-1">
                                        {[...Array(5)].map((_, i) => <i key={i} className="ri-star-fill"></i>)}
                                    </div>
                                    <p className="text-xl text-gray-200 font-medium italic">
                                        "The membership tracking is flawless. We've reduced dropouts by 20% in just 3 months."
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white text-lg">
                                        M
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Mike R.</h4>
                                        <p className="text-sm text-gray-400">Manager, Iron Gym</p>
                                    </div>
                                </div>
                            </Card>
                        </CardSwap>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
