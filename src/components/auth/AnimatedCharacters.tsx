'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FocusField } from './types';
import { playPopSound } from './audio';

interface AnimatedCharactersProps {
  focusField: FocusField;
  isPasswordVisible: boolean;
  emailValue: string;
  passwordValue: string;
  isIntroPlaying: boolean;
  loginStatus?: 'idle' | 'success' | 'error';
  onCharacterClick?: (name: string) => void;
}

export const AnimatedCharacters: React.FC<AnimatedCharactersProps> = ({
  focusField,
  isPasswordVisible,
  emailValue,
  passwordValue,
  isIntroPlaying,
  loginStatus = 'idle',
  onCharacterClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [blinking, setBlinking] = useState(false);
  const [clickedChar, setClickedChar] = useState<string | null>(null);

  // Periodic blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3800 + Math.random() * 2500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Track mouse coordinates normalized between -1.5 and 1.5 relative to window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2.6 - 1.3;
      const y = (e.clientY / window.innerHeight) * 2.6 - 1.3;
      setMousePos({
        x: Math.max(-1.5, Math.min(1.5, x)),
        y: Math.max(-1.5, Math.min(1.5, y)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute target pupil direction
  let targetX = mousePos.x;
  let targetY = mousePos.y;

  if (focusField === 'email') {
    if (emailValue.length === 0) {
      // Curious look towards email field before typing
      targetX = 0.9;
      targetY = -0.3;
    } else {
      // Active typing tracking rhythm
      targetX = 1.15;
      targetY = -0.4;
    }
  } else if (focusField === 'password') {
    if (!isPasswordVisible) {
      // Look away / look down nervously
      targetX = -0.4;
      targetY = 0.75;
    } else {
      // Look surprised towards password input
      targetX = 1.05;
      targetY = -0.15;
    }
  } else if (focusField === 'google') {
    targetX = 0.9;
    targetY = 0.7;
  } else if (focusField === 'submit') {
    targetX = 0.8;
    targetY = 0.4;
  }

  const handleCharClick = (name: string, pitch: number) => {
    playPopSound(pitch);
    setClickedChar(name);
    setTimeout(() => setClickedChar(null), 400);
    onCharacterClick?.(name);
  };

  // State checks
  const isFocusEmail = focusField === 'email';
  const isFocusEmailEmpty = isFocusEmail && emailValue.length === 0;
  const isTypingEmail = isFocusEmail && emailValue.length > 0;

  const isFocusPassword = focusField === 'password';
  const isPasswordRevealed = isPasswordVisible;
  const isPasswordSecret = !isPasswordVisible && (isFocusPassword || passwordValue.length > 0);
  const isPasswordSecretTyping = isPasswordSecret && passwordValue.length > 0;
  const isPasswordSecretEmpty = isPasswordSecret && passwordValue.length === 0;

  const isSuccess = loginStatus === 'success';
  const isError = loginStatus === 'error';
  const isIdle = focusField === 'none' && emailValue === '' && passwordValue === '' && !isSuccess && !isError;

  return (
    <div
      ref={containerRef}
      id="characters-stage"
      className="relative w-full h-full min-h-[180px] sm:min-h-[260px] md:min-h-[480px] bg-[#eceef1] flex items-end justify-center p-3 sm:p-6 md:p-10 select-none overflow-hidden"
    >
      {/* Background subtle soft decorative glows */}
      <div className={`absolute top-12 left-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isError ? 'bg-rose-400/40' : isSuccess ? 'bg-emerald-300/40' : 'bg-purple-200/25'
      }`} />
      <div className={`absolute bottom-10 right-12 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isError ? 'bg-rose-500/30' : isSuccess ? 'bg-amber-300/40' : 'bg-amber-200/35'
      }`} />

      {/* SVG Stage container */}
      <div className="relative w-full max-w-[220px] sm:max-w-[320px] md:max-w-[480px] lg:max-w-[580px] xl:max-w-[660px] 2xl:max-w-[740px] h-[180px] sm:h-[270px] md:h-[420px] lg:h-[500px] xl:h-[560px] 2xl:h-[620px] flex items-end justify-center transition-all duration-300">
        <svg
          viewBox="0 0 340 330"
          className="w-full h-full overflow-visible"
          style={{ transformOrigin: 'bottom center' }}
        >
          <defs>
            {/* Soft shadows */}
            <filter id="charShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" />
            </filter>
            <filter id="eyeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Celebration Confetti Burst (When Login Success) */}
          {isSuccess && (
            <g id="confetti-burst">
              {[
                { cx: 80, cy: 60, color: '#603be4', r: 4 },
                { cx: 130, cy: 40, color: '#f8c326', r: 5 },
                { cx: 170, cy: 25, color: '#10b981', r: 4.5 },
                { cx: 210, cy: 45, color: '#f86c2e', r: 5 },
                { cx: 260, cy: 65, color: '#ec4899', r: 4 },
                { cx: 100, cy: 90, color: '#3b82f6', r: 3.5 },
                { cx: 240, cy: 85, color: '#8b5cf6', r: 4 },
              ].map((p, idx) => (
                <motion.circle
                  key={idx}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.r}
                  fill={p.color}
                  initial={{ y: 40, opacity: 0, scale: 0 }}
                  animate={{
                    y: [0, -40, -60],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: idx * 0.15,
                  }}
                />
              ))}
            </g>
          )}

          {/* Ground shadow beneath all characters */}
          <ellipse cx="170" cy="318" rx="145" ry="12" fill="#d7dade" />

          {/* ==================================================== */}
          {/* 1. PURPLE TALL CHARACTER (Back Left)                  */}
          {/* ==================================================== */}
          <motion.g
            id="char-purple"
            className="cursor-pointer"
            onClick={() => handleCharClick('purple', 320)}
            initial={{ y: 80, opacity: 0 }}
            animate={{
              y: isIntroPlaying
                ? 80
                : isSuccess
                  ? [-30, 0, -20, 0]
                  : isPasswordRevealed
                    ? -12
                    : 0,
              opacity: isIntroPlaying ? 0 : 1,
              rotate: isError
                ? [-6, 6, -5, 5, 0]
                : isPasswordRevealed
                  ? 8
                  : isTypingEmail
                    ? 15 + Math.sin(emailValue.length * 0.5) * 2
                    : isFocusEmailEmpty
                      ? 9
                      : isPasswordSecretTyping
                        ? -14
                        : isPasswordSecretEmpty
                          ? -8
                          : clickedChar === 'purple'
                            ? -6
                            : 0,
              scaleY: clickedChar === 'purple' ? 0.92 : isPasswordRevealed ? 1.05 : 1,
              scaleX: clickedChar === 'purple' ? 1.05 : isPasswordRevealed ? 0.96 : 1,
              x: isError
                ? [-10, 10, -7, 7, 0]
                : isTypingEmail
                  ? 14
                  : isFocusEmailEmpty
                    ? 6
                    : isPasswordSecretTyping
                      ? -12
                      : isPasswordSecretEmpty
                        ? -6
                        : 0,
            }}
            transition={
              isSuccess
                ? { repeat: Infinity, duration: 0.8, repeatType: 'reverse' }
                : isError
                  ? { duration: 0.5 }
                  : { type: 'spring', stiffness: 280, damping: 20 }
            }
            style={{ transformOrigin: '110px 315px' }}
          >
            {/* Purple Body */}
            <rect
              x="75"
              y="70"
              width="70"
              height="245"
              rx="18"
              ry="18"
              fill={isError ? '#502db4' : '#603be4'}
              filter="url(#charShadow)"
            />

            {/* Subtle inner highlight */}
            <path
              d="M 85 75 Q 110 73 135 75"
              stroke="#7c5af7"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Purple Character Eyes */}
            <g id="purple-eyes">
              {isSuccess ? (
                // Happy Arc Eyes ^ ^
                <>
                  <path d="M 91 114 Q 97 106 103 114" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 117 114 Q 123 106 129 114" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : isError ? (
                // Sad / Disappointed > < Eyes
                <>
                  <path d="M 92 108 L 102 116 M 102 108 L 92 116" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 118 108 L 128 116 M 128 108 L 118 116" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye */}
                  <circle
                    cx="97"
                    cy="112"
                    r={isPasswordRevealed ? 9 : 7}
                    fill="#ffffff"
                    filter="url(#eyeShadow)"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '97px 112px' }}
                  />
                  <motion.circle
                    cx="97"
                    cy="112"
                    r={isPasswordSecret ? 2.2 : isPasswordRevealed ? 5.2 : 3.8}
                    fill="#0f1115"
                    animate={{
                      x: Math.max(-3.5, Math.min(3.5, targetX * 3.5)),
                      y: Math.max(-3.5, Math.min(3.5, targetY * 3.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />

                  {/* Right Eye */}
                  <circle
                    cx="123"
                    cy="112"
                    r={isPasswordRevealed ? 9 : 7}
                    fill="#ffffff"
                    filter="url(#eyeShadow)"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '123px 112px' }}
                  />
                  <motion.circle
                    cx="123"
                    cy="112"
                    r={isPasswordSecret ? 2.2 : isPasswordRevealed ? 5.2 : 3.8}
                    fill="#0f1115"
                    animate={{
                      x: Math.max(-3.5, Math.min(3.5, targetX * 3.5)),
                      y: Math.max(-3.5, Math.min(3.5, targetY * 3.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                </>
              )}
            </g>

            {/* Purple Character Mouth */}
            <g id="purple-mouth">
              {isSuccess ? (
                // Wide Happy Smile
                <path
                  d="M 100 130 Q 110 142 120 130 Z"
                  fill="#ffffff"
                />
              ) : isError ? (
                // Sad upside down mouth
                <path
                  d="M 103 138 Q 110 131 117 138"
                  fill="none"
                  stroke="#1c1335"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              ) : isPasswordSecret ? (
                // Nervous wavy mouth
                <motion.path
                  d="M 102 135 Q 106 132 110 135 Q 114 138 118 135"
                  fill="none"
                  stroke="#1c1335"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{
                    d: [
                      'M 102 135 Q 106 132 110 135 Q 114 138 118 135',
                      'M 102 136 Q 106 138 110 135 Q 114 133 118 136',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 0.4, repeatType: 'reverse' }}
                />
              ) : isPasswordRevealed ? (
                // Surprised Gasp Round Mouth 'O'
                <circle cx="110" cy="134" r="4.5" fill="#1c1335" />
              ) : isTypingEmail ? (
                // Curious smile
                <path
                  d="M 104 132 Q 112 138 118 132"
                  fill="none"
                  stroke="#1c1335"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : (
                // Neutral mouth
                <line
                  x1="105"
                  y1="133"
                  x2="115"
                  y2="133"
                  stroke="#1c1335"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              )}
            </g>
          </motion.g>

          {/* ==================================================== */}
          {/* 2. BLACK COLUMN CHARACTER (Center Right)             */}
          {/* ==================================================== */}
          <motion.g
            id="char-black"
            className="cursor-pointer"
            onClick={() => handleCharClick('black', 480)}
            initial={{ y: -160, rotate: 18, opacity: 0 }}
            animate={{
              y: isIntroPlaying
                ? -160
                : isSuccess
                  ? [-38, 0, -28, 0]
                  : isPasswordRevealed
                    ? -16
                    : 0,
              rotate: isError
                ? [-8, 8, -6, 6, 0]
                : isPasswordRevealed
                  ? -6
                  : isIntroPlaying
                    ? 18
                    : 0,
              opacity: isIntroPlaying ? 0 : 1,
              scaleY: clickedChar === 'black' ? 0.9 : isPasswordRevealed ? 1.06 : 1,
              scaleX: clickedChar === 'black' ? 1.08 : isPasswordRevealed ? 0.95 : 1,
              x: isError ? [-12, 12, -8, 8, 0] : 0,
            }}
            transition={
              isSuccess
                ? { repeat: Infinity, duration: 0.7, repeatType: 'reverse' }
                : isError
                  ? { duration: 0.5 }
                  : { type: 'spring', stiffness: 240, damping: 18 }
            }
            style={{ transformOrigin: '175px 315px' }}
          >
            {/* Black Body */}
            <rect
              x="148"
              y="140"
              width="54"
              height="175"
              rx="12"
              ry="12"
              fill="#101214"
              filter="url(#charShadow)"
            />

            {/* Black Character Big Circular Eyes */}
            <g id="black-eyes">
              {isSuccess ? (
                <>
                  <path d="M 158 178 Q 165 170 172 178" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 180 178 Q 187 170 194 178" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : isError ? (
                <>
                  <path d="M 160 172 L 170 180 M 170 172 L 160 180" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 182 172 L 192 180 M 192 172 L 182 180" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Eye */}
                  <circle
                    cx="165"
                    cy="176"
                    r={isPasswordRevealed ? 11 : 8.5}
                    fill="#ffffff"
                    filter="url(#eyeShadow)"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '165px 176px' }}
                  />
                  <motion.circle
                    cx="165"
                    cy="176"
                    r={isPasswordSecret ? 3 : isPasswordRevealed ? 6 : 4.5}
                    fill="#000000"
                    animate={{
                      x: isPasswordSecret
                        ? [-3, 3, -2]
                        : Math.max(-4.5, Math.min(4.5, targetX * 4.5)),
                      y: isPasswordSecret
                        ? 3
                        : Math.max(-4.5, Math.min(4.5, targetY * 4.5)),
                    }}
                    transition={
                      isPasswordSecret
                        ? { repeat: Infinity, duration: 1.2, repeatType: 'reverse' }
                        : { type: 'spring', stiffness: 420, damping: 24 }
                    }
                  />

                  {/* Right Eye */}
                  <circle
                    cx="187"
                    cy="176"
                    r={isPasswordRevealed ? 11 : 8.5}
                    fill="#ffffff"
                    filter="url(#eyeShadow)"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '187px 176px' }}
                  />
                  <motion.circle
                    cx="187"
                    cy="176"
                    r={isPasswordSecret ? 3 : isPasswordRevealed ? 6 : 4.5}
                    fill="#000000"
                    animate={{
                      x: isPasswordSecret
                        ? [-3, 3, -2]
                        : Math.max(-4.5, Math.min(4.5, targetX * 4.5)),
                      y: isPasswordSecret
                        ? 3
                        : Math.max(-4.5, Math.min(4.5, targetY * 4.5)),
                    }}
                    transition={
                      isPasswordSecret
                        ? { repeat: Infinity, duration: 1.2, repeatType: 'reverse' }
                        : { type: 'spring', stiffness: 420, damping: 24 }
                    }
                  />
                </>
              )}
            </g>

            {/* Little peek cover hands when password is secret/hidden */}
            {isPasswordSecret && (
              <motion.g
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <ellipse cx="165" cy="174" rx="8" ry="6" fill="#282c34" stroke="#101214" strokeWidth="1.5" />
                <ellipse cx="187" cy="174" rx="8" ry="6" fill="#282c34" stroke="#101214" strokeWidth="1.5" />
              </motion.g>
            )}

            {/* Surprised mouth when password revealed */}
            {isPasswordRevealed && (
              <ellipse cx="176" cy="192" rx="4" ry="5" fill="#ffffff" />
            )}
          </motion.g>

          {/* ==================================================== */}
          {/* 3. YELLOW PILL CHARACTER (Right Side)                */}
          {/* ==================================================== */}
          <motion.g
            id="char-yellow"
            className="cursor-pointer"
            onClick={() => handleCharClick('yellow', 600)}
            initial={{ y: 90, opacity: 0 }}
            animate={{
              y: isIntroPlaying
                ? 90
                : isSuccess
                  ? [-24, 0, -16, 0]
                  : isPasswordRevealed
                    ? -10
                    : 0,
              opacity: isIntroPlaying ? 0 : 1,
              scaleY: clickedChar === 'yellow' ? 0.9 : 1,
              scaleX: clickedChar === 'yellow' ? 1.08 : 1,
              rotate: isError
                ? [-7, 7, -5, 5, 0]
                : isPasswordRevealed
                  ? -12
                  : focusField === 'password'
                    ? 4
                    : focusField === 'email'
                      ? 3
                      : 0,
              x: isError ? [-8, 8, -5, 5, 0] : 0,
            }}
            transition={
              isSuccess
                ? { repeat: Infinity, duration: 0.85, repeatType: 'reverse' }
                : isError
                  ? { duration: 0.5 }
                  : { type: 'spring', stiffness: 300, damping: 22 }
            }
            style={{ transformOrigin: '235px 315px' }}
          >
            {/* Yellow Body */}
            <path
              d="M 202 315 L 202 205 Q 202 165 235 165 Q 268 165 268 205 L 268 315 Z"
              fill="#f8c326"
              filter="url(#charShadow)"
            />

            {/* Yellow Character Eyes */}
            <g id="yellow-eyes">
              {isSuccess ? (
                <>
                  <path d="M 218 206 Q 223 198 228 206" fill="none" stroke="#181a1f" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 240 206 Q 245 198 250 206" fill="none" stroke="#181a1f" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : isError ? (
                <>
                  <path d="M 218 200 L 228 208 M 228 200 L 218 208" stroke="#181a1f" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 240 200 L 250 208 M 250 200 L 240 208" stroke="#181a1f" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left eye */}
                  <circle
                    cx="223"
                    cy="204"
                    r={isPasswordRevealed ? 6 : 4.2}
                    fill="#181a1f"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '223px 204px' }}
                  />
                  {/* Right eye */}
                  <circle
                    cx="245"
                    cy="204"
                    r={isPasswordRevealed ? 6 : 4.2}
                    fill="#181a1f"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '245px 204px' }}
                  />

                  {/* Pupils */}
                  <motion.circle
                    cx="223"
                    cy="204"
                    r={isPasswordRevealed ? 3.2 : 2.2}
                    fill="#ffffff"
                    animate={{
                      x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                      y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  />
                  <motion.circle
                    cx="245"
                    cy="204"
                    r={isPasswordRevealed ? 3.2 : 2.2}
                    fill="#ffffff"
                    animate={{
                      x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                      y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  />
                </>
              )}
            </g>

            {/* Yellow Character Mouth */}
            <g id="yellow-mouth">
              {isSuccess ? (
                <path d="M 226 218 Q 235 226 244 218" fill="none" stroke="#181a1f" strokeWidth="2.8" strokeLinecap="round" />
              ) : isError ? (
                <path d="M 226 222 Q 235 216 244 222" fill="none" stroke="#181a1f" strokeWidth="2.8" strokeLinecap="round" />
              ) : isPasswordRevealed ? (
                <circle cx="235" cy="221" r="3.5" fill="#181a1f" />
              ) : isPasswordSecret ? (
                <path
                  d="M 226 220 Q 232 217 236 221 Q 240 223 244 219"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : (
                <line
                  x1="228"
                  y1="220"
                  x2="242"
                  y2="220"
                  stroke="#181a1f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              )}
            </g>
          </motion.g>

          {/* ==================================================== */}
          {/* 4. ORANGE DOME CHARACTER (Front Left)                */}
          {/* ==================================================== */}
          <motion.g
            id="char-orange"
            className="cursor-pointer"
            onClick={() => handleCharClick('orange', 520)}
            initial={{ y: 90, scale: 0.8, opacity: 0 }}
            animate={{
              y: isIntroPlaying
                ? 90
                : isSuccess
                  ? [-20, 0, -12, 0]
                  : isPasswordRevealed
                    ? -8
                    : 0,
              scale: isIntroPlaying
                ? 0.8
                : isPasswordSecret
                  ? 0.92
                  : clickedChar === 'orange'
                    ? 0.94
                    : 1,
              opacity: isIntroPlaying ? 0 : 1,
              rotate: isError
                ? [-6, 6, -4, 4, 0]
                : isPasswordRevealed
                  ? 6
                  : clickedChar === 'orange'
                    ? 3
                    : 0,
              x: isError ? [-6, 6, -4, 4, 0] : 0,
            }}
            transition={
              isSuccess
                ? { repeat: Infinity, duration: 0.9, repeatType: 'reverse' }
                : isError
                  ? { duration: 0.5 }
                  : { type: 'spring', stiffness: 320, damping: 24 }
            }
            style={{ transformOrigin: '100px 315px' }}
          >
            {/* Orange Dome Body */}
            <path
              d="M 25 315 A 88 88 0 0 1 195 315 Z"
              fill="#f86c2e"
              filter="url(#charShadow)"
            />

            {/* Orange Character Eyes */}
            <g id="orange-eyes">
              {isSuccess ? (
                <>
                  <path d="M 87 266 Q 92 258 97 266" fill="none" stroke="#181a1f" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M 121 266 Q 126 258 131 266" fill="none" stroke="#181a1f" strokeWidth="2.8" strokeLinecap="round" />
                </>
              ) : isError ? (
                <>
                  <path d="M 87 260 L 97 268 M 97 260 L 87 268" stroke="#181a1f" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 121 260 L 131 268 M 131 260 L 121 268" stroke="#181a1f" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left eye */}
                  <circle
                    cx="92"
                    cy="264"
                    r={isPasswordRevealed ? 6 : 4.5}
                    fill="#181a1f"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '92px 264px' }}
                  />
                  <motion.circle
                    cx="92"
                    cy="264"
                    r={isPasswordRevealed ? 3.5 : 2.6}
                    fill="#ffffff"
                    animate={{
                      x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                      y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  />

                  {/* Right eye */}
                  <circle
                    cx="126"
                    cy="264"
                    r={isPasswordRevealed ? 6 : 4.5}
                    fill="#181a1f"
                    transform={`scale(1, ${blinking ? 0.1 : 1})`}
                    style={{ transformOrigin: '126px 264px' }}
                  />
                  <motion.circle
                    cx="126"
                    cy="264"
                    r={isPasswordRevealed ? 3.5 : 2.6}
                    fill="#ffffff"
                    animate={{
                      x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                      y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  />
                </>
              )}
            </g>

            {/* Orange Character Mouth */}
            <g id="orange-mouth">
              {isSuccess ? (
                <path
                  d="M 102 278 Q 109 287 116 278"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              ) : isError ? (
                <path
                  d="M 104 282 Q 109 276 114 282"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              ) : isPasswordRevealed ? (
                <circle cx="109" cy="280" r="3.5" fill="#181a1f" />
              ) : (
                <path
                  d="M 104 278 Q 109 283 114 278"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              )}
            </g>
          </motion.g>
        </svg>
      </div>
    </div>
  );
};
