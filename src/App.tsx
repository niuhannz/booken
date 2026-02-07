import { useStore, StoreProvider } from './lib/store';
import Login from './components/Login';
import Bookshelf from './components/Bookshelf';
import CoverCreator from './components/CoverCreator';
import Typesetter from './components/Typesetter';
import Pricing from './components/Pricing';
import { BookOpen, PenLine, Type, CreditCard, Library, LogOut } from 'lucide-react';

function AppInner() {
  const { view, setView, user, logout } = useStore();

  if (view === 'login' || !user) {
    return <Login />;
  }

  if (view === 'pricing') {
    return <Pricing />;
  }

  const showNav = view === 'bookshelf' || view === 'cover' || view === 'typeset';

  return (
    <div className="flex h-screen flex-col" style={{ background: '#f5f2ed' }}>
      {/* ── Top Nav ── */}
      {showNav && (
        <header
          className="flex items-center justify-between border-b px-6"
          style={{
            background: '#2c2420',
            borderColor: '#1a1815',
            minHeight: 50,
            fontFamily: '"EB Garamond", serif',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => setView('bookshelf')}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <BookOpen className="h-5 w-5" style={{ color: '#c9a84c' }} />
            <span
              className="text-lg"
              style={{
                fontFamily: '"Playfair Display", serif',
                color: '#ede4d3',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              Booken
            </span>
            <span
              className="text-[9px] tracking-widest"
              style={{ color: '#8b7a5e', letterSpacing: '0.15em' }}
            >
              .io
            </span>
          </button>

          {/* Nav */}
          <nav className="flex gap-1" style={{ fontFamily: '"EB Garamond", serif' }}>
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

          {/* User */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: '#c9a84c', color: '#2c2420' }}
            >
              {user.avatar}
            </div>
            <span className="hidden text-sm sm:block" style={{ color: '#b5a898' }}>
              {user.name}
            </span>
            {user.plan === 'pro' && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider"
                style={{ background: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44' }}
              >
                PRO
              </span>
            )}
            <button
              onClick={logout}
              className="ml-1 rounded p-1 transition-colors hover:bg-white/10"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" style={{ color: '#8b7a5e' }} />
            </button>
          </div>
        </header>
      )}

      {/* ── Content ── */}
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
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors"
      style={{
        fontWeight: active ? 500 : 400,
        color: active ? '#ede4d3' : '#8b7a5e',
        background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
