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
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setIframeLoaded(false);
    
    console.log('SecureMaterialViewer - Material:', {
      id: material.id,
      title: material.title,
      fileType: material.fileType,
      fileUrlLength: material.fileUrl?.length || 0,
      fileUrlPreview: material.fileUrl?.substring(0, 100) || 'null'
    });
    
    // Timeout to detect if PDF fails to load
    const loadTimeout = setTimeout(() => {
      if (!iframeLoaded && blobUrl) {
        console.warn('PDF load timeout - iframe may have failed to load');
        // Don't set error immediately, give it more time
      }
    }, 10000); // 10 second timeout
    
    const createBlobUrl = async () => {
      try {
        if (!material.fileUrl) {
          console.error('No fileUrl in material:', material);
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
          // Clean base64 string (remove whitespace and newlines)
          const cleanBase64 = base64.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
          
          if (cleanBase64.length === 0) {
            throw new Error('Empty base64 string after cleaning');
          }
          
          // Validate base64 format
          if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
            console.warn('Base64 string contains invalid characters, attempting to decode anyway');
          }
          
          // Decode base64
          let binaryString: string;
          try {
            binaryString = window.atob(cleanBase64);
          } catch (atobError) {
            // Try with padding if it fails
            const paddedBase64 = cleanBase64 + '='.repeat((4 - cleanBase64.length % 4) % 4);
            binaryString = window.atob(paddedBase64);
          }
          
          const len = binaryString.length;
          if (len === 0) {
            throw new Error('Decoded binary string is empty');
          }
          
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create blob with correct MIME type
          const blob = new Blob([bytes], { type: mime });
          
          // Verify blob was created
          if (blob.size === 0) {
            throw new Error('Blob size is zero');
          }
          
          const url = URL.createObjectURL(blob);
          console.log(`Created blob URL: ${url.substring(0, 50)}..., size: ${blob.size} bytes, type: ${mime}`);
          
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

    let urlResult: string | undefined;
    
    createBlobUrl().then((url) => {
      urlResult = url;
      if (url) {
        console.log('Setting blob URL:', url.substring(0, 50));
        setBlobUrl(url);
        // Don't set loading to false here - let iframe onLoad handle it
      } else {
        setIsLoading(false);
        if (!error) {
          setError('فشل في تحميل الملف');
        }
      }
    }).catch((err) => {
      console.error('Error in createBlobUrl:', err);
      setError('حدث خطأ أثناء تحميل الملف');
      setIsLoading(false);
    });

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [material.fileUrl, material.title, material.fileType, iframeLoaded, blobUrl]);

  // Cleanup blob URL when component unmounts or blobUrl changes
  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        console.log('Revoking blob URL:', blobUrl.substring(0, 50));
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

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
                  console.error('Failed to load image');
                  setError('فشل في تحميل الصورة');
                  setIsLoading(false);
                }}
                onLoad={() => {
                  setIsLoading(false);
                  console.log('Image loaded successfully');
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              {/* Primary: iframe with proper dimensions */}
              <div className="w-full h-full md:w-3/4 bg-white shadow-2xl" style={{ minHeight: '600px' }}>
                <iframe 
                  key={blobUrl}
                  src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full"
                  style={{ border: 'none', display: 'block' }}
                  title="PDF Viewer"
                  allow="fullscreen"
                  onLoad={() => {
                    setIframeLoaded(true);
                    setIsLoading(false);
                    console.log('PDF iframe loaded successfully');
                  }}
                />
              </div>
              {/* Fallback: Show download link if iframe doesn't load after timeout */}
              {!iframeLoaded && blobUrl && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg">
                  <p className="text-white text-sm mb-2">إذا لم يظهر الملف، يمكنك تحميله:</p>
                  <a 
                    href={blobUrl} 
                    download={`${material.title}.pdf`}
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    اضغط هنا لتحميل الملف
                  </a>
                </div>
              )}
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
