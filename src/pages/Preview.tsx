"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion, AnimatePresence } from "framer-motion";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { ArrowRight } from "lucide-react";

export default function Preview() {
    const navigate = useNavigate();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = () => {
        navigate("/home");
    };

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
            <AnimatePresence>
                {showContent && (
                    <>
                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-white relative z-20"
                        >
                            Shivanshu Tiwari
                        </motion.h1>

                        {/* Sparkles container below title */}
                        <div className="w-[40rem] max-w-[90vw] h-40 relative">
                            {/* Gradient lines at top */}
                            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
                            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
                            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
                            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

                            {/* Sparkles component */}
                            <SparklesCore
                                background="transparent"
                                minSize={0.4}
                                maxSize={1}
                                particleDensity={1200}
                                className="w-full h-full"
                                particleColor="#FFFFFF"
                            />

                            {/* Radial Gradient to prevent sharp edges */}
                            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
                        </div>

                        {/* Enter button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="relative z-20 mt-8"
                        >
                            <RainbowButton onClick={handleEnter} className="gap-2 text-lg px-10 py-6">
                                Enter Portfolio
                                <ArrowRight className="w-5 h-5" />
                            </RainbowButton>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
