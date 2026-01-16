import { Student, PaymentPlan, COURSE_COST, HALF_PAYMENT_INITIAL, INSTALLMENT_VALUE, InstallmentStatus, LeadStatus } from '../../types';

export const calculateFinancials = (student: Student) => {
  let paid = 0;
  let pending = 0;
  
  if (student.plan === PaymentPlan.FULL) {
    paid = COURSE_COST;
  } else {
    paid = HALF_PAYMENT_INITIAL;
    
    // Check Inst 1
    if (student.installments.inst1.status === InstallmentStatus.PAID) paid += INSTALLMENT_VALUE;
    else if (student.installments.inst1.status === InstallmentStatus.PENDING) pending += INSTALLMENT_VALUE;

    // Check Inst 2
    if (student.installments.inst2.status === InstallmentStatus.PAID) paid += INSTALLMENT_VALUE;
    else if (student.installments.inst2.status === InstallmentStatus.PENDING) pending += INSTALLMENT_VALUE;

    // Check Inst 3
    if (student.installments.inst3.status === InstallmentStatus.PAID) paid += INSTALLMENT_VALUE;
    else if (student.installments.inst3.status === InstallmentStatus.PENDING) pending += INSTALLMENT_VALUE;
  }

  const remaining = COURSE_COST - paid;
  
  return {
    paid,
    pending,
    remaining,
    isFullyPaid: remaining === 0
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getStatusColor = (status: InstallmentStatus) => {
  switch (status) {
    case InstallmentStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
    case InstallmentStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case InstallmentStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-500 border-gray-200';
  }
};

export const getStatusLabel = (status: InstallmentStatus) => {
  switch (status) {
    case InstallmentStatus.PAID: return 'تم الدفع';
    case InstallmentStatus.PENDING: return 'قيد المراجعة';
    case InstallmentStatus.REJECTED: return 'مرفوض';
    default: return 'غير مدفوع';
  }
};

// --- CRM HELPERS ---
export const getLeadStatusLabel = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.NEW: return 'جديد';
    case LeadStatus.CONTACTED: return 'تم التواصل';
    case LeadStatus.INTERESTED: return 'مهتم';
    case LeadStatus.NEGOTIATION: return 'تفاوض';
    case LeadStatus.CONVERTED: return 'تم التحويل';
    case LeadStatus.LOST: return 'خسارة';
    default: return status;
  }
};

export const getLeadStatusColor = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.NEW: return 'bg-blue-100 text-blue-700';
    case LeadStatus.CONTACTED: return 'bg-purple-100 text-purple-700';
    case LeadStatus.INTERESTED: return 'bg-orange-100 text-orange-700';
    case LeadStatus.NEGOTIATION: return 'bg-yellow-100 text-yellow-700';
    case LeadStatus.CONVERTED: return 'bg-green-100 text-green-700';
    case LeadStatus.LOST: return 'bg-gray-100 text-gray-500';
    default: return 'bg-gray-100';
  }
};

// Helper to compress image before converting to base64
// Optimized to prevent freezing with large files
const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Only compress images, not PDFs or other files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    
    // Skip compression for very small images (< 500KB)
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    // For very large images, use lower quality and smaller dimensions
    let adjustedQuality = quality;
    let adjustedMaxWidth = maxWidth;
    let adjustedMaxHeight = maxHeight;
    
    if (file.size > 5 * 1024 * 1024) { // > 5MB
      adjustedQuality = 0.5;
      adjustedMaxWidth = 1600;
      adjustedMaxHeight = 1600;
    } else if (file.size > 2 * 1024 * 1024) { // > 2MB
      adjustedQuality = 0.6;
      adjustedMaxWidth = 1800;
      adjustedMaxHeight = 1800;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      try {
        const img = new Image();
        
        // Use promise for image loading to allow async/await
        await new Promise<void>((imgResolve, imgReject) => {
          img.onload = () => imgResolve();
          img.onerror = () => imgReject(new Error('Failed to load image'));
          img.src = e.target?.result as string;
        });

        // Yield to browser before heavy canvas operations
        await new Promise(resolve => setTimeout(resolve, 0));

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > adjustedMaxWidth) {
            height = (height * adjustedMaxWidth) / width;
            width = adjustedMaxWidth;
          }
        } else {
          if (height > adjustedMaxHeight) {
            width = (width * adjustedMaxHeight) / height;
            height = adjustedMaxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Yield before drawing
        await new Promise(resolve => setTimeout(resolve, 0));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Yield before blob conversion
        await new Promise(resolve => setTimeout(resolve, 0));
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          },
          file.type,
          adjustedQuality
        );
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

// Helper to convert file to base64 for local storage simulation
// Automatically compresses images before conversion
// Optimized to prevent freezing with large files
export const fileToBase64 = async (file: File, compress: boolean = true): Promise<string> => {
  try {
    // Show progress for large files
    const isLargeFile = file.size > 2 * 1024 * 1024; // > 2MB
    if (isLargeFile) {
      console.log(`Processing large file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Compress image if it's an image file and compression is enabled
    const fileToConvert = compress ? await compressImage(file) : file;
    
    // For very large files, process in chunks to prevent freezing
    if (fileToConvert.size > 10 * 1024 * 1024) { // > 10MB
      console.warn('Very large file detected, processing may take time...');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Add progress tracking for large files
      if (isLargeFile) {
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            if (percent % 25 === 0) { // Log every 25%
              console.log(`File reading progress: ${percent.toFixed(0)}%`);
            }
          }
        };
      }
      
      reader.readAsDataURL(fileToConvert);
      reader.onload = () => {
        const result = reader.result as string;
        console.log(`File converted to base64: ${(result.length / 1024 / 1024).toFixed(2)}MB`);
        resolve(result);
      };
      reader.onerror = error => {
        console.error('FileReader error:', error);
        reject(error);
      };
    });
  } catch (error) {
    console.error('fileToBase64 error:', error);
    // If compression fails, try without compression
    if (compress) {
      console.log('Retrying without compression...');
      return fileToBase64(file, false);
    }
    throw error;
  }
};
