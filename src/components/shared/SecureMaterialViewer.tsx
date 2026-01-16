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
    if (!material || !material.fileUrl) {
      setError('لا يوجد رابط للملف');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setIframeLoaded(false);
    
    // Cleanup previous blob URL
    if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:') && typeof URL !== 'undefined') {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.warn('Error revoking previous blob URL:', error);
      }
    }
    
    console.log('SecureMaterialViewer - Material:', {
      id: material.id,
      title: material.title,
      fileType: material.fileType,
      fileUrlLength: material.fileUrl?.length || 0,
      fileUrlPreview: material.fileUrl?.substring(0, 100) || 'null'
    });
    
    // Timeout to detect if file fails to load
    let loadTimeout: NodeJS.Timeout;
    if (typeof window !== 'undefined') {
      loadTimeout = setTimeout(() => {
        if (!iframeLoaded && blobUrl) {
          console.warn('File load timeout - iframe may have failed to load');
          // For Google Drive, this is normal - show fallback link
          if (blobUrl.includes('drive.google.com')) {
            setIsLoading(false);
            // Keep iframeLoaded as false to show fallback
          }
        }
      }, 10000); // 10 second timeout for Google Drive
    }
    
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
        if (material.fileUrl.includes('drive.google.com')) {
          // Google Drive URL - convert to preview URL if needed
          let driveUrl = material.fileUrl.trim();
          
          // Extract file ID from various Google Drive URL formats
          let fileId: string | null = null;
          
          // Try to extract file ID from different URL patterns
          const patterns = [
            /\/file\/d\/([a-zA-Z0-9_-]+)/,  // Standard: /file/d/FILE_ID
            /id=([a-zA-Z0-9_-]+)/,          // Alternative: ?id=FILE_ID
            /\/d\/([a-zA-Z0-9_-]+)/,        // Short: /d/FILE_ID
          ];
          
          for (const pattern of patterns) {
            const match = driveUrl.match(pattern);
            if (match) {
              fileId = match[1];
              break;
            }
          }
          
          if (fileId) {
            // Convert to preview URL (for embedding)
            driveUrl = `https://drive.google.com/file/d/${fileId}/preview`;
            console.log('Converted Google Drive URL to preview:', driveUrl);
          } else {
            // If we can't extract file ID, try to use the URL as-is
            console.warn('Could not extract file ID from Google Drive URL:', driveUrl);
            // Try to add /preview if not present
            if (!driveUrl.includes('/preview') && driveUrl.includes('/file/d/')) {
              driveUrl = driveUrl.replace('/view', '/preview').replace('?usp=sharing', '');
            }
          }
          
          // Store original view URL for fallback
          const viewUrl = fileId 
            ? `https://drive.google.com/file/d/${fileId}/view`
            : driveUrl.replace('/preview', '/view');
          
          // Store view URL in a way we can access it later
          (window as any).__driveViewUrl = viewUrl;
          
          // For Google Drive, we don't use iframe (blocked by X-Frame-Options)
          // Instead, we'll show a direct link button
          setIsLoading(false);
          setBlobUrl(driveUrl);
          setIframeLoaded(true); // Mark as "loaded" so we show the link UI immediately
          return;
        } else if (material.fileUrl.includes(',')) {
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
          // Check if we're in browser environment
          if (typeof window === 'undefined' || typeof window.atob === 'undefined' || typeof URL === 'undefined') {
            throw new Error('Browser APIs not available');
          }

          // Clean base64 string (remove whitespace and newlines)
          const cleanBase64 = base64.replace(/\s/g, '').replace(/\n/g, '').replace(/\r/g, '');
          
          if (cleanBase64.length === 0) {
            throw new Error('Empty base64 string after cleaning');
          }
          
          // Validate base64 format
          if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
            console.warn('Base64 string contains invalid characters, attempting to decode anyway');
          }
          
          // Decode base64 in chunks to prevent blocking the main thread
          let binaryString: string;
          try {
            // For large files, decode in chunks to prevent freezing
            if (cleanBase64.length > 1000000) { // 1MB threshold
              console.log('Large file detected, decoding in chunks...');
              binaryString = '';
              const chunkSize = 500000; // Process 500KB at a time
              for (let i = 0; i < cleanBase64.length; i += chunkSize) {
                const chunk = cleanBase64.substring(i, i + chunkSize);
                binaryString += window.atob(chunk);
                // Yield to browser to prevent freezing
                if (i % (chunkSize * 2) === 0) {
                  await new Promise(resolve => setTimeout(resolve, 0));
                }
              }
            } else {
              binaryString = window.atob(cleanBase64);
            }
          } catch (atobError) {
            // Try with padding if it fails
            const paddedBase64 = cleanBase64 + '='.repeat((4 - cleanBase64.length % 4) % 4);
            binaryString = window.atob(paddedBase64);
          }
          
          const len = binaryString.length;
          if (len === 0) {
            throw new Error('Decoded binary string is empty');
          }
          
          // Create bytes array in chunks for large files
          const bytes = new Uint8Array(len);
          if (len > 1000000) {
            // Process in chunks to prevent blocking
            const chunkSize = 500000;
            for (let i = 0; i < len; i += chunkSize) {
              const end = Math.min(i + chunkSize, len);
              for (let j = i; j < end; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              // Yield to browser
              if (i % (chunkSize * 2) === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
              }
            }
          } else {
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
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
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      // Cleanup blob URL on unmount
      if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:') && typeof URL !== 'undefined') {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.warn('Error revoking blob URL in cleanup:', error);
        }
      }
    };
  }, [material?.id, material?.fileUrl]); // Only depend on material ID and fileUrl to prevent infinite loops

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:') && typeof URL !== 'undefined') {
        try {
          console.log('Revoking blob URL on unmount:', blobUrl.substring(0, 50));
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.warn('Error revoking blob URL:', error);
        }
      }
    };
  }, []); // Only run on unmount

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center" 
      onContextMenu={(e) => e.preventDefault()}
      style={{ willChange: 'auto' }} // Optimize rendering
    >
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
          // Check if it's Google Drive URL first (before fileType check)
          blobUrl.includes('drive.google.com') ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              {/* Google Drive files cannot be embedded in iframe - show direct link */}
              <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{material.title}</h3>
                  <p className="text-blue-100 text-sm">الملف موجود في Google Drive</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <p className="text-white text-lg mb-4">
                    لفتح الملف، اضغط على الزر أدناه:
                  </p>
                  <a 
                    href={(() => {
                      // Extract file ID and create view URL
                      const fileIdMatch = blobUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                      if (fileIdMatch) {
                        return `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
                      }
                      // Try to get original URL from material
                      if (material.fileUrl.includes('/view')) {
                        return material.fileUrl;
                      }
                      return blobUrl.replace('/preview', '/view').replace('?usp=sharing', '');
                    })()} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                  >
                    📎 فتح الملف في Google Drive
                  </a>
                </div>
                
                <p className="text-blue-100 text-xs">
                  سيتم فتح الملف في تبويب جديد
                </p>
              </div>
            </div>
          ) : material.fileType === 'IMAGE' ? (
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
              {/* Check if it's Google Drive URL */}
              {blobUrl.includes('drive.google.com') ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="w-full h-full bg-white shadow-2xl" style={{ minHeight: '600px' }}>
                    <iframe 
                      key={blobUrl}
                      src={blobUrl}
                      className="w-full h-full"
                      style={{ border: 'none', display: 'block' }}
                      title="Google Drive Viewer"
                      allow="fullscreen"
                      loading="lazy"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      onLoad={() => {
                        setIframeLoaded(true);
                        setIsLoading(false);
                        console.log('Google Drive iframe loaded successfully');
                      }}
                      onError={() => {
                        console.error('Google Drive iframe failed to load');
                        // Don't set error immediately - show fallback link
                      }}
                    />
                  </div>
                  {/* Fallback: Direct link if iframe doesn't work */}
                  <div className="mt-4 bg-gray-800 p-4 rounded-lg max-w-md">
                    <p className="text-white text-sm mb-2 text-center">إذا لم يظهر الملف، يمكنك فتحه مباشرة:</p>
                    <a 
                      href={blobUrl.replace('/preview', '/view')} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300 text-center block"
                    >
                      اضغط هنا لفتح الملف في Google Drive
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {/* Primary: iframe with proper dimensions for direct PDF */}
                  <div className="w-full h-full md:w-3/4 bg-white shadow-2xl" style={{ minHeight: '600px' }}>
                    <iframe 
                      key={blobUrl}
                      src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className="w-full h-full"
                      style={{ border: 'none', display: 'block' }}
                      title="PDF Viewer"
                      allow="fullscreen"
                      loading="lazy"
                      onLoad={() => {
                        setIframeLoaded(true);
                        setIsLoading(false);
                        console.log('PDF iframe loaded successfully');
                      }}
                      onError={() => {
                        console.error('PDF iframe failed to load');
                        setError('فشل في تحميل الملف');
                        setIsLoading(false);
                      }}
                    />
                  </div>
                  {/* Fallback: Show download link if iframe doesn't load after timeout */}
                  {!iframeLoaded && blobUrl && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-4 rounded-lg">
                      <p className="text-white text-sm mb-2">إذا لم يظهر الملف، يمكنك فتحه:</p>
                      <a 
                        href={blobUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        اضغط هنا لفتح الملف في تبويب جديد
                      </a>
                    </div>
                  )}
                </>
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
