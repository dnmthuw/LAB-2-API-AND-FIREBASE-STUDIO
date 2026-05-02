import React from 'react';

const EmptyState = ({ title, message, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="w-48 h-48 mb-6 relative animate-float">
        <img 
          src="/src/assets/empty.png" 
          alt="Cute Pixel Mascot" 
          className="w-full h-full object-contain drop-shadow-xl"
        />
      </div>
      <h3 className="font-pixel text-3xl text-pink-500 mb-2">{title}</h3>
      <p className="text-[#64748b] mb-6 max-w-sm">{message}</p>
      {actionButton && (
        <div className="mt-2">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
