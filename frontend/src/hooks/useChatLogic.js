import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { projectApi, conversationApi, chatApi, sourceApi } from '../services/api';
import toast from 'react-hot-toast';

export const useChatLogic = () => {
  const navigate = useNavigate();
  
  // ── Auth State ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);

  // ── Project State ──────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // ── Conversation State ─────────────────────────────────────────────────────
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);

  // ── UI State ──────────────────────────────────────────────────────────────
  const [view, setView] = useState('project'); // 'project' | 'chat'
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // ── Auth Listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        localStorage.setItem('token', token);
        loadProjects();
      } else {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
    return () => unsub();
  }, [navigate]);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const loadProjects = async () => {
    try {
      const data = await projectApi.list();
      setProjects(data.projects || []);
      if (data.projects?.length && !activeProjectId) {
        setActiveProjectId(data.projects[0].id);
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  };

  const loadConversations = async (projectId, convId) => {
    setIsLoading(true);
    try {
      const data = await conversationApi.get(projectId, convId);
      const mapped = (data.messages || []).map(m => ({
        text: m.content,
        sender: m.role === 'user' ? 'user' : 'bot',
        timestamp: m.timestamp,
      }));
      setMessages(mapped);
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setActiveConversationId(null);
    setMessages([]);
    setView('project');
  };

  const handleCreateProject = async (name) => {
    try {
      const proj = await projectApi.create(name);
      setProjects(prev => [...prev, { ...proj, source_count: 0, conversation_count: 0 }]);
      setActiveProjectId(proj.id);
      return proj;
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await projectApi.delete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setActiveConversationId(null);
        setMessages([]);
      }
      toast.success('Project deleted successfully');
    } catch (e) {
      toast.error('Could not delete project');
    }
  };

  const handleSelectConversation = async (conv) => {
    setActiveConversationId(conv.id);
    setView('chat');
    await loadConversations(activeProjectId, conv.id);
  };

  const handleNewConversation = async (projectId) => {
    try {
      const conv = await conversationApi.create(projectId);
      if (projectId === activeProjectId) {
        setActiveConversationId(conv.id);
        setMessages([]);
        setView('chat');
      }
      return conv;
    } catch (e) {
      toast.error('Failed to create conversation');
    }
  };

  const handleDeleteConversation = async (projectId, convId) => {
    try {
      await conversationApi.delete(projectId, convId);
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleUploadPdf = async (projectId, file) => {
    try {
      const result = await sourceApi.uploadPdf(projectId, file);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, source_count: (p.source_count || 0) + 1 } : p));
      return result;
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to upload PDF');
      return null;
    }
  };

  const handleAddText = async (projectId, name, content) => {
    try {
      const result = await sourceApi.addText(projectId, name, content);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, source_count: (p.source_count || 0) + 1 } : p));
      return result;
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add text');
      return null;
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || !activeProjectId) return;

    const userMsg = { text, sender: 'user', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await chatApi.send(activeProjectId, text, activeConversationId);
      if (result.conversation_id && result.conversation_id !== activeConversationId) {
        setActiveConversationId(result.conversation_id);
      }
      const botMsg = {
        text: result.answer || "No answer found.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        confidence: result.confidence,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorDetail = e.response?.data?.detail || 'Connection error. Please try again.';
      setMessages(prev => [...prev, { text: `❌ ${errorDetail}`, sender: 'bot', timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
