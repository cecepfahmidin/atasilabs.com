'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { AnimatedCharacters } from './AnimatedCharacters';
import { LoginForm } from './LoginForm';
import { FocusField } from './types';
import { playSuccessSound } from './audio';

interface AnimatedInteractiveLoginCardProps {
  onSuccessRedirect?: string;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const AnimatedInteractiveLoginCard: React.FC<AnimatedInteractiveLoginCardProps> = ({
  onSuccessRedirect = '/dashboard',
  isModal = false,
  onCloseModal,
}) => {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);
  const [focusField, setFocusField] = useState<FocusField>('none');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailValue, setEmailValue] = useState('cecepfahmidin@gmail.com');
  const [passwordValue, setPasswordValue] = useState('7770555A888!');
  const [lastClickedCharacter, setLastClickedCharacter] = useState<string | null>(null);

  const handleLoginSuccess = (email: string) => {
    playSuccessSound();
    if (onCloseModal) {
      onCloseModal();
    }
    router.push(onSuccessRedirect);
  };

  const handleCharacterClick = (name: string) => {
    setLastClickedCharacter(name);
    setTimeout(() => setLastClickedCharacter(null), 1500);
  };

  return (
    <div className={`w-full ${isModal ? '' : 'min-h-screen bg-[#131518]'} text-neutral-100 flex flex-col justify-center items-center selection:bg-purple-500 selection:text-white relative overflow-x-hidden font-sans p-2 sm:p-4`}>
      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center p-1 sm:p-4 md:p-6 z-20">
        <motion.div
          key="login-view"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800/30 flex flex-col md:flex-row min-h-0 md:min-h-[560px]"
        >
          {/* Left Side: Animated Characters Stage */}
          <div className="w-full md:w-[46%] relative flex flex-col justify-between bg-[#eceef1]">
            <AnimatedCharacters
              focusField={focusField}
              isPasswordVisible={isPasswordVisible}
              emailValue={emailValue}
              passwordValue={passwordValue}
              isIntroPlaying={false}
              onCharacterClick={handleCharacterClick}
            />

            {/* Character Click Toast / Speech bubble */}
            {lastClickedCharacter && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm z-30"
              >
                {lastClickedCharacter === 'purple' && '💜 Purple: "Saya memperhatikan Anda mengetik!"'}
                {lastClickedCharacter === 'orange' && '🧡 Orange: "Semangat terus, Anda pasti bisa!"'}
                {lastClickedCharacter === 'black' && '🖤 Black: "Saya mengawasi segalanya..."'}
                {lastClickedCharacter === 'yellow' && '💛 Yellow: "Siap kapanpun Anda butuh!"'}
              </motion.div>
            )}
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-[54%] flex flex-col">
            <LoginForm
              onFocusChange={setFocusField}
              onPasswordVisibilityChange={setIsPasswordVisible}
              onEmailChange={setEmailValue}
              onPasswordChange={setPasswordValue}
              onLoginSuccess={handleLoginSuccess}
            />
          </div>
        </motion.div>
      </main>

    </div>
  );
};
