import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ── Types ──
export interface CoverTextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
}

export interface ProjectVersion {
  id: string;
  label: string;
  timestamp: number;
  manuscriptSnippet: string;
  wordCount: number;
}

export interface Project {
  id: string;
  title: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  manuscript: string;
  coverImage: string | null;
  coverTextLayers: CoverTextLayer[];
  versions: ProjectVersion[];
  trimSize: string;
  pageCount: number;
}

export type View = 'login' | 'bookshelf' | 'cover' | 'typeset' | 'pricing';

export interface User {
  name: string;
  email: string;
  plan: 'free' | 'pro';
  avatar: string;
}

// ── Store ──
interface Store {
  user: User | null;
  view: View;
  projects: Project[];
  activeProjectId: string | null;
  setView: (v: View) => void;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  createProject: (title: string, author: string) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | null;
  saveVersion: (projectId: string, label: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be within StoreProvider');
  return ctx;
}

// ── Mock data ──
const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'The Glass Meridian',
    author: 'Eleanor Ashworth',
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 2,
    manuscript: '',
    coverImage: null,
    coverTextLayers: [],
    versions: [
      { id: 'v1', label: 'First draft', timestamp: Date.now() - 86400000 * 14, manuscriptSnippet: 'The morning light crept through...', wordCount: 45200 },
      { id: 'v2', label: 'After edits', timestamp: Date.now() - 86400000 * 7, manuscriptSnippet: 'The morning light crept through...', wordCount: 43800 },
      { id: 'v3', label: 'Final review', timestamp: Date.now() - 86400000 * 2, manuscriptSnippet: 'The morning light crept through...', wordCount: 44100 },
    ],
    trimSize: '5.5" × 8.5"',
    pageCount: 312,
  },
  {
    id: 'p2',
    title: 'Cartographies of Silence',
    author: 'Eleanor Ashworth',
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 10,
    manuscript: '',
    coverImage: null,
    coverTextLayers: [],
    versions: [
      { id: 'v1', label: 'Draft', timestamp: Date.now() - 86400000 * 45, manuscriptSnippet: 'In the beginning there was...', wordCount: 62000 },
    ],
    trimSize: '6" × 9"',
    pageCount: 248,
  },
  {
    id: 'p3',
    title: 'Letters from the Understory',
    author: 'Thomas Blackwell',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    manuscript: '',
    coverImage: null,
    coverTextLayers: [],
    versions: [],
    trimSize: '5" × 8"',
    pageCount: 0,
  },
];

let _idCounter = 100;
function uid() {
  return 'id_' + (++_idCounter) + '_' + Date.now();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('login');
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const login = useCallback((email: string, _pw: string) => {
    setUser({
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      plan: 'pro',
      avatar: email.charAt(0).toUpperCase(),
    });
    setView('bookshelf');
  }, []);

  const signup = useCallback((name: string, email: string, _pw: string) => {
    setUser({ name, email, plan: 'free', avatar: name.charAt(0).toUpperCase() });
    setView('bookshelf');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setView('login');
  }, []);

  const createProject = useCallback((title: string, author: string): string => {
    const id = uid();
    const proj: Project = {
      id,
      title,
      author,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      manuscript: '',
      coverImage: null,
      coverTextLayers: [],
      versions: [],
      trimSize: '5.5" × 8.5"',
      pageCount: 0,
    };
    setProjects(prev => [proj, ...prev]);
    return id;
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId(null);
  }, [activeProjectId]);

  const setActive = useCallback((id: string | null) => {
    setActiveProjectId(id);
  }, []);

  const getActiveProject = useCallback((): Project | null => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const saveVersion = useCallback((projectId: string, label: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const v: ProjectVersion = {
          id: uid(),
          label,
          timestamp: Date.now(),
          manuscriptSnippet: p.manuscript.substring(0, 80) + '...',
          wordCount: p.manuscript.split(/\s+/).filter(w => w.length > 0).length,
        };
        return { ...p, versions: [...p.versions, v], updatedAt: Date.now() };
      }),
    );
  }, []);

  return (
    <StoreContext.Provider
      value={{
        user,
        view,
        projects,
        activeProjectId,
        setView,
        login,
        signup,
        logout,
        createProject,
        updateProject,
        deleteProject,
        setActiveProject: setActive,
        getActiveProject,
        saveVersion,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
