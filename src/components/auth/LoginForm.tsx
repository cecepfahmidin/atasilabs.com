'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Check } from 'lucide-react';
import { FocusField } from './types';
import { playKeySound, playEyeToggleSound } from './audio';
import { useApp } from '../../context/AppContext';
import { AtasiLabsLogo } from '../common/AtasiLabsLogo';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onFocusChange: (field: FocusField) => void;
  onPasswordVisibilityChange: (visible: boolean) => void;
  onEmailChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onLoginSuccess: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onFocusChange,
  onPasswordVisibilityChange,
  onEmailChange,
  onPasswordChange,
  onLoginSuccess,
}) => {
  const { login, users, setActiveView } = useApp();
  const [email, setEmail] = useState('ceo@atasilabs.com');
  const [password, setPassword] = useState('7770555A888!');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    onEmailChange(val);
    playKeySound();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    onPasswordChange(val);
    playKeySound();
  };

  const togglePasswordVisibility = () => {
    const nextState = !isPasswordVisible;
    setIsPasswordVisible(nextState);
    onPasswordVisibilityChange(nextState);
    playEyeToggleSound(nextState);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showNotification('Silakan masukkan email');
      return;
    }
    if (!password) {
      showNotification('Silakan masukkan password');
      return;
    }
    setIsLoading(true);

    try {
      // 1. Attempt Supabase Auth authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user) {
        const userEmail = data.user.email || email;
        login(userEmail, data.user);
        setIsLoading(false);
        onLoginSuccess(userEmail);
        return;
      }

      // 2. Validate system user credentials
      const systemUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (systemUser) {
        // Validate password against user's password or default system password
        const expectedPassword = systemUser.password || '7770555A888!';
        if (password === expectedPassword) {
          login(systemUser.email);
          setIsLoading(false);
          onLoginSuccess(systemUser.email);
          return;
        } else {
          showNotification('Password yang Anda masukkan salah!');
          setIsLoading(false);
          return;
        }
      }

      // 3. If user is not registered in system or Supabase Auth failed with invalid credentials
      showNotification('Email atau password tidak terdaftar / salah!');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Supabase Auth exception:', err);
      showNotification('Gagal login: Periksa kembali email dan password Anda');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 sm:p-8 md:p-12 bg-white">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-neutral-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-lg border border-neutral-700 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Top Header */}
      <div className="w-full">
        {/* Brand Icon (AtasiLabs Logo) */}
        <div className="flex items-center justify-start mb-4 sm:mb-8">
          <Link
            href="/"
            onClick={() => setActiveView('landing')}
            title="Kembali ke Halaman Depan"
            className="inline-flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <AtasiLabsLogo height={32} />
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-sans">
            Selamat Datang Kembali!
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm">
            Silakan pilih role atau masukkan kredensial akun Anda
          </p>
        </div>

        {/* Quick Role Selector Pills */}
        <div className="mb-5 space-y-1.5">
          <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Pilih Kredensial Akun Role:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { role: 'CEO', email: 'ceo@atasilabs.com', label: '👑 CEO' },
              { role: 'CTO', email: 'cto@atasilabs.com', label: '💻 CTO' },
              { role: 'CMO', email: 'cmo@atasilabs.com', label: '📈 CMO' },
              { role: 'ADMIN', email: 'admin@atasilabs.com', label: '🛡️ ADMIN' },
              { role: 'CLIENT', email: 'budi.santoso@nusantaratech.id', label: '🤝 CLIENT' },
              { role: 'FREELANCER', email: 'doni.freelance@devmail.com', label: '⚡ FREELANCER' },
            ].map((p) => {
              const isActive = email.toLowerCase() === p.email.toLowerCase();
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => {
                    setEmail(p.email);
                    setPassword('7770555A888!');
                    onEmailChange(p.email);
                    onPasswordChange('7770555A888!');
                    showNotification(`Kredensial Akun [${p.role}] dimuat!`);
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-neutral-700 tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onFocus={() => onFocusChange('email')}
              onBlur={() => onFocusChange('none')}
              onChange={handleEmailChange}
              placeholder="Masukkan email Anda"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none transition bg-white text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-neutral-700 tracking-wide"
            >
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                required
                value={password}
                onFocus={() => onFocusChange('password')}
                onBlur={() => onFocusChange('none')}
                onChange={handlePasswordChange}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-11 py-2.5 text-sm rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none transition bg-white text-neutral-900 placeholder:text-neutral-400 font-mono tracking-wider"
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition p-1 cursor-pointer"
                aria-label={isPasswordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {isPasswordVisible ? (
                  <EyeOff className="w-4 h-4 text-neutral-700" />
                ) : (
                  <Eye className="w-4 h-4 text-neutral-500" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                  rememberMe
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'border-neutral-300 bg-white'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-xs text-neutral-600 font-medium">
                Ingat saya 30 hari
              </span>
            </label>

            <button
              type="button"
              onClick={() => showNotification('Instruksi reset kata sandi telah dikirim!')}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition font-medium cursor-pointer"
            >
              Lupa kata sandi?
            </button>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-3">
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              onMouseEnter={() => onFocusChange('submit')}
              onMouseLeave={() => onFocusChange('none')}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-sm transition duration-150 flex items-center justify-center shadow-sm disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Masuk Sekarang'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
