import React from 'react';
import { Rabbit, Cat } from 'lucide-react';

const Message = ({ text, sender, isTyping, timestamp }) => {
  const isUser = sender === 'user';

  // Use the actual message timestamp when available; fall back to now for brand-new messages
  const displayTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-6 message-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center shadow-cute border-2 border-white ${
          isUser
            ? 'bg-[#ff9ebd] text-white shadow-[0_4px_10px_rgba(255,158,189,0.3)] hover:-translate-y-1 transition-transform'
            : 'bg-[#9dd6f9] text-white shadow-[0_4px_10px_rgba(157,214,249,0.3)] animate-float'
        }`}>
          {isUser ? <Rabbit className="h-6 w-6" /> : <Cat className="h-6 w-6" />}
        </div>

        {/* Bubble */}
        <div className={`relative px-5 py-3.5 rounded-3xl text-[15px] font-semibold leading-relaxed shadow-sm border border-white/50 backdrop-blur-sm ${
          isUser
            ? 'bg-white text-slate-700 rounded-br-sm'
            : 'bg-white/80 text-slate-700 rounded-bl-sm'
        }`}>
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-2 px-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{text}</p>
          )}

          {/* Actual send time */}
          <div className={`text-[10px] mt-1 opacity-50 uppercase font-bold tracking-widest ${isUser ? 'text-right' : 'text-left'}`}>
            {displayTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
