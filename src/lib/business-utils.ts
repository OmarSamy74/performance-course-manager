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
const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Only compress images, not PDFs or other files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
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
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

// Helper to convert file to base64 for local storage simulation
// Automatically compresses images before conversion
export const fileToBase64 = async (file: File, compress: boolean = true): Promise<string> => {
  try {
    // Compress image if it's an image file and compression is enabled
    const fileToConvert = compress ? await compressImage(file) : file;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileToConvert);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  } catch (error) {
    // If compression fails, try without compression
    if (compress) {
      return fileToBase64(file, false);
    }
    throw error;
  }
};
