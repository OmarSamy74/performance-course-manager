import React, { useState, useEffect } from 'react';
import { XCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import { CourseMaterial } from '../../../types';

interface SecureMaterialViewerProps {
  material: CourseMaterial;
  onClose: () => void;
}

export const SecureMaterialViewer: React.FC<SecureMaterialViewerProps> = ({ material, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    
    const createBlobUrl = async () => {
      try {
        if (!material.fileUrl) {
          setError('لا يوجد رابط للملف');
          setIsLoading(false);
          return '';
        }

        let base64 = '';
        let mime = material.fileType === 'IMAGE' ? 'image/jpeg' : 'application/pdf';

        // Handle different fileUrl formats
        if (material.fileUrl.includes(',')) {
          // Data URL format: data:mime;base64,data
          const parts = material.fileUrl.split(',');
          const header = parts[0];
          base64 = parts[1] || parts[0];
          
          // Extract MIME type from header
          const mimeMatch = header.match(/data:(.*?);/);
          if (mimeMatch) {
            mime = mimeMatch[1] || mime;
          }
        } else if (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://')) {
          // Direct URL - use as is
          setIsLoading(false);
          setBlobUrl(material.fileUrl);
          return;
        } else {
          // Assume it's base64 without prefix
          base64 = material.fileUrl;
        }

        if (!base64 || base64.trim().length === 0) {
          setError('الملف فارغ أو غير صالح');
          setIsLoading(false);
          return '';
        }

        try {
          // Clean base64 string (remove whitespace)
          const cleanBase64 = base64.replace(/\s/g, '');
          
          // Decode base64
          const binaryString = window.atob(cleanBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create blob
          const blob = new Blob([bytes], { type: mime });
          const url = URL.createObjectURL(blob);
          
          setIsLoading(false);
          return url;
        } catch (decodeError: any) {
          console.error('Failed to decode base64:', decodeError);
          setError('فشل في قراءة الملف. يرجى التحقق من صحة الملف.');
          setIsLoading(false);
          
          // Try to use fileUrl directly if it's a valid URL
          if (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://')) {
            setBlobUrl(material.fileUrl);
            setIsLoading(false);
            return material.fileUrl;
          }
          return '';
        }
      } catch (e: any) {
        console.error("Failed to create blob URL", e);
        setError('حدث خطأ أثناء تحميل الملف');
        setIsLoading(false);
        
        // Fallback: try to use fileUrl directly
        if (material.fileUrl && (material.fileUrl.startsWith('http://') || material.fileUrl.startsWith('https://'))) {
          setBlobUrl(material.fileUrl);
          setIsLoading(false);
          return material.fileUrl;
        }
        return '';
      }
    };

    createBlobUrl().then((url) => {
      if (url) {
        setBlobUrl(url);
      }
    });

    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [material.fileUrl, material.title, material.fileType]);

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
        {isLoading ? (
          <div className="text-white flex flex-col items-center gap-4 p-8">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span>جاري تحميل الملف...</span>
          </div>
        ) : error ? (
          <div className="text-white flex flex-col items-center gap-4 p-8 text-center max-w-md">
            <AlertCircle className="text-red-400" size={48} />
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        ) : blobUrl ? (
          material.fileType === 'IMAGE' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={blobUrl} 
                alt={material.title}
                className="max-w-full max-h-full object-contain shadow-2xl"
                onError={() => {
                  setError('فشل في تحميل الصورة');
                  setIsLoading(false);
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <iframe 
                src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-full md:w-3/4 bg-white shadow-2xl"
                style={{ border: 'none' }}
                title="Secure Viewer"
                onError={() => {
                  setError('فشل في تحميل ملف PDF');
                  setIsLoading(false);
                }}
                onLoad={() => {
                  setIsLoading(false);
                  console.log('PDF loaded successfully');
                }}
              />
            </div>
          )
        ) : (
          <div className="text-white flex flex-col items-center gap-4 p-8">
            <AlertCircle className="text-red-400" size={32} />
            <span>لا يمكن تحميل الملف</span>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>

      <div className="w-full bg-gray-900 p-2 text-center text-gray-500 text-xs select-none">
        محمي ضد التحميل والطباعة © Course System
      </div>
    </div>
  );
};
