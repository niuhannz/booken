import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const { login, signup } = useStore();
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#faf9f6' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=EB+Garamond:wght@400;500&display=swap');

        .decorative-rule {
          width: 60px;
          height: 1px;
          background-color: #8b6914;
          margin: 1rem auto;
        }

        .book-motif {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .book-spine {
          width: 60px;
          height: 70px;
          background: linear-gradient(90deg, #9a8e82 0%, #b8a98d 50%, #9a8e82 100%);
          border-radius: 2px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Literary Quote & Decoration */}
        <div className="hidden md:flex flex-col justify-center items-center p-8">
          <div className="book-motif">
            <BookOpen size={64} color="#8b6914" strokeWidth={1.5} />
          </div>

          <div className="text-center">
            <h2
              className="text-3xl mb-2"
              style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}
            >
              Booken
            </h2>
            <p className="text-sm tracking-widest" style={{ fontFamily: 'EB Garamond, serif', color: '#b8a98d', letterSpacing: '0.2em' }}>
              booken.io
            </p>
            <div className="decorative-rule"></div>

            <blockquote className="mt-8 mb-6" style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}>
              <p className="italic text-lg leading-relaxed mb-4">
                "There is no friend as loyal as a book."
              </p>
              <footer className="text-sm" style={{ color: '#b8a98d' }}>
                — Ernest Hemingway
              </footer>
            </blockquote>

            <div className="decorative-rule mt-8"></div>

            <p
              className="text-sm mt-8 leading-relaxed"
              style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}
            >
              Professional book production tools<br />for independent authors and publishers.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div
          className="p-8 md:p-12 rounded-lg shadow-lg"
          style={{ backgroundColor: '#ffffff', borderTop: '2px solid #8b6914' }}
        >
          <h1
            className="text-4xl mb-2 text-center"
            style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h1>

          <div className="decorative-rule"></div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {mode === 'signup' && (
              <div>
                <Label
                  htmlFor="name"
                  style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
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
                  className="mt-2"
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    borderColor: '#e8e2d9',
                    color: '#2c2420'
                  }}
                />
              </div>
            )}

            <div>
              <Label
                htmlFor="email"
                style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
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
                className="mt-2"
                style={{
                  fontFamily: 'EB Garamond, serif',
                  borderColor: '#e8e2d9',
                  color: '#2c2420'
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
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
                className="mt-2"
                style={{
                  fontFamily: 'EB Garamond, serif',
                  borderColor: '#e8e2d9',
                  color: '#2c2420'
                }}
              />
            </div>

            {error && (
              <div
                className="p-3 rounded text-sm"
                style={{ backgroundColor: '#fde2e4', color: '#c02c2c', fontFamily: 'EB Garamond, serif' }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-base font-medium rounded"
              style={{
                fontFamily: 'EB Garamond, serif',
                backgroundColor: '#8b6914',
                color: '#ffffff',
                borderColor: '#8b6914'
              }}
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="decorative-rule my-6"></div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-2 text-sm rounded border transition-all"
              style={{
                fontFamily: 'EB Garamond, serif',
                color: '#8b6914',
                borderColor: '#8b6914',
                backgroundColor: 'transparent'
              }}
            >
              Continue as Guest
            </button>

            <div className="text-center">
              <p style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82', fontSize: '14px' }}>
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
                  className="font-medium"
                  style={{ color: '#8b6914' }}
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
