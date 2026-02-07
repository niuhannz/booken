import { useStore, StoreProvider } from './lib/store';
import { ThemeProvider, useTheme } from './lib/theme';
import Login from './components/Login';
import Bookshelf from './components/Bookshelf';
import CoverCreator from './components/CoverCreator';
import Typesetter from './components/Typesetter';
import Pricing from './components/Pricing';
import { BookOpen, PenLine, Type, CreditCard, Library, LogOut, Sun, Moon } from 'lucide-react';

function AppInner() {
  const { view, setView, user, logout } = useStore();
  const { theme, toggleTheme } = useTheme();

  if (view === 'login' || !user) {
    return <Login />;
  }

  if (view === 'pricing') {
    return <Pricing />;
  }

  const showNav = view === 'bookshelf' || view === 'cover' || view === 'typeset';

  return (
    <div className="flex h-screen flex-col bk-animate-in" style={{ background: 'var(--bk-bg)' }}>
      {/* ── Glass Morphism Nav ── */}
      {showNav && (
        <header
          className="bk-glass"
          style={{
            minHeight: 52,
            background: 'var(--bk-surface)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--bk-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          {/* Logo */}
          <button
            onClick={() => setView('bookshelf')}
            className="flex items-center gap-2 transition-all duration-300 hover:opacity-85 focus:outline-none"
          >
            <BookOpen className="h-5 w-5 transition-transform hover:scale-110" style={{ color: 'var(--bk-accent)' }} />
            <span
              className="bk-display text-lg tracking-tight"
              style={{
                color: 'var(--bk-text-heading)',
                fontWeight: 300,
                letterSpacing: '0.02em',
              }}
            >
              Booken
            </span>
            <span
              className="bk-ui text-[10px] font-medium"
              style={{
                color: 'var(--bk-accent)',
                opacity: 0.7,
                letterSpacing: '0.08em',
              }}
            >
              .io
            </span>
          </button>

          {/* Nav Buttons */}
          <nav className="flex gap-0.5" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            <NavBtn
              active={view === 'bookshelf'}
              onClick={() => setView('bookshelf')}
              icon={<Library className="h-3.5 w-3.5" />}
              label="Bookshelf"
            />
            <NavBtn
              active={view === 'cover'}
              onClick={() => setView('cover')}
              icon={<PenLine className="h-3.5 w-3.5" />}
              label="Cover Creator"
            />
            <NavBtn
              active={view === 'typeset'}
              onClick={() => setView('typeset')}
              icon={<Type className="h-3.5 w-3.5" />}
              label="Typesetter"
            />
            <NavBtn
              active={false}
              onClick={() => setView('pricing')}
              icon={<CreditCard className="h-3.5 w-3.5" />}
              label="Pricing"
            />
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="bk-theme-toggle"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold bk-ui transition-all duration-300 ${
                user.plan === 'pro' ? 'ring-2 ring-[#c4956a] ring-offset-2' : ''
              }`}
              style={{
                background: 'var(--bk-accent)',
                color: 'var(--bk-text-on-accent)',
              }}
            >
              {user.avatar}
            </div>
            <span className="hidden text-sm sm:block bk-ui" style={{ color: 'var(--bk-nav-user)' }}>
              {user.name}
            </span>
            {user.plan === 'pro' && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-widest bk-ui transition-all duration-300"
                style={{
                  background: 'var(--bk-accent-bg)',
                  color: 'var(--bk-accent)',
                  border: '1px solid var(--bk-accent-border-strong)',
                  textTransform: 'uppercase',
                }}
              >
                Pro
              </span>
            )}
            <button
              onClick={logout}
              className="ml-1 rounded p-1.5 transition-all duration-300 focus:outline-none"
              style={{ color: 'var(--bk-accent)' }}
              title="Sign out"
            >
              <LogOut className="h-4 w-4 transition-transform hover:scale-110" style={{ opacity: 0.7 }} />
            </button>
          </div>
        </header>
      )}

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-hidden">
        {view === 'bookshelf' && <Bookshelf />}
        {view === 'cover' && <CoverCreator />}
        {view === 'typeset' && <Typesetter />}
      </main>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all duration-300 bk-ui focus:outline-none relative`}
      style={{
        background: active ? 'var(--bk-accent-bg-subtle)' : 'transparent',
        fontWeight: active ? 500 : 400,
        color: active ? 'var(--bk-nav-text-active)' : 'var(--bk-nav-text)',
      }}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--bk-accent), transparent)',
            boxShadow: '0 0 12px var(--bk-glow-bar)',
          }}
        />
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppInner />
      </StoreProvider>
    </ThemeProvider>
  );
}
