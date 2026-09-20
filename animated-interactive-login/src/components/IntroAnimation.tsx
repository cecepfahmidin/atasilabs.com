import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Phase 0: single pulsing white dot on deep purple background (0.6s)
    const t1 = setTimeout(() => {
      setPhase(1); // Phase 1: two orbiting dots (0.7s)
    }, 600);

    // Phase 2: transition out and reveal the main login canvas
    const t2 = setTimeout(() => {
      setPhase(2);
    }, 1400);

    const t3 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          key="intro-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 bg-[#4917d8] flex items-center justify-center select-none"
        >
          {phase === 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-5 h-5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.8)]"
            />
          )}

          {phase === 1 && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.8)]" />
              <div className="w-5 h-5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.8)]" />
            </motion.div>
          )}

          <div className="absolute bottom-10 text-white/50 text-xs font-mono tracking-widest uppercase">
            Loading Experience...
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
