import React, { useState } from 'react';
import {
  Folder, PlusCircle, Trash2, LogOut, PanelLeftClose, PanelLeftOpen, Rabbit
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const Sidebar = ({
  expanded,
  onToggleExpand,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onLogout,
  currentUser,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setShowCreateProject(false);
  };

  return (
    <aside className={`bg-white/80 backdrop-blur-md border-r border-pink-100 flex flex-col h-full transition-all duration-300 ${expanded ? 'w-72' : 'w-20'} shrink-0 shadow-[4px_0_24px_rgba(255,182,193,0.1)] z-10`}>
      {/* Branding Logo */}
      <div className={`p-4 mt-2 flex items-center gap-3 transition-all duration-300 ${!expanded ? 'justify-center' : 'justify-start border-b border-pink-50 pb-4'}`}>
        <div className="h-11 w-11 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-100 shadow-sm shrink-0 hover:rotate-6 transition-transform">
          <img src="/src/assets/sidebar.png" alt="DocuMeow" className="h-9 w-9 image-pixelated" />
        </div>
        {expanded && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500 overflow-hidden">
            <span className="font-pixel text-xl text-pink-600 leading-none tracking-tighter">DOCUMEOW</span>
            <span className="text-[9px] text-pink-400 font-black uppercase tracking-widest mt-1">Pixel Assistant</span>
          </div>
        )}
      </div>

      {/* Header / Toggle */}
      <div className="p-4 flex items-center justify-between">
        {expanded && (
          <span className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em] truncate flex-1">
            Workspaces
          </span>
        )}
        <button
          onClick={onToggleExpand}
          className={`p-1.5 rounded-xl hover:bg-pink-100 text-pink-300 hover:text-pink-500 transition-all hover:-translate-y-0.5 active:translate-y-0 ${!expanded && 'mx-auto'}`}
          title={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {expanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      {/* New Project Button */}
      {expanded && (
        <div className="px-3 pt-4 pb-2">
          {!showCreateProject ? (
            <button
              onClick={() => setShowCreateProject(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#ff9ebd] hover:bg-[#ff8dae] text-white rounded-2xl text-sm font-bold transition-all shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5"
            >
              <PlusCircle className="h-5 w-5" />
              New Project
            </button>
          ) : (
            <div className="bg-pink-50 border border-pink-100 p-3 rounded-2xl space-y-3 shadow-inner">
              <input
                autoFocus
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                placeholder="Project name…"
                className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm text-slate-600 placeholder:text-pink-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all shadow-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 py-2 bg-[#9be8c9] hover:bg-[#8ae0be] text-[#2d6b4f] text-sm font-bold rounded-xl transition-all shadow-cute active:shadow-cute-active active:translate-y-1"
                >
                  Create
                </button>
                <button
                  onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-bold rounded-xl transition-all shadow-cute active:shadow-cute-active active:translate-y-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-2">
        {projects.length === 0 ? (
          expanded ? (
             <div className="text-center py-8 text-sm text-pink-300 italic">No projects yet.</div>
          ) : (
             <div className="flex justify-center p-2"><Folder className="h-4 w-4 text-pink-200" /></div>
          )
        ) : (
          projects.map(project => {
            const isActive = activeProjectId === project.id;
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer group transition-all duration-200 ${
                  isActive ? 'bg-[#ff9ebd]/10 text-[#ff8dae] border-2 border-[#ff9ebd]/30 shadow-sm' : 'text-slate-500 hover:bg-pink-50 hover:text-pink-500 border-2 border-transparent hover:scale-105'
                }`}
                title={!expanded ? project.name : ''}
              >
                <div className={`shrink-0 flex items-center justify-center ${!expanded && 'mx-auto'}`}>
                  <Folder className={`h-5 w-5 ${isActive ? 'text-[#ff9ebd] fill-pink-100' : 'text-slate-300 group-hover:text-pink-400'}`} />
                </div>
                
                {expanded && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-pink-300 italic">
                        {formatDate(project.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteProject(project.id); }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-rose-100 rounded-xl text-slate-300 hover:text-rose-500 transition-all shrink-0 hover:rotate-12"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-pink-100 bg-pink-50/30">
        <div className={`flex items-center gap-3 rounded-2xl hover:bg-pink-100 group transition-all duration-300 ${expanded ? 'px-2 py-2 hover:translate-y-[-2px]' : 'justify-center py-2'}`}>
          <div className="h-9 w-9 rounded-2xl bg-linear-to-tr from-[#ff9ebd] to-[#f9a8d4] flex items-center justify-center text-white shadow-cute shrink-0">
            <Rabbit className="h-5 w-5" />
          </div>
          {expanded && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-600 group-hover:text-pink-600 transition-colors">
                  {currentUser?.displayName || 'User Account'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email || ''}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-rose-100 rounded-xl text-slate-400 hover:text-rose-500 transition-all shrink-0 active:scale-95"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
