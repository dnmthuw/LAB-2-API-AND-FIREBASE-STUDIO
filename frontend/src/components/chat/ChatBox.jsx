import React, { useEffect, useRef } from 'react';
import Message from './Message';
import EmptyState from '../ui/EmptyState';

const ChatBox = ({ messages, isLoading }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 custom-scrollbar mb-20" ref={scrollRef}>
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="h-[60vh] flex items-center justify-center">
            <EmptyState 
              title="Meow! How can I help?" 
              message="Ask me anything about your documents or let's just chat! 🌸" 
            />
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Message key={index} text={msg.text} sender={msg.sender} timestamp={msg.timestamp} />
            ))}
            {isLoading && <Message sender="bot" isTyping={true} />}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
