import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadButton = ({ onUpload, status }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const isPdf = file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (isPdf) {
      onUpload(file);
    } else {
      toast.error('Please upload a valid PDF file.');
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'loading'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
          status === 'loading'
            ? 'border-slate-700 text-slate-500 bg-slate-800/50'
            : status === 'success'
            ? 'border-green-500/50 text-green-400 bg-green-500/5'
            : 'border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-white/5'
        }`}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        
        {status === 'loading' ? 'Uploading...' : status === 'success' ? 'PDF Ready' : 'Upload PDF'}
      </button>

      {status === 'success' && (
        <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase">
          RAG Mode Active
        </div>
      )}
    </div>
  );
};

export default UploadButton;
