'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Wallet, ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');
  const redirectTo = fromParam && fromParam.startsWith('/') && !fromParam.startsWith('/login') && !fromParam.startsWith('/register')
    ? fromParam
    : '/';

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { user, loading: authLoading, login, register, loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // If user is already authenticated, redirect to home / target page
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // Load Google Identity Services SDK dynamically
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              setGoogleLoading(true);
              setError(null);
              const result = await loginWithGoogle(response.credential, redirectTo);
              if (!result.success && result.error) {
                setError(result.error);
              }
              setGoogleLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'continue_with',
          shape: 'pill',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [loginWithGoogle, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        const result = await register(email, name, password, redirectTo);
        if (!result.success && result.error) {
          setError(result.error);
        }
      } else {
        const result = await login(email, password, redirectTo);
        if (!result.success && result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@wealthpulse.ai');
    setPassword('demo1234');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-gray-100 flex flex-col justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking authentication status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Decorative Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/20 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/25 mb-4 border border-cyan-400/30">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-cyan-400 tracking-tight">
            WealthPulse AI
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Personal Investment, XIRR & Cash Flow Intelligence
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Top accent glow line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500" />

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-950/60 p-1.5 rounded-xl border border-gray-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isRegister
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isRegister
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google SSO Button Section */}
          <div className="mb-5">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <div className="flex flex-col items-center gap-2">
                <div ref={googleBtnRef} className="w-full flex justify-center min-h-[40px]" />
                {googleLoading && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating with Google...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center leading-relaxed">
                Google SSO Setup Required: Add <code className="bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-200 font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your environment variables.
              </div>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-3 text-gray-500 font-medium">Or email sign in</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isRegister ? 'Creating Account...' : 'Authenticating...'}
                </>
              ) : (
                <>
                  {isRegister ? 'Get Started & Launch Dashboard' : 'Sign In to Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          {!isRegister && (
            <div className="mt-6 pt-5 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1 text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Demo Credentials
              </span>
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Auto-fill Demo Logins
              </button>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AES-256 Encrypted Auth & HTTP-Only Session Security</span>
        </div>
      </div>
    </div>
  );
}

// Global declaration for Google GIS SDK
declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] text-gray-100 flex flex-col justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
