import React from 'react';

const CuteButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false,
  icon = null
}) => {
  const baseStyle = "relative inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-2xl transition-all duration-200 shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:active:shadow-cute";
  
  const variants = {
    primary: "bg-[#ff9ebd] text-white hover:bg-[#ff8dae] shadow-[#e07b9a]",
    secondary: "bg-[#9dd6f9] text-white hover:bg-[#8ccdf4] shadow-[#7bbfe8]",
    success: "bg-[#9be8c9] text-[#2d6b4f] hover:bg-[#8ae0be] shadow-[#7ad1ae]",
    danger: "bg-[#ffa1a1] text-white hover:bg-[#ff9191] shadow-[#e57d7d]",
    ghost: "bg-transparent text-[#64748b] hover:bg-[#f1f5f9] shadow-none active:shadow-none hover:text-[#475569]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} group`}
    >
      <span className="text-lg transition-transform duration-300 animate-paw">🐾</span>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default CuteButton;
