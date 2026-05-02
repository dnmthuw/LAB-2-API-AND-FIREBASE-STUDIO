import React, { useState } from 'react';
import { Send, Hash } from 'lucide-react';

const InputBox = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-[#fdf2f8] via-[#fdf2f8]/90 to-transparent">
      <form 
        onSubmit={handleSend}
        className="max-w-4xl mx-auto relative group"
      >
        {/* Cat Ears */}
        <div className="absolute -top-6 left-6 w-8 h-6 text-pink-300 transition-transform duration-300 origin-bottom hover-wiggle">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,100 L50,0 L100,100 Z" />
          </svg>
        </div>
        <div className="absolute -top-6 right-6 w-8 h-6 text-pink-300 transition-transform duration-300 origin-bottom hover-wiggle">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0,100 L50,0 L100,100 Z" />
          </svg>
        </div>

        <div className="absolute inset-0 bg-pink-300/10 blur-2xl rounded-3xl group-focus-within:bg-pink-300/20 transition-all" />
        
        <div className="relative glass-panel rounded-2xl flex items-end p-2 gap-2 shadow-2xl">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-pink-300 py-3 px-4 resize-none max-h-48 min-h-[52px] font-semibold"
          />
          
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`p-3 rounded-2xl transition-all duration-200 transform shadow-cute active:shadow-cute-active active:translate-y-1 ${
              text.trim() && !disabled 
                ? 'bg-[#ff9ebd] text-white hover:bg-[#ff8dae] hover:-translate-y-0.5' 
                : 'bg-slate-200 text-slate-400 shadow-none active:shadow-none'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-[10px] text-center text-pink-400 mt-3 uppercase tracking-widest font-bold">
          Ai chatbot can make mistakes. Verify important info 🐾
        </p>
      </form>
    </div>
  );
};

export default InputBox;
