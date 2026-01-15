import React, { useState, useEffect } from 'react';
import { XCircle, Shield, Loader2 } from 'lucide-react';
import { CourseMaterial } from '../../../types';

interface SecureMaterialViewerProps {
  material: CourseMaterial;
  onClose: () => void;
}

export const SecureMaterialViewer: React.FC<SecureMaterialViewerProps> = ({ material, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    const createBlobUrl = () => {
      try {
        if (!material.fileUrl) return '';

        const parts = material.fileUrl.split(',');
        const base64 = parts.length > 1 ? parts[1] : parts[0];
        const mime = parts.length > 1 ? parts[0].match(/:(.*?);/)?.[1] || 'application/pdf' : 'application/pdf';
        
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mime });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.error("Failed to create blob URL", e);
        return '';
      }
    };

    const url = createBlobUrl();
    setBlobUrl(url);

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [material.fileUrl]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="w-full bg-gray-900 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          {material.title}
          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">وضع القراءة فقط</span>
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <XCircle size={24} />
        </button>
      </div>

      <div className="flex-1 w-full relative bg-gray-800 overflow-hidden flex justify-center items-center">
        {blobUrl ? (
          <iframe 
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            className="w-full h-full md:w-3/4 bg-white shadow-2xl"
            style={{ border: 'none' }}
            title="Secure Viewer"
          />
        ) : (
          <div className="text-white flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span>جاري تحميل الملف...</span>
          </div>
        )}
      </div>

      <div className="w-full bg-gray-900 p-2 text-center text-gray-500 text-xs select-none">
        محمي ضد التحميل والطباعة © Course System
      </div>
    </div>
  );
};
