import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, MessageSquare, Trash2, Upload, Plus,
  Type
} from 'lucide-react';
import { sourceApi, conversationApi } from '../../services/api';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import EmptyState from '../ui/EmptyState';
import CuteButton from '../ui/CuteButton';
import { showCatConfirm } from '../ui/CatConfirmModal';

const ProjectDashboard = ({
  project,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUploadPdf,
  onAddText
}) => {
  // Data state
  const [sources, setSources] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Add text state
  const [showAddText, setShowAddText] = useState(false);
  const [textName, setTextName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);

  useEffect(() => {
    if (project?.id) {
      loadSources();
      loadConversations();
    }
  }, [project?.id]);

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const data = await sourceApi.list(project.id);
      setSources(data.sources || []);
    } catch (e) {
      console.error('Failed to load sources', e);
    } finally {
      setLoadingSources(false);
    }
  };

  const loadConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await conversationApi.list(project.id);
      setConversations(data.conversations || []);
    } catch (e) {
      console.error('Failed to load conversations', e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await onUploadPdf(project.id, file);
      if (result) {
        toast.success(`Uploaded ${result.filename}`);
        await loadSources();
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddText = async () => {
    if (!textName.trim() || !textContent.trim()) return;
    setIsAddingText(true);
    try {
      const result = await onAddText(project.id, textName, textContent);
      if (result) {
        toast.success(`Source "${textName}" added`);
        await loadSources();
        setShowAddText(false);
        setTextName('');
        setTextContent('');
      }
    } finally {
      setIsAddingText(false);
    }
  };

  const handleDeleteSource = (sourceId) => {
    showCatConfirm({
      title: "Delete Document?",
      description: "Are you sure you want to delete this document from the project?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await sourceApi.remove(project.id, sourceId);
          setSources(prev => prev.filter(s => s.id !== sourceId));
          toast.success('Document deleted');
        } catch (e) {
          toast.error('Error deleting document');
        }
      }
    });
  };

  const handleCreateConv = async () => {
    const conv = await onNewConversation(project.id);
    if (conv) {
      await loadConversations();
    }
  };

  const handleDeleteConv = (convId) => {
    showCatConfirm({
      title: "Delete Conversation?",
      description: "All message history in this conversation will be deleted. Are you sure?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await onDeleteConversation(project.id, convId);
          setConversations(prev => prev.filter(c => c.id !== convId));
          toast.success('Conversation deleted');
        } catch (e) {
          toast.error('Error deleting conversation');
        }
      }
    });
  };

  if (!project) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
      <div className="p-4 border-b border-pink-100 bg-white/50 backdrop-blur-sm shrink-0">
        <h2 className="font-bold text-3xl text-pink-400 font-pixel">{project.name}</h2>
        <p className="text-slate-500 text-sm">{project.description || 'Workspace'}</p>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          
          {/* Sources Section */}
          <div className="glass-panel rounded-3xl flex flex-col min-h-0 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-pink-100 bg-linear-to-r from-pink-50 to-transparent flex items-center justify-between">
              <h3 className="font-bold text-xl text-pink-400 font-pixel">Sources ({sources.length})</h3>
            </div>
            
            <div className="p-3 flex flex-col flex-1 min-h-0">
              {/* Actions */}
              <div className="flex gap-3 mb-4 shrink-0">
                <div className="flex-1 relative group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="upload-pdf-btn"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="upload-pdf-btn"
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 bg-[#9dd6f9] border border-[#9dd6f9] rounded-2xl text-sm font-bold text-white transition-all text-center select-none shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#8ccdf4]'}`}
                  >
                    <Upload className="h-5 w-5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
                  </label>
                </div>
                <button
                  onClick={() => setShowAddText(v => !v)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#9be8c9] border border-[#9be8c9] text-[#2d6b4f] rounded-2xl text-sm font-bold hover:bg-[#8ae0be] transition-all shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5"
                >
                  <Type className="h-5 w-5" />
                  <span>Add Text</span>
                </button>
              </div>

              {/* Add Text Form */}
              {showAddText && (
                <div className="bg-pink-50/50 border border-pink-100 p-4 rounded-2xl space-y-3 mb-4 shrink-0 shadow-inner">
                  <input
                    value={textName}
                    onChange={e => setTextName(e.target.value)}
                    placeholder="Source name..."
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-pink-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                  <textarea
                    value={textContent}
                    onChange={e => setTextContent(e.target.value)}
                    placeholder="Paste text content here..."
                    className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm text-slate-700 placeholder:text-pink-300 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 h-24 resize-none transition-all"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddText(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={handleAddText} disabled={isAddingText} className="px-4 py-2 text-sm font-bold bg-[#9be8c9] hover:bg-[#8ae0be] text-[#2d6b4f] rounded-xl disabled:opacity-50 shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5 transition-all">
                      {isAddingText ? 'Saving...' : 'Save Text'}
                    </button>
                  </div>
                </div>
              )}

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loadingSources ? (
                  <div className="flex h-full items-center justify-center text-pink-400 font-bold">Loading sources...</div>
                ) : sources.length === 0 ? (
                  <EmptyState title="No Sources" message="Upload a PDF or add text to start teaching your bot!" />
                ) : (
                  <div className="space-y-2 p-1">
                    {sources.map(source => (
                      <div key={source.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl hover:bg-pink-50 group border border-pink-100 hover:border-pink-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                        <div className={`p-2 rounded-xl ${source.type === 'text' ? 'bg-[#9be8c9]/20 text-[#2d6b4f]' : 'bg-[#9dd6f9]/20 text-[#0284c7]'}`}>
                           {source.type === 'text' ? <Type className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate group-hover:text-pink-500 transition-colors">{source.name || source.filename}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-pink-400 uppercase font-bold tracking-wider">{source.type}</p>
                            <span className="text-[10px] text-slate-300">•</span>
                            <p className="text-[10px] text-slate-400 italic">{formatDate(source.uploaded_at)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSource(source.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded-xl transition-all active:scale-95 hover:rotate-12"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversations Section */}
          <div className="glass-panel rounded-3xl flex flex-col min-h-0 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-pink-100 bg-linear-to-r from-pink-50 to-transparent flex items-center justify-between">
              <h3 className="font-bold text-xl text-pink-400 font-pixel">Conversations</h3>
              <button
                onClick={handleCreateConv}
                className="flex items-center gap-2 py-2 px-4 bg-[#ff9ebd] hover:bg-[#ff8dae] text-white rounded-2xl text-sm font-bold transition-all shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                New
              </button>
            </div>

            <div className="p-3 flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex h-full items-center justify-center text-pink-400 font-bold">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <EmptyState title="No Chats" message="Create a new conversation to start chatting!" />
              ) : (
                <div className="space-y-2 p-1">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-2 p-3 bg-white rounded-2xl group cursor-pointer border border-pink-100 hover:bg-pink-50 hover:border-pink-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
                      onClick={() => onSelectConversation(conv)}
                    >
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-pink-100 text-pink-400 group-hover:bg-pink-200 group-hover:text-pink-500 transition-colors">
                          <MessageSquare className="h-5 w-5 shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-slate-700 group-hover:text-pink-500 transition-colors">
                            {conv.title || 'New Conversation'}
                          </p>
                          <p className="text-[10px] text-slate-400 italic">
                            {formatDate(conv.created_at)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded-xl transition-all shrink-0 active:scale-95 hover:rotate-12"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;

