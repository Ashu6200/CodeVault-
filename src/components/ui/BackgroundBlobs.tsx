'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundBlobs = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      {/* Top Right Blob - Purple/Blue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] min-w-[400px] min-h-[400px] rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-600/20 animate-drift"
        style={{ animationDelay: '0s' }}
      />

      {/* Bottom Left Blob - Cyan/Teal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute -bottom-[10%] -left-[5%] w-[35vw] h-[35vw] min-w-[350px] min-h-[350px] rounded-full bg-cyan-400/10 blur-[100px] dark:bg-cyan-500/15 animate-drift"
        style={{ animationDelay: '-5s' }}
      />

      {/* Center/Top Blob - Subtle White/Pink */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute top-[20%] left-[30%] w-[25vw] h-[25vw] min-w-[250px] min-h-[250px] rounded-full bg-pink-300/5 blur-[80px] dark:bg-pink-500/10 animate-pulse-slow"
      />

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
    </div>
  );
};
