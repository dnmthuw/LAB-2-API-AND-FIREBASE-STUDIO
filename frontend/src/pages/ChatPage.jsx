import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

import Sidebar from '../components/layout/Sidebar';
import ProjectDashboard from '../components/layout/ProjectDashboard';
import ChatBox from '../components/chat/ChatBox';
import InputBox from '../components/chat/InputBox';
import { ArrowLeft } from 'lucide-react';

import { useChatLogic } from '../hooks/useChatLogic';
import { showCatConfirm } from '../components/ui/CatConfirmModal';
import mascot from '../assets/empty.png';

const ChatPage = () => {
  const navigate = useNavigate();
  const {
    user,
    projects,
    activeProjectId,
    activeConversationId,
    messages,
    view,
    isLoading,
    sidebarExpanded,
    setSidebarExpanded,
    setView,
    handleSelectProject,
    handleCreateProject,
    handleDeleteProject,
    handleSelectConversation,
    handleNewConversation,
    handleDeleteConversation,
    handleUploadPdf,
    handleAddText,
    handleSendMessage
  } = useChatLogic();

  // ── Logout Handler (UI Specific) ───────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#fdf2f8] text-slate-700 overflow-hidden font-sans">
      
      {/* 1. Sidebar (Left Pane) */}
      <Sidebar
        expanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={(id) => showCatConfirm({
          title: "Delete Project?",
          description: "This action cannot be undone. All documents and chat history will be permanently deleted.",
          confirmText: "Delete Now",
          cancelText: "Cancel",
          onConfirm: () => handleDeleteProject(id)
        })}
        onLogout={handleLogout}
        currentUser={user}
      />

      {/* 2. Main Content (Right Pane) */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-transparent">
        {/* Empty state */}
        {!activeProjectId && (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-pink-400 bg-white/30 backdrop-blur-sm">
            <div className="w-48 h-48 animate-float drop-shadow-xl">
              <img src="/src/assets/meow.png" alt="Mascot" className="w-full h-full object-contain" />
            </div>
            <p className="text-3xl font-pixel text-pink-500 font-bold">Project Workspace</p>
            <p className="text-sm font-semibold text-pink-300">Create or select a project to start chatting</p>
          </div>
        )}

        {/* Project Dashboard View */}
        {activeProjectId && view === 'project' && activeProject && (
          <ProjectDashboard
            project={activeProject}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onUploadPdf={handleUploadPdf}
            onAddText={handleAddText}
          />
        )}

        {/* Chat Interface View */}
        {activeProjectId && view === 'chat' && (
          <div className="flex flex-col h-full w-full">
            <div className="h-16 border-b border-pink-200 flex items-center px-6 shrink-0 bg-white/50 backdrop-blur-md gap-4 shadow-sm z-10">
              <button 
                onClick={() => setView('project')}
                className="p-2 -ml-2 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-xl transition-all active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold font-pixel text-pink-500 flex items-center gap-2">
                <span className="text-[#ff9ebd]">#</span>
                {activeProject?.name}
              </h1>
            </div>
            <ChatBox messages={messages} isLoading={isLoading} />
            <InputBox onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
