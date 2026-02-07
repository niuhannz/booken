import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
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
    const mmPerPage = 0.07; // ~70 microns per page
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
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=EB+Garamond:wght@400;500&display=swap');

        .decorative-rule {
          width: 100%;
          height: 1px;
          background-color: #e8e2d9;
          margin: 1.5rem 0;
        }

        .project-card {
          background-color: #ffffff;
          border: 1px solid #e8e2d9;
          border-radius: 4px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .project-card:hover {
          box-shadow: 0 8px 24px rgba(44, 36, 32, 0.1);
          border-color: #8b6914;
        }

        .project-card-title {
          font-family: 'EB Garamond', serif;
          font-size: 1.25rem;
          font-weight: 500;
          color: #2c2420;
          margin-bottom: 0.5rem;
        }

        .project-card-author {
          font-family: 'EB Garamond', serif;
          font-size: 0.95rem;
          color: #9a8e82;
          margin-bottom: 1rem;
        }

        .project-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          font-family: 'EB Garamond', serif;
          font-size: 0.875rem;
          color: #9a8e82;
        }

        .version-badge {
          display: inline-block;
          background-color: #f5f3f0;
          color: #2c2420;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-family: 'EB Garamond', serif;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state-text {
          font-family: 'EB Garamond', serif;
          color: #9a8e82;
          font-size: 1.1rem;
          line-height: 1.6;
        }
      `}</style>

      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#e8e2d9' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p
                style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82', fontSize: '14px' }}
              >
                Welcome back, {user?.name || 'Author'}
              </p>
              <h1
                className="text-5xl mt-2"
                style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}
              >
                Your Bookshelf
              </h1>
            </div>
            <button
              onClick={logout}
              className="text-sm px-4 py-2 rounded border transition-colors"
              style={{
                fontFamily: 'EB Garamond, serif',
                color: '#8b6914',
                borderColor: '#8b6914',
                backgroundColor: 'transparent'
              }}
            >
              Sign Out
            </button>
          </div>

          <div className="decorative-rule"></div>

          {/* Action Bar */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search projects by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                style={{
                  fontFamily: 'EB Garamond, serif',
                  borderColor: '#e8e2d9',
                  color: '#2c2420',
                  backgroundColor: '#faf9f6'
                }}
              />
            </div>

            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    backgroundColor: '#8b6914',
                    color: '#ffffff'
                  }}
                >
                  <Plus size={18} />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent style={{ backgroundColor: '#ffffff' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}>
                    Create New Project
                  </DialogTitle>
                  <DialogDescription style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}>
                    Start a new book project by entering its details.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="project-title"
                      style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
                    >
                      Book Title
                    </Label>
                    <Input
                      id="project-title"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="Enter book title"
                      style={{
                        fontFamily: 'EB Garamond, serif',
                        borderColor: '#e8e2d9',
                        color: '#2c2420'
                      }}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="project-author"
                      style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
                    >
                      Author Name
                    </Label>
                    <Input
                      id="project-author"
                      value={newProjectAuthor}
                      onChange={(e) => setNewProjectAuthor(e.target.value)}
                      placeholder="Enter author name"
                      style={{
                        fontFamily: 'EB Garamond, serif',
                        borderColor: '#e8e2d9',
                        color: '#2c2420'
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreating || !newProjectTitle.trim()}
                    className="w-full"
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      backgroundColor: '#8b6914',
                      color: '#ffffff'
                    }}
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </Button>
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
            <Bookmark size={48} style={{ color: '#8b6914', margin: '0 auto 1.5rem' }} />
            <p className="empty-state-text mb-4">
              {projects.length === 0
                ? "No projects yet. Begin your journey by creating your first book."
                : 'No projects match your search. Try a different query.'}
            </p>
            {projects.length === 0 && (
              <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
                <DialogTrigger asChild>
                  <Button
                    style={{
                      fontFamily: 'EB Garamond, serif',
                      backgroundColor: '#8b6914',
                      color: '#ffffff',
                      marginTop: '1.5rem'
                    }}
                  >
                    Create Your First Project
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ backgroundColor: '#ffffff' }}>
                  <DialogHeader>
                    <DialogTitle style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}>
                      Create New Project
                    </DialogTitle>
                    <DialogDescription style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}>
                      Start a new book project by entering its details.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="project-title"
                        style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
                      >
                        Book Title
                      </Label>
                      <Input
                        id="project-title"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="Enter book title"
                        style={{
                          fontFamily: 'EB Garamond, serif',
                          borderColor: '#e8e2d9',
                          color: '#2c2420'
                        }}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="project-author"
                        style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
                      >
                        Author Name
                      </Label>
                      <Input
                        id="project-author"
                        value={newProjectAuthor}
                        onChange={(e) => setNewProjectAuthor(e.target.value)}
                        placeholder="Enter author name"
                        style={{
                          fontFamily: 'EB Garamond, serif',
                          borderColor: '#e8e2d9',
                          color: '#2c2420'
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isCreating || !newProjectTitle.trim()}
                      className="w-full"
                      style={{
                        fontFamily: 'EB Garamond, serif',
                        backgroundColor: '#8b6914',
                        color: '#ffffff'
                      }}
                    >
                      {isCreating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="flex flex-col">
                <div
                  className="project-card flex-1 flex flex-col"
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
                    <div
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: '#e8e2d9' }}
                    >
                      <p
                        className="text-sm font-medium mb-3"
                        style={{ fontFamily: 'EB Garamond, serif', color: '#2c2420' }}
                      >
                        Version History
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {project.versions.map((version) => (
                          <div
                            key={version.id}
                            className="text-xs p-2 rounded"
                            style={{
                              backgroundColor: '#f5f3f0',
                              fontFamily: 'EB Garamond, serif',
                              color: '#9a8e82'
                            }}
                          >
                            <div className="flex items-center gap-2 font-medium">
                              <Clock size={12} />
                              {version.label}
                            </div>
                            <div>{version.wordCount} words</div>
                            <div className="text-[11px]">{formatDate(version.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleOpenProject(project.id, 'typeset')}
                      size="sm"
                      className="flex-1 gap-2"
                      style={{
                        fontFamily: 'EB Garamond, serif',
                        backgroundColor: '#8b6914',
                        color: '#ffffff'
                      }}
                    >
                      <Edit3 size={14} />
                      Typeset
                    </Button>
                    <Button
                      onClick={() => handleOpenProject(project.id, 'cover')}
                      size="sm"
                      className="flex-1 gap-2"
                      style={{
                        fontFamily: 'EB Garamond, serif',
                        backgroundColor: '#8b6914',
                        color: '#ffffff'
                      }}
                    >
                      <Edit3 size={14} />
                      Cover
                    </Button>

                    <AlertDialog open={projectToDelete === project.id} onOpenChange={(open: boolean) => {
                      if (!open) setProjectToDelete(null);
                    }}>
                      <button
                        onClick={() => setProjectToDelete(project.id)}
                        className="p-2 rounded border transition-colors"
                        style={{
                          color: '#c02c2c',
                          borderColor: '#e8e2d9',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <AlertDialogContent style={{ backgroundColor: '#ffffff' }}>
                        <AlertDialogHeader>
                          <AlertDialogTitle style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}>
                            Delete Project
                          </AlertDialogTitle>
                          <AlertDialogDescription style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}>
                            Are you sure you want to delete "{project.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3">
                          <AlertDialogCancel style={{
                            fontFamily: 'EB Garamond, serif',
                            color: '#2c2420',
                            borderColor: '#e8e2d9'
                          }}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProject(project.id)}
                            style={{
                              fontFamily: 'EB Garamond, serif',
                              backgroundColor: '#c02c2c',
                              color: '#ffffff'
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
                <div
                  className="text-xs text-center mt-3 py-2 rounded"
                  style={{
                    fontFamily: 'EB Garamond, serif',
                    color: '#9a8e82',
                    backgroundColor: '#f5f3f0'
                  }}
                >
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
