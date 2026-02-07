import React, { useState } from 'react';
import { useStore } from '@/lib/store';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit3, Trash2, Bookmark, Clock } from 'lucide-react';

export default function Bookshelf() {
  const {
    user,
    projects,
    setView,
    setActiveProject,
    createProject,
    deleteProject,
    logout,
  } = useStore();

  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectAuthor, setNewProjectAuthor] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    setIsCreating(true);
    try {
      await createProject(
        newProjectTitle,
        newProjectAuthor || 'Anonymous',
      );
      setNewProjectTitle('');
      setNewProjectAuthor('');
      setShowNewProjectDialog(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (projectId: string, editor: 'typeset' | 'cover') => {
    setActiveProject(projectId);
    setView(editor);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjectToDelete(null);
  };

  const calculateSpineWidth = (pageCount: number): string => {
    const mmPerPage = 0.07;
    return (pageCount * mmPerPage).toFixed(2);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bk-bg)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Cormorant+Garamond:wght@300;400;500&display=swap');

        .bk-glass {
          background: var(--bk-card-surface);
          backdrop-filter: blur(10px);
          border: 1px solid var(--bk-card-border);
          border-radius: 0.75rem;
        }

        .bk-glass-input {
          background: var(--bk-card-surface-strong);
          backdrop-filter: blur(8px);
          border: 1px solid var(--bk-card-border-strong);
          color: var(--bk-text);
          font-family: 'DM Sans', sans-serif;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .bk-glass-input::placeholder {
          color: var(--bk-text-secondary);
        }

        .bk-glass-input:focus {
          outline: none;
          border-color: var(--bk-accent-border-strong);
          background: var(--bk-card-surface-hover);
          box-shadow: 0 0 20px var(--bk-shadow-accent);
        }

        .bk-btn-accent {
          background: linear-gradient(135deg, var(--bk-accent) 0%, var(--bk-accent-hover) 100%);
          color: var(--bk-bg);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          border: none;
          border-radius: 0.5rem;
          padding: 0.625rem 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .bk-btn-accent:hover {
          box-shadow: 0 8px 24px var(--bk-accent-border);
          transform: translateY(-2px);
        }

        .bk-btn-accent:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .bk-btn-ghost {
          background: transparent;
          color: var(--bk-text);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          border: 1px solid var(--bk-card-border);
          border-radius: 0.5rem;
          padding: 0.625rem 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .bk-btn-ghost:hover {
          background: var(--bk-card-surface-hover);
          border-color: var(--bk-card-border-strong);
        }

        .bk-card-hover {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .bk-card-hover:hover {
          border-color: var(--bk-accent-border);
          background: var(--bk-card-surface-hover);
          box-shadow: 0 8px 32px var(--bk-accent-bg), 0 0 1px var(--bk-shadow-accent);
          transform: translateY(-4px);
        }

        .bk-animate-in {
          animation: slideInUp 0.6s ease-out forwards;
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

        .decorative-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--bk-card-border) 50%, transparent 100%);
          margin: 2rem 0;
        }

        .project-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--bk-text);
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .project-card-author {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: var(--bk-text-secondary);
          margin-bottom: 1rem;
          font-weight: 400;
        }

        .project-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8125rem;
          color: var(--bk-text-secondary);
          flex-wrap: wrap;
        }

        .version-badge {
          display: inline-block;
          background: var(--bk-accent-bg);
          color: var(--bk-accent);
          padding: 0.375rem 0.875rem;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid var(--bk-accent-border);
          backdrop-filter: blur(4px);
          margin-bottom: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 6rem 2rem;
        }

        .empty-state-icon {
          color: var(--bk-text-muted);
          margin: 0 auto 2rem;
          opacity: 0.6;
        }

        .empty-state-text {
          font-family: 'Cormorant Garamond', serif;
          color: var(--bk-text-secondary);
          font-size: 1.25rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-weight: 300;
          letter-spacing: -0.3px;
        }

        .version-history-item {
          background: var(--bk-card-surface);
          border: 1px solid var(--bk-border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--bk-text-secondary);
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .version-history-item:hover {
          background: var(--bk-card-surface-strong);
          border-color: var(--bk-card-border-strong);
        }

        .version-history-label {
          color: var(--bk-accent);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .glass-dialog-content {
          background: rgba(17, 17, 24, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid var(--bk-card-border);
          color: var(--bk-text);
        }

        .glass-dialog-header {
          border-bottom: 1px solid var(--bk-card-border);
        }

        .glass-dialog-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.875rem;
          font-weight: 400;
          color: var(--bk-text);
          letter-spacing: -0.5px;
        }

        .glass-dialog-description {
          font-family: 'DM Sans', sans-serif;
          color: var(--bk-text-secondary);
          font-size: 0.9375rem;
        }

        .spine-width-pill {
          background: var(--bk-accent-bg);
          border: 1px solid var(--bk-accent-border);
          color: var(--bk-accent);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          text-align: center;
          backdrop-filter: blur(4px);
          margin-top: 1rem;
        }

        .header-glass-panel {
          background: var(--bk-card-surface);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--bk-card-border);
        }

        .welcome-text {
          font-family: 'DM Sans', sans-serif;
          color: var(--bk-text-secondary);
          font-size: 0.9375rem;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .bookshelf-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.75rem;
          font-weight: 300;
          color: var(--bk-text);
          letter-spacing: -1px;
          margin-top: 0.5rem;
        }

        .action-button-small {
          background: linear-gradient(135deg, var(--bk-accent) 0%, var(--bk-accent-hover) 100%);
          color: var(--bk-bg);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 0.8125rem;
          border: none;
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          flex: 1;
        }

        .action-button-small:hover {
          box-shadow: 0 6px 20px var(--bk-accent-border);
          transform: translateY(-1px);
        }

        .delete-button-glass {
          background: transparent;
          border: 1px solid var(--bk-card-border-strong);
          color: var(--bk-text-secondary);
          border-radius: 0.375rem;
          padding: 0.5rem 0.625rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-button-glass:hover {
          color: var(--bk-delete);
          border-color: var(--bk-delete-border);
          background: var(--bk-delete-bg);
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .card-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Header */}
      <div className="header-glass-panel">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="welcome-text">
                Welcome back, {user?.name || 'Author'}
              </p>
              <h1 className="bookshelf-title">
                Your Bookshelf
              </h1>
            </div>
            <button
              onClick={logout}
              className="bk-btn-ghost"
            >
              Sign Out
            </button>
          </div>

          <div className="decorative-divider"></div>

          {/* Action Bar */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bk-glass-input w-full"
              />
            </div>

            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <button className="bk-btn-accent">
                  <Plus size={18} />
                  New Project
                </button>
              </DialogTrigger>
              <DialogContent className="glass-dialog-content">
                <DialogHeader className="glass-dialog-header">
                  <DialogTitle className="glass-dialog-title">
                    Create New Project
                  </DialogTitle>
                  <DialogDescription className="glass-dialog-description">
                    Start a new book project by entering its details.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="project-title"
                      style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--bk-text)', fontSize: '0.9375rem' }}
                    >
                      Book Title
                    </Label>
                    <Input
                      id="project-title"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="Enter book title"
                      className="bk-glass-input w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="project-author"
                      style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--bk-text)', fontSize: '0.9375rem' }}
                    >
                      Author Name
                    </Label>
                    <Input
                      id="project-author"
                      value={newProjectAuthor}
                      onChange={(e) => setNewProjectAuthor(e.target.value)}
                      placeholder="Enter author name"
                      className="bk-glass-input w-full mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating || !newProjectTitle.trim()}
                    className="bk-btn-accent w-full justify-center"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={56} className="empty-state-icon" />
            <p className="empty-state-text">
              {projects.length === 0
                ? "No projects yet. Begin your journey by creating your first book."
                : 'No projects match your search. Try a different query.'}
            </p>
            {projects.length === 0 && (
              <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                <DialogTrigger asChild>
                  <button className="bk-btn-accent" style={{ margin: '0 auto' }}>
                    Create Your First Project
                  </button>
                </DialogTrigger>
                <DialogContent className="glass-dialog-content">
                  <DialogHeader className="glass-dialog-header">
                    <DialogTitle className="glass-dialog-title">
                      Create New Project
                    </DialogTitle>
                    <DialogDescription className="glass-dialog-description">
                      Start a new book project by entering its details.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="project-title"
                        style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--bk-text)', fontSize: '0.9375rem' }}
                      >
                        Book Title
                      </Label>
                      <Input
                        id="project-title"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="Enter book title"
                        className="bk-glass-input w-full mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="project-author"
                        style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--bk-text)', fontSize: '0.9375rem' }}
                      >
                        Author Name
                      </Label>
                      <Input
                        id="project-author"
                        value={newProjectAuthor}
                        onChange={(e) => setNewProjectAuthor(e.target.value)}
                        placeholder="Enter author name"
                        className="bk-glass-input w-full mt-1"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCreating || !newProjectTitle.trim()}
                      className="bk-btn-accent w-full justify-center"
                    >
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="card-grid">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="bk-animate-in flex flex-col"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="bk-glass bk-card-hover flex-1 flex flex-col p-5"
                  onClick={() =>
                    setExpandedProjectId(
                      expandedProjectId === project.id ? null : project.id
                    )
                  }
                >
                  <div>
                    <h3 className="project-card-title">{project.title}</h3>
                    <p className="project-card-author">by {project.author}</p>

                    <div className="project-meta">
                      <span>Trim: {project.trimSize}</span>
                      <span>{project.pageCount} pages</span>
                      <span>Updated {formatDate(project.updatedAt)}</span>
                    </div>

                    <div className="version-badge">
                      {project.versions.length} version{project.versions.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Expanded Version History */}
                  {expandedProjectId === project.id && project.versions.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bk-card-border)' }}>
                      <p
                        className="text-sm font-medium mb-3"
                        style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--bk-text)' }}
                      >
                        Version History
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {project.versions.map((version) => (
                          <div key={version.id} className="version-history-item">
                            <div className="version-history-label">
                              <Clock size={12} />
                              {version.label}
                            </div>
                            <div>{version.wordCount} words</div>
                            <div style={{ fontSize: '0.75rem' }}>{formatDate(version.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleOpenProject(project.id, 'typeset')}
                      className="action-button-small"
                    >
                      <Edit3 size={14} />
                      Typeset
                    </button>
                    <button
                      onClick={() => handleOpenProject(project.id, 'cover')}
                      className="action-button-small"
                    >
                      <Edit3 size={14} />
                      Cover
                    </button>

                    <AlertDialog open={projectToDelete === project.id} onOpenChange={(open: boolean) => {
                      if (!open) setProjectToDelete(null);
                    }}>
                      <button
                        onClick={() => setProjectToDelete(project.id)}
                        className="delete-button-glass"
                      >
                        <Trash2 size={14} />
                      </button>
                      <AlertDialogContent className="glass-dialog-content">
                        <AlertDialogHeader className="glass-dialog-header">
                          <AlertDialogTitle className="glass-dialog-title">
                            Delete Project
                          </AlertDialogTitle>
                          <AlertDialogDescription className="glass-dialog-description">
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3">
                          <AlertDialogCancel
                            style={{
                              fontFamily: 'DM Sans, sans-serif',
                              color: 'var(--bk-text)',
                              borderColor: 'var(--bk-card-border)',
                              background: 'transparent'
                            }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project.id)}
                            style={{
                              fontFamily: 'DM Sans, sans-serif',
                              backgroundColor: 'var(--bk-delete)',
                              color: 'var(--bk-text-heading)',
                              border: 'none'
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Spine Width Info */}
                <div className="spine-width-pill">
                  Estimated spine: {calculateSpineWidth(project.pageCount)}mm
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
