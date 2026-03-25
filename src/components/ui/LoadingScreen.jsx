"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, BrainCircuit } from 'lucide-react';

export default function LoadingScreen({ quote }) {
  return (
    <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center z-50">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9333ea]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#9333ea]/5 rounded-full blur-[120px]" />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-[#9333ea]/20 rounded-full"
            />
            
            {/* Middle Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border border-[#a855f7]/30 rounded-full"
            />
            
            {/* Center Icon */}
            <div className="absolute inset-4 bg-[#16161a] rounded-full flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <BrainCircuit className="w-8 h-8 text-[#a855f7]" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          CreacionX
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[#a855f7] text-sm font-medium mb-8"
        >
          Plataforma Creativa Inteligente
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center gap-2 mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-[#a855f7] rounded-full"
            />
          ))}
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#9333ea]/10 blur-xl" />
          <div className="relative bg-[#16161a]/50 backdrop-blur-sm border border-[#a855f7]/20 rounded-xl p-4">
            <Sparkles className="w-4 h-4 text-[#a855f7] mx-auto mb-2" />
            <p className="text-white/80 text-sm italic leading-relaxed">
              {quote}
            </p>
          </div>
        </motion.div>

        {/* Loading Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2 text-white/50 text-xs"
        >
          <Zap className="w-3 h-3" />
          <span>Inicializando tu espacio creativo...</span>
        </motion.div>
      </div>
    </div>
  );
}
