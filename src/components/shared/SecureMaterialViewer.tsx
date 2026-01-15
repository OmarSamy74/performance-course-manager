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
        if (!material.fileUrl) {
          console.warn('No fileUrl provided for material:', material.title);
          return '';
        }

        let base64 = '';
        let mime = 'application/pdf';

        // Handle different fileUrl formats
        if (material.fileUrl.includes(',')) {
          // Data URL format: data:mime;base64,data
          const parts = material.fileUrl.split(',');
          const header = parts[0];
          base64 = parts[1] || parts[0];
          
          // Extract MIME type from header
          const mimeMatch = header.match(/data:(.*?);/);
          if (mimeMatch) {
            mime = mimeMatch[1] || 'application/pdf';
          }
        } else if (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://')) {
          // Direct URL - use as is
          setBlobUrl(material.fileUrl);
          return;
        } else {
          // Assume it's base64 without prefix
          base64 = material.fileUrl;
        }

        if (!base64) {
          console.warn('Empty base64 data for material:', material.title);
          return '';
        }

        try {
          const binaryString = window.atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: mime });
          const url = URL.createObjectURL(blob);
          return url;
        } catch (decodeError) {
          console.error('Failed to decode base64:', decodeError);
          // Try to use fileUrl directly if it's a valid URL
          if (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://')) {
            return material.fileUrl;
          }
          return '';
        }
      } catch (e) {
        console.error("Failed to create blob URL", e);
        // Fallback: try to use fileUrl directly
        if (material.fileUrl && (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://'))) {
          return material.fileUrl;
        }
        return '';
      }
    };

    const url = createBlobUrl();
    setBlobUrl(url);

    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [material.fileUrl, material.title]);

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
            src={blobUrl.includes('#') ? blobUrl : `${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full md:w-3/4 bg-white shadow-2xl"
            style={{ border: 'none' }}
            title="Secure Viewer"
            onError={(e) => {
              console.error('Iframe load error:', e);
              setBlobUrl('');
            }}
            onLoad={() => {
              console.log('Iframe loaded successfully');
            }}
          />
        ) : (
          <div className="text-white flex flex-col items-center gap-4 p-8">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span>جاري تحميل الملف...</span>
            {!material.fileUrl && (
              <p className="text-red-400 text-sm mt-2">خطأ: لا يوجد رابط للملف</p>
            )}
          </div>
        )}
      </div>

      <div className="w-full bg-gray-900 p-2 text-center text-gray-500 text-xs select-none">
        محمي ضد التحميل والطباعة © Course System
      </div>
    </div>
  );
};
