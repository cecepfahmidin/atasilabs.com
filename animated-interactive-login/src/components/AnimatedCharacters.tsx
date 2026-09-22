import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FocusField } from '../types';
import { playPopSound } from '../utils/audio';

interface AnimatedCharactersProps {
  focusField: FocusField;
  isPasswordVisible: boolean;
  emailValue: string;
  passwordValue: string;
  isIntroPlaying: boolean;
  onCharacterClick?: (name: string) => void;
}

export const AnimatedCharacters: React.FC<AnimatedCharactersProps> = ({
  focusField,
  isPasswordVisible,
  emailValue,
  passwordValue,
  isIntroPlaying,
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

  // Track mouse coordinates normalized between -1 and 1
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
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
    // Look up and right towards email input
    targetX = 1.1;
    targetY = -0.4;
  } else if (focusField === 'password') {
    if (!isPasswordVisible) {
      // Look away / look down or guilty
      targetX = -0.3;
      targetY = 0.8;
    } else {
      // Look surprised towards password input
      targetX = 1.0;
      targetY = -0.1;
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
  const isTypingEmail = focusField === 'email' && emailValue.length > 0;
  const isPasswordSecret = focusField === 'password' && !isPasswordVisible;
  const isPasswordRevealed = focusField === 'password' && isPasswordVisible;

  return (
    <div
      ref={containerRef}
      id="characters-stage"
      className="relative w-full h-full min-h-[360px] md:min-h-[540px] bg-[#eceef1] flex items-end justify-center p-6 md:p-8 select-none overflow-hidden"
    >
      {/* Background subtle soft decorative glows */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-6 right-8 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Stage container */}
      <div className="relative w-full max-w-[340px] h-[330px] flex items-end justify-center">
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
              y: isIntroPlaying ? 80 : 0,
              opacity: isIntroPlaying ? 0 : 1,
              // When email focused: leans right towards the input field!
              // When secret password: bends back nervously!
              rotate: isTypingEmail
                ? 14 + Math.sin(emailValue.length * 0.5) * 2
                : focusField === 'email'
                ? 11
                : isPasswordSecret
                ? -10
                : clickedChar === 'purple'
                ? -6
                : 0,
              scaleY: clickedChar === 'purple' ? 0.92 : 1,
              scaleX: clickedChar === 'purple' ? 1.05 : 1,
              x: isTypingEmail ? 12 : focusField === 'email' ? 8 : isPasswordSecret ? -8 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 20,
            }}
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
              fill="#603be4"
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
              {/* Left Eye */}
              <circle
                cx="97"
                cy="112"
                r="7"
                fill="#ffffff"
                filter="url(#eyeShadow)"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '97px 112px' }}
              />
              <motion.circle
                cx="97"
                cy="112"
                r={isPasswordSecret ? 2.2 : 3.8}
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
                r="7"
                fill="#ffffff"
                filter="url(#eyeShadow)"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '123px 112px' }}
              />
              <motion.circle
                cx="123"
                cy="112"
                r={isPasswordSecret ? 2.2 : 3.8}
                fill="#0f1115"
                animate={{
                  x: Math.max(-3.5, Math.min(3.5, targetX * 3.5)),
                  y: Math.max(-3.5, Math.min(3.5, targetY * 3.5)),
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            </g>

            {/* Purple Character Mouth */}
            <g id="purple-mouth">
              {isPasswordSecret ? (
                // Nervous wavy mouth when password is being typed in secret!
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
                // Little surprised round mouth 'o'
                <circle cx="110" cy="134" r="3.5" fill="#1c1335" />
              ) : isTypingEmail ? (
                // Curious smile looking at email
                <path
                  d="M 104 132 Q 112 138 118 132"
                  fill="none"
                  stroke="#1c1335"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : (
                // Neutral cute mouth line
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
              // Dropping in from top corner like frame 00:02
              y: isIntroPlaying ? -160 : 0,
              rotate: isIntroPlaying ? 18 : 0,
              opacity: isIntroPlaying ? 0 : 1,
              scaleY: clickedChar === 'black' ? 0.9 : 1,
              scaleX: clickedChar === 'black' ? 1.08 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 240,
              damping: 18,
              delay: isIntroPlaying ? 0 : 0.05,
            }}
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
              {/* Left Eye */}
              <circle
                cx="165"
                cy="176"
                r="8.5"
                fill="#ffffff"
                filter="url(#eyeShadow)"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '165px 176px' }}
              />
              <motion.circle
                cx="165"
                cy="176"
                r={isPasswordSecret ? 3 : 4.5}
                fill="#000000"
                animate={{
                  x: isPasswordSecret
                    ? [ -3, 3, -2 ]
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
              {/* Eye Catchlight */}
              {!blinking && (
                <circle cx="163" cy="174" r="1.3" fill="#ffffff" />
              )}

              {/* Right Eye */}
              <circle
                cx="187"
                cy="176"
                r="8.5"
                fill="#ffffff"
                filter="url(#eyeShadow)"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '187px 176px' }}
              />
              <motion.circle
                cx="187"
                cy="176"
                r={isPasswordSecret ? 3 : 4.5}
                fill="#000000"
                animate={{
                  x: isPasswordSecret
                    ? [ -3, 3, -2 ]
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
              {!blinking && (
                <circle cx="185" cy="174" r="1.3" fill="#ffffff" />
              )}
            </g>

            {/* Little peek cover hands when password is typed */}
            {isPasswordSecret && (
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.9, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <ellipse cx="165" cy="182" rx="7" ry="4" fill="#22252a" />
                <ellipse cx="187" cy="182" rx="7" ry="4" fill="#22252a" />
              </motion.g>
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
              y: isIntroPlaying ? 90 : 0,
              opacity: isIntroPlaying ? 0 : 1,
              scaleY: clickedChar === 'yellow' ? 0.9 : 1,
              scaleX: clickedChar === 'yellow' ? 1.08 : 1,
              rotate: focusField === 'password' ? 4 : focusField === 'email' ? 3 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 22,
            }}
            style={{ transformOrigin: '235px 315px' }}
          >
            {/* Yellow Body (rounded pill top) */}
            <path
              d="M 202 315 L 202 205 Q 202 165 235 165 Q 268 165 268 205 L 268 315 Z"
              fill="#f8c326"
              filter="url(#charShadow)"
            />

            {/* Yellow Character Eyes */}
            <g id="yellow-eyes">
              {/* Left eye */}
              <circle
                cx="223"
                cy="204"
                r="4.2"
                fill="#181a1f"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '223px 204px' }}
              />
              {/* Right eye */}
              <circle
                cx="245"
                cy="204"
                r="4.2"
                fill="#181a1f"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '245px 204px' }}
              />

              {/* Pupils offset tracking */}
              <motion.circle
                cx="223"
                cy="204"
                r="2.2"
                fill="#000000"
                animate={{
                  x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                  y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              />
              <motion.circle
                cx="245"
                cy="204"
                r="2.2"
                fill="#000000"
                animate={{
                  x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                  y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              />
            </g>

            {/* Yellow Character Mouth */}
            <g id="yellow-mouth">
              {isPasswordSecret ? (
                // Wavy confused mouth
                <path
                  d="M 226 220 Q 232 217 236 221 Q 240 223 244 219"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : isTypingEmail ? (
                // Inquisitive tilted line
                <line
                  x1="227"
                  y1="218"
                  x2="242"
                  y2="221"
                  stroke="#181a1f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              ) : (
                // Flat stoic line
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
              y: isIntroPlaying ? 90 : 0,
              scale: isIntroPlaying ? 0.8 : clickedChar === 'orange' ? 0.94 : 1,
              opacity: isIntroPlaying ? 0 : 1,
              rotate: clickedChar === 'orange' ? 3 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 24,
            }}
            style={{ transformOrigin: '100px 315px' }}
          >
            {/* Orange Dome Body (Half Circle / Arch) */}
            <path
              d="M 25 315 A 88 88 0 0 1 195 315 Z"
              fill="#f86c2e"
              filter="url(#charShadow)"
            />

            {/* Orange Character Eyes */}
            <g id="orange-eyes">
              {/* Left eye */}
              <circle
                cx="92"
                cy="264"
                r="4.5"
                fill="#181a1f"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '92px 264px' }}
              />
              <motion.circle
                cx="92"
                cy="264"
                r="2.6"
                fill="#000000"
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
                r="4.5"
                fill="#181a1f"
                transform={`scale(1, ${blinking ? 0.1 : 1})`}
                style={{ transformOrigin: '126px 264px' }}
              />
              <motion.circle
                cx="126"
                cy="264"
                r="2.6"
                fill="#000000"
                animate={{
                  x: Math.max(-2.5, Math.min(2.5, targetX * 2.5)),
                  y: Math.max(-2.5, Math.min(2.5, targetY * 2.5)),
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              />
            </g>

            {/* Orange Character Mouth */}
            <g id="orange-mouth">
              {isPasswordSecret ? (
                // Worried upside-down arc
                <path
                  d="M 104 282 Q 109 277 114 282"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              ) : isTypingEmail ? (
                // Wide happy smile
                <path
                  d="M 102 278 Q 109 285 116 278"
                  fill="none"
                  stroke="#181a1f"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              ) : (
                // Gentle smile
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

      {/* Floating Interactive hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-4 left-4 text-xs font-medium text-neutral-400 select-none flex items-center gap-1.5"
      >
       
      </motion.div>
    </div>
  );
};
