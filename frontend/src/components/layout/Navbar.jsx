import React from 'react';
import { Menu, Sparkles, Folder } from 'lucide-react';

const Navbar = ({ onToggleSidebar, user, onLogout, activeProject }) => {
  return (
    <header className="h-16 border-b border-pink-200 sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between backdrop-blur-xl bg-white/70 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-pink-100 rounded-xl md:hidden text-pink-400 transition-colors hover:scale-105 active:scale-95"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all group active:scale-95"
          onClick={() => window.location.href = '/'}
        >
          <div className="h-11 w-11 rounded-xl overflow-hidden shadow-cute group-hover:rotate-3 transition-transform bg-pink-50 flex items-center justify-center border border-pink-100">
            <img 
              src="/src/assets/sidebar.png" 
              alt="DocuMeow Logo" 
              className="h-10 w-10 object-contain image-pixelated" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-2xl tracking-tight leading-none text-pink-600">DOCUMEOW</span>
            <span className="text-[10px] text-[#ff8dae] font-bold uppercase tracking-widest mt-0.5">Pixel PDF Assistant</span>
          </div>
          <div className="ml-1.5 px-2 py-0.5 rounded-lg bg-pink-100 text-[10px] text-pink-500 font-pixel uppercase shadow-sm">
            v1.0
          </div>
        </div>

        {/* Active project badge */}
        {activeProject && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 ml-4 shadow-sm hover:shadow-md transition-shadow">
            <Folder className="h-4 w-4 text-[#ff9ebd]" />
            <span className="text-sm text-slate-600 font-bold max-w-[160px] truncate">
              {activeProject.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-pink-400 uppercase tracking-widest shadow-sm">
          <Sparkles className="h-4 w-4 text-[#ff9ebd]" />
          <span>Cutie-RoBERTa</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
