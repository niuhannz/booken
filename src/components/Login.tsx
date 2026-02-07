import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { useTheme } from '../lib/theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Sun, Moon } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const { login, signup } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('guest@booken.io', 'guest');
    } catch (err) {
      setError('Could not sign in as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: 'var(--bk-bg)' }}>
      {/* Aurora background with noise */}
      <div className="bk-aurora absolute inset-0 z-0"></div>
      <div className="bk-noise absolute inset-0 z-1 opacity-5"></div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="bk-theme-toggle"
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@400;500&display=swap');

        .bk-aurora {
          background: radial-gradient(ellipse 180% 120% at 50% 0%,
            rgba(100, 150, 255, 0.15) 0%,
            rgba(150, 100, 200, 0.1) 25%,
            rgba(200, 80, 150, 0.08) 50%,
            rgba(50, 100, 150, 0.05) 75%,
            transparent 100%);
          animation: aurora-drift 15s ease-in-out infinite;
        }

        @keyframes aurora-drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(20px) translateX(-10px); }
          50% { transform: translateY(0) translateX(10px); }
          75% { transform: translateY(-20px) translateX(-5px); }
        }

        .bk-noise {
          background-image:
            url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2"/></filter><rect width="100" height="100" fill="white" filter="url(%23noise)"/></svg>');
          background-size: 50px 50px;
          pointer-events: none;
        }

        .bk-glass-strong {
          background: var(--bk-login-surface);
          backdrop-filter: blur(24px);
          border: 1px solid var(--bk-border-strong);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                      inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        .bk-glass-input {
          background: var(--bk-login-input);
          border: 1px solid var(--bk-border);
          backdrop-filter: blur(16px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bk-glass-input:focus,
        .bk-glass-input:focus-visible {
          background: var(--bk-login-input-focus);
          border-color: var(--bk-accent-border-strong);
          box-shadow: 0 0 20px rgba(196, 149, 106, 0.2),
                      inset 0 0 10px rgba(196, 149, 106, 0.05);
          outline: none;
        }

        .bk-btn-accent {
          background: var(--bk-accent);
          border: 1px solid rgba(196, 149, 106, 0.3);
          color: var(--bk-bg);
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(196, 149, 106, 0.25),
                      inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .bk-btn-accent:hover:not(:disabled) {
          background: var(--bk-accent-hover);
          box-shadow: 0 6px 25px rgba(196, 149, 106, 0.35),
                      inset 0 1px 1px rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .bk-btn-accent:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bk-btn-ghost {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(196, 149, 106, 0.2);
          color: var(--bk-accent);
          font-weight: 400;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }

        .bk-btn-ghost:hover:not(:disabled) {
          background: rgba(196, 149, 106, 0.08);
          border-color: rgba(196, 149, 106, 0.4);
          box-shadow: 0 0 15px rgba(196, 149, 106, 0.15);
        }

        .bk-btn-ghost:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .bk-divider {
          width: 3px;
          height: 40px;
          background: linear-gradient(180deg, transparent 0%, var(--bk-accent-border-strong) 50%, transparent 100%);
          margin: 1.5rem auto;
        }

        .bk-animate-in {
          animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .book-glow {
          position: relative;
          filter: drop-shadow(0 0 20px rgba(196, 149, 106, 0.4));
          animation: subtle-glow 3s ease-in-out infinite;
        }

        @keyframes subtle-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(196, 149, 106, 0.4)); }
          50% { filter: drop-shadow(0 0 25px rgba(196, 149, 106, 0.6)); }
        }

        .bk-theme-toggle {
          background: transparent;
          border: 1px solid var(--bk-border);
          color: var(--bk-text);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bk-theme-toggle:hover {
          background: var(--bk-border-strong);
          border-color: var(--bk-accent);
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      {/* Content container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Side: Floating Glass Panel with Branding */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 bk-animate-in stagger-1">
            <div className="bk-glass-strong rounded-3xl p-12 w-full max-w-sm">
              {/* Book Icon with Glow */}
              <div className="flex justify-center mb-8 bk-animate-in stagger-2">
                <div className="book-glow">
                  <BookOpen size={80} color="var(--bk-accent)" strokeWidth={1.2} />
                </div>
              </div>

              {/* Brand Name */}
              <h2
                className="text-5xl text-center mb-4 bk-animate-in stagger-3"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: 300,
                  color: 'var(--bk-text)',
                  letterSpacing: '0.05em'
                }}
              >
                Booken
              </h2>

              {/* Decorative Divider */}
              <div className="flex justify-center mb-8 bk-animate-in stagger-4">
                <div className="bk-divider"></div>
              </div>

              {/* Literary Quote */}
              <blockquote className="mt-8 mb-6 bk-animate-in stagger-4" style={{ textAlign: 'center' }}>
                <p
                  className="italic text-lg leading-relaxed mb-4"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    color: 'var(--bk-text-quote)',
                    fontWeight: 300
                  }}
                >
                  "A room without books is like a body without a soul."
                </p>
                <footer className="text-sm" style={{ color: 'var(--bk-text-secondary)' }}>
                  — Cicero
                </footer>
              </blockquote>

              {/* Divider */}
              <div className="flex justify-center mt-8">
                <div className="bk-divider"></div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Form in Glass Card */}
          <div className="bk-glass-strong rounded-2xl p-8 md:p-12 w-full bk-animate-in stagger-2">
            {/* Title */}
            <h1
              className="text-5xl mb-8 text-center bk-animate-in stagger-3"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                color: 'var(--bk-text)',
                letterSpacing: '0.02em'
              }}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 bk-animate-in stagger-4">
              {/* Name Field - Signup Only */}
              {mode === 'signup' && (
                <div>
                  <Label
                    htmlFor="name"
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      color: 'var(--bk-text-secondary)',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === 'signup'}
                    className="w-full bk-glass-input rounded-lg px-4 py-3 text-base"
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      color: 'var(--bk-text)'
                    }}
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--bk-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bk-glass-input rounded-lg px-4 py-3 text-base"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--bk-text)'
                  }}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--bk-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bk-glass-input rounded-lg px-4 py-3 text-base"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--bk-text)'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="rounded-lg p-4 text-sm bk-glass-strong"
                  style={{
                    border: '1px solid var(--bk-error-border)',
                    color: 'var(--bk-error)',
                    fontFamily: 'DM Sans, sans-serif',
                    backgroundColor: 'var(--bk-error-bg)'
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bk-btn-accent rounded-lg py-3 text-base font-medium"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex justify-center my-8">
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, var(--bk-border) 50%, transparent 100%)'
                }}
              ></div>
            </div>

            {/* Guest & Mode Toggle */}
            <div className="space-y-4 bk-animate-in stagger-5">
              {/* Guest Button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bk-btn-ghost rounded-lg py-3 text-sm font-medium"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Continue as Guest
              </button>

              {/* Mode Toggle */}
              <div className="text-center">
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--bk-text-secondary)',
                    fontSize: '14px'
                  }}
                >
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setError('');
                      setName('');
                      setEmail('');
                      setPassword('');
                    }}
                    className="font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--bk-accent)' }}
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
