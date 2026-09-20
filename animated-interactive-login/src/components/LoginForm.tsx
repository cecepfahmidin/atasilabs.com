import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Check } from 'lucide-react';
import { FocusField } from '../types';
import { playKeySound, playEyeToggleSound } from '../utils/audio';

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
  const [email, setEmail] = useState('anna@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter an email');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('anna@gmail.com');
    }, 700);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-7 sm:p-10 md:p-12 bg-white">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 right-4 z-50 bg-neutral-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-lg border border-neutral-700 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Top Header */}
      <div className="w-full">
        {/* Brand Icon (4-petal star logo from video) */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-9 h-9 rounded-xl bg-neutral-950 flex items-center justify-center text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" />
            </svg>
          </div>

          {/* Quick Demo Pre-fill Pill */}
          <button
            type="button"
            onClick={() => {
              setEmail('anna@gmail.com');
              setPassword('7770555A888!');
              onEmailChange('anna@gmail.com');
              onPasswordChange('7770555A888!');
              showNotification('Demo credentials loaded!');
            }}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-neutral-200 hover:border-neutral-300 transition"
          >
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Fill Video Demo</span>
          </button>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-sans">
            {isSignUp ? 'Create an account' : 'Welcome back!'}
          </h1>
          <p className="text-neutral-500 text-sm">
            {isSignUp ? 'Enter your details to get started' : 'Please enter your details'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-neutral-700 tracking-wide"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anna Kovaleva"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none transition bg-white text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          )}

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
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 outline-none transition bg-white text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-neutral-700 tracking-wide"
            >
              Password
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800 transition p-1"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
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
                Remember for 30 days
              </span>
            </label>

            {!isSignUp && (
              <button
                type="button"
                onClick={() => showNotification('Password reset instructions sent!')}
                className="text-xs text-neutral-500 hover:text-neutral-900 transition font-medium"
              >
                Forgot password?
              </button>
            )}
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
              ) : isSignUp ? (
                'Sign up'
              ) : (
                'Log in'
              )}
            </button>

            {/* Google Login Button */}
            <button
              type="button"
              id="btn-google-login"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              onMouseEnter={() => onFocusChange('google')}
              onMouseLeave={() => onFocusChange('none')}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.99] text-neutral-800 font-medium text-sm transition duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Log in with Google</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer Switch */}
      <div className="pt-6 text-center">
        <p className="text-xs text-neutral-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-neutral-900 font-semibold hover:underline transition"
          >
            {isSignUp ? 'Log in' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
