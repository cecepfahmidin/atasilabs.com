import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, RotateCcw, LayoutDashboard, LogIn, Sparkles } from 'lucide-react';
import { AnimatedCharacters } from './components/AnimatedCharacters';
import { LoginForm } from './components/LoginForm';
import { DashboardView } from './components/DashboardView';
import { IntroAnimation } from './components/IntroAnimation';
import { FocusField } from './types';
import { toggleSound, isSoundEnabled, playSuccessSound } from './utils/audio';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('anna@gmail.com');
  const [showIntro, setShowIntro] = useState(true);
  const [soundActive, setSoundActive] = useState(true);
  const [focusField, setFocusField] = useState<FocusField>('none');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailValue, setEmailValue] = useState('anna@gmail.com');
  const [passwordValue, setPasswordValue] = useState('••••••••••••');
  const [lastClickedCharacter, setLastClickedCharacter] = useState<string | null>(null);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    playSuccessSound();
    setIsLoggedIn(true);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundActive(newState);
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  const handleCharacterClick = (name: string) => {
    setLastClickedCharacter(name);
    setTimeout(() => setLastClickedCharacter(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#131518] text-neutral-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Intro Dot Animation (Frames 00:00 - 00:02) */}
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}

      {/* Top Floating Control Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between text-xs text-neutral-400 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-semibold text-neutral-200 tracking-wide">
            Interactive Video Showcase
          </span>
          <span className="hidden sm:inline-block text-neutral-600">|</span>
          <span className="hidden sm:inline-block text-neutral-400">
            {isLoggedIn ? 'Learning Dashboard' : 'Geometric Character Login'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={handleSoundToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition cursor-pointer"
            title={soundActive ? 'Mute sound effects' : 'Unmute sound effects'}
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Audio: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden md:inline">Audio: Muted</span>
              </>
            )}
          </button>

          {/* Replay Intro */}
          {!isLoggedIn && (
            <button
              onClick={replayIntro}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition cursor-pointer"
              title="Replay intro transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Replay Intro</span>
            </button>
          )}

          {/* Direct View Switcher */}
          <button
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-neutral-900 font-medium hover:bg-neutral-200 transition shadow-sm cursor-pointer"
            title="Switch between Login and Dashboard"
          >
            {isLoggedIn ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Show Login</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                <span>Show Dashboard</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 z-20">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* ==================================================== */
            /* LOGIN CARD (Frames 00:02 - 00:16)                     */
            /* ==================================================== */
            <motion.div
              key="login-view"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-neutral-800/30 flex flex-col md:flex-row min-h-[560px]"
            >
              {/* Left Side: Animated Characters Stage */}
              <div className="w-full md:w-[46%] relative flex flex-col justify-between bg-[#eceef1]">
                <AnimatedCharacters
                  focusField={focusField}
                  isPasswordVisible={isPasswordVisible}
                  emailValue={emailValue}
                  passwordValue={passwordValue}
                  isIntroPlaying={showIntro}
                  onCharacterClick={handleCharacterClick}
                />

                {/* Character Click Toast / Speech bubble */}
                {lastClickedCharacter && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm"
                  >
                    {lastClickedCharacter === 'purple' && '💜 Purple: "I\'m watching you type!"'}
                    {lastClickedCharacter === 'orange' && '🧡 Orange: "Keep going, you got this!"'}
                    {lastClickedCharacter === 'black' && '🖤 Black: "I see everything..."'}
                    {lastClickedCharacter === 'yellow' && '💛 Yellow: "Ready when you are!"'}
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
          ) : (
            /* ==================================================== */
            /* DASHBOARD VIEW (Frame 00:17)                         */
            /* ==================================================== */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <DashboardView
                userEmail={userEmail}
                onLogout={() => setIsLoggedIn(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info & Instructions */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2 z-10">
        <div className="flex items-center gap-2">
          <span>💡 Tip:</span>
          <span>
            Type in <b>Email</b> to see the purple character bend over! Type in <b>Password</b> to see them look away or act nervous.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Created faithfully based on showcase video</span>
        </div>
      </footer>
    </div>
  );
}
