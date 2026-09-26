'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { AnimatedCharacters } from './AnimatedCharacters';
import { LoginForm } from './LoginForm';
import { FocusField } from './types';
import { playSuccessSound } from './audio';
import { Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';

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
  const { setActiveView } = useApp();
  const [focusField, setFocusField] = useState<FocusField>('none');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [lastClickedCharacter, setLastClickedCharacter] = useState<string | null>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);

  React.useEffect(() => {
    const origBodyBg = document.body.style.backgroundColor;
    const origHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#eceef1';
    document.documentElement.style.backgroundColor = '#eceef1';

    const timer = setTimeout(() => {
      setIsIntroPlaying(false);
    }, 800);

    return () => {
      document.body.style.backgroundColor = origBodyBg;
      document.documentElement.style.backgroundColor = origHtmlBg;
      clearTimeout(timer);
    };
  }, []);

  const handleLoginSuccess = (email: string) => {
    setLoginStatus('success');
    playSuccessSound();
    setActiveView('dashboard');
    setTimeout(() => {
      if (onCloseModal) {
        onCloseModal();
      }
      try {
        router.push(onSuccessRedirect);
      } catch (err) {
        console.warn('Router push failed, falling back to window location:', err);
        window.location.href = onSuccessRedirect;
      }
    }, 1000);
  };

  const handleLoginError = (msg: string) => {
    setLoginStatus('error');
    setErrorMessage(msg);
    setTimeout(() => {
      setLoginStatus('idle');
      setErrorMessage(null);
    }, 2800);
  };

  const handleCharacterClick = (name: string) => {
    setLastClickedCharacter(name);
    setTimeout(() => setLastClickedCharacter(null), 1800);
  };

  const [visibilityToast, setVisibilityToast] = useState<string | null>(null);

  const handlePasswordVisibilityChange = (visible: boolean) => {
    setIsPasswordVisible(visible);
    setVisibilityToast(visible ? '👀 Ops! Kata sandi ditampilkan!' : '🙈 Ssst! Kata sandi disembunyikan!');
    setTimeout(() => setVisibilityToast(null), 2000);
  };

  // Render modal layout if opened inside Dialog
  if (isModal) {
    return (
      <div className="w-full text-neutral-100 flex flex-col justify-center items-center selection:bg-purple-500 selection:text-white relative font-sans p-2">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800/30 flex flex-col md:flex-row min-h-0 md:min-h-[540px]">
          <div className="w-full md:w-[46%] relative flex flex-col justify-between bg-[#eceef1]">
            <AnimatedCharacters
              focusField={focusField}
              isPasswordVisible={isPasswordVisible}
              emailValue={emailValue}
              passwordValue={passwordValue}
              isIntroPlaying={isIntroPlaying}
              loginStatus={loginStatus}
              onCharacterClick={handleCharacterClick}
            />
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
          <div className="w-full md:w-[54%] flex flex-col">
            <LoginForm
              onFocusChange={setFocusField}
              onPasswordVisibilityChange={handlePasswordVisibilityChange}
              onEmailChange={setEmailValue}
              onPasswordChange={setPasswordValue}
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen Page Layout: Desktop = Non-scrollable Fullscreen (100vh) | Mobile = Fullscreen Fluid Flow
  return (
    <div className="w-screen min-h-screen md:h-screen md:max-h-screen bg-[#eceef1] text-neutral-900 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative font-sans select-none">
      {/* Left Stage (Character Animation Stage) */}
      <div className="w-full md:w-1/2 h-[220px] sm:h-[280px] md:h-full relative flex flex-col justify-between bg-[#eceef1] md:border-r border-neutral-300/80 p-4 sm:p-6 md:p-10 z-10 shrink-0">
        {/* Top Header Navigation (Visible on both Mobile & Desktop) */}
        <div className="flex items-center justify-between z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition group bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-neutral-300/90 shadow-xs backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-neutral-600" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300/60 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Enkripsi Terverifikasi</span>
            <span className="sm:hidden">Terverifikasi</span>
          </div>
        </div>

        {/* Center Interactive Animated Stage */}
        <div className="w-full flex-1 flex items-center justify-center relative min-h-0">
          <AnimatedCharacters
            focusField={focusField}
            isPasswordVisible={isPasswordVisible}
            emailValue={emailValue}
            passwordValue={passwordValue}
            isIntroPlaying={isIntroPlaying}
            loginStatus={loginStatus}
            onCharacterClick={handleCharacterClick}
          />

          {/* Speech Bubble Toast */}
          {loginStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-emerald-400 backdrop-blur-md z-30 whitespace-nowrap flex items-center gap-2"
            >
              <span>🎉 Hore! Login Berhasil! Mengalihkan...</span>
            </motion.div>
          ) : loginStatus === 'error' ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-rose-400 backdrop-blur-md z-30 whitespace-nowrap flex items-center gap-2"
            >
              <span>⚠️ Waduh! {errorMessage || 'Email/Password Salah!'}</span>
            </motion.div>
          ) : visibilityToast ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-purple-950 text-purple-100 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl border border-purple-600/60 backdrop-blur-md z-30 whitespace-nowrap"
            >
              {visibilityToast}
            </motion.div>
          ) : lastClickedCharacter ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/95 text-white text-[11px] sm:text-xs font-semibold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-2xl border border-neutral-700/80 backdrop-blur-md z-30 whitespace-nowrap"
            >
              {lastClickedCharacter === 'purple' && '💜 Purple: "Saya memperhatikan Anda!"'}
              {lastClickedCharacter === 'orange' && '🧡 Orange: "Semangat terus, Anda pasti bisa!"'}
              {lastClickedCharacter === 'black' && '🖤 Black: "Saya mengawasi segalanya..."'}
              {lastClickedCharacter === 'yellow' && '💛 Yellow: "Siap kapanpun Anda butuh!"'}
            </motion.div>
          ) : null}
        </div>

        {/* Bottom Ticker (Desktop only) */}
        <div className="hidden md:flex items-center justify-between text-xs text-neutral-600 z-20 pt-4 border-t border-neutral-300/80 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-neutral-700">Portal Operasional & Administrasi Digital AtasiLabs</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono font-medium">System Active</span>
        </div>
      </div>

      {/* Right Stage (Form Stage: Fullscreen edge-to-edge on Mobile & Desktop) */}
      <div className="w-full md:w-1/2 flex-1 md:h-full bg-white text-neutral-900 flex flex-col justify-center items-center p-6 sm:p-10 md:p-14 lg:p-16 z-10 border-t border-neutral-200/80 md:border-t-0 shadow-none">
        <div className="w-full max-w-md my-auto py-2 sm:py-0">
          <LoginForm
            onFocusChange={setFocusField}
            onPasswordVisibilityChange={handlePasswordVisibilityChange}
            onEmailChange={setEmailValue}
            onPasswordChange={setPasswordValue}
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
          />
        </div>
      </div>
    </div>
  );
};
