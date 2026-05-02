import React from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

const CatConfirmModal = ({ t, title, description, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
  const handleCancel = () => {
    toast.dismiss(t.id);
    if (onCancel) onCancel();
  };

  const handleConfirm = async () => {
    toast.dismiss(t.id);
    if (onConfirm) await onConfirm();
  };

  // We use a Portal to escape any transform styles from the toast container
  return createPortal(
    <div 
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-pink-100/20 backdrop-blur-sm transition-opacity duration-300 ${t.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ pointerEvents: t.visible ? 'auto' : 'none' }}
    >
      <div 
        className={`relative w-full max-w-sm bg-white border-4 border-pink-200 shadow-[0_10px_40px_rgba(255,182,193,0.3)] rounded-3xl p-8 flex flex-col gap-4 transform transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${t.visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-20'}`}
      >
        {/* Cute Cat Image/Icon on Top */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-28 h-28 pointer-events-none animate-float">
          <img 
            src="/src/assets/meow.png" 
            alt="Cat" 
            className="w-full h-full object-contain drop-shadow-2xl" 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <span className="hidden text-7xl drop-shadow-md">🐱</span>
        </div>

        <div className="flex flex-col gap-3 text-center mt-8">
          <h3 className="text-3xl font-pixel font-bold text-pink-500 tracking-wide">{title}</h3>
          <p className="text-base font-semibold text-slate-500 leading-relaxed px-2">
            {description}
          </p>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 text-sm font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all shadow-cute active:shadow-cute-active active:translate-y-1 hover:-translate-y-0.5 border-2 border-transparent hover:border-slate-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-[#ffa1a1] hover:bg-[#ff8dae] text-white text-sm font-bold rounded-2xl transition-all shadow-[#e57d7d] shadow-[0_4px_0_0_#e57d7d] active:shadow-[0_0px_0_0_#e57d7d] active:translate-y-1 hover:-translate-y-1"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const showCatConfirm = (props) => {
  toast.custom((t) => <CatConfirmModal t={t} {...props} />, {
    duration: Infinity,
    position: 'top-center'
  });
};

export default CatConfirmModal;
