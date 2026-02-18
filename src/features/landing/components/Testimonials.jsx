import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const reviews = [
        {
            name: "Rajesh Kumar",
            role: "Owner, PowerFit Gym",
            image: "https://randomuser.me/api/portraits/men/32.jpg",
            text: "After switching to N3 FIT, our renewal rate jumped from 60% to 85%. The WhatsApp reminders alone saved us ₹2L/month in missed renewals.",
            stat: "+42%",
            statLabel: "retention boost"
        },
        {
            name: "Priya Sharma",
            role: "Founder, Yoga Bliss Studio",
            image: "https://randomuser.me/api/portraits/women/44.jpg",
            text: "The dashboard gives me clarity I never had before. I can see exactly which classes are profitable and which trainers retain members best.",
            stat: "₹3.5L",
            statLabel: "monthly revenue growth"
        },
        {
            name: "Amit Patel",
            role: "Manager, Iron Paradise",
            image: "https://randomuser.me/api/portraits/men/65.jpg",
            text: "We manage 3 branches with 2,000+ members on N3 FIT. The multi-branch dashboard is a game-changer. Setup took just 2 hours!",
            stat: "2,000+",
            statLabel: "members tracked"
        }
    ];

    return (
        <section className="py-24 bg-white" id="testimonials">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-3 block">Social Proof</span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                        Trusted by{' '}
                        <span className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">500+ Gyms</span>
                    </h2>
                    <p className="text-lg text-slate-500">See how gym owners are transforming their business with N3 FIT.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-slate-50 p-7 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col h-full"
                        >
                            {/* Stars */}
                            <div className="flex items-center text-amber-400 mb-4 text-lg gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="ri-star-fill"></i>
                                ))}
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow italic">
                                "{review.text}"
                            </p>

                            {/* Dynamic stat */}
                            <div className="bg-blue-50 rounded-xl p-3 mb-5 text-center">
                                <span className="text-xl font-extrabold text-blue-600 font-display">{review.stat}</span>
                                <span className="text-xs text-blue-400 ml-2">{review.statLabel}</span>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                <img src={review.image} alt={review.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100" />
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{review.name}</h4>
                                    <p className="text-xs text-slate-400">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
