import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, LogOut, FileText, Plus, Trash2, Clock, Upload, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseMaterial } from '../../types';
import { generateUUID } from '../lib/utils';
import { fileToBase64 } from '../lib/business-utils';
import { materialsApi } from '../api/client';
// Note: AdminPage will be implemented separately
// For now, redirect to admin route

export const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [view, setView] = useState<'CLASSROOM' | 'ADMIN'>('CLASSROOM');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      
      // Check file size before processing
      if (file.size > maxSize) {
        alert(`الملف كبير جداً. الحد الأقصى للحجم هو 10 ميجابايت. حجم الملف الحالي: ${(file.size / 1024 / 1024).toFixed(2)} ميجابايت`);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        
        // Check Base64 size (should be ~33% larger than original)
        const base64Size = new Blob([base64]).size;
        if (base64Size > 40 * 1024 * 1024) { // 40MB limit for Base64
          alert('الملف كبير جداً بعد التحويل. يرجى اختيار ملف أصغر.');
          e.target.value = '';
          setUploading(false);
          return;
        }
        
        setNewMaterial({ ...newMaterial, fileUrl: base64 });
      } catch (err) {
        console.error('File upload error:', err);
        alert("خطأ في رفع الملف. يرجى التأكد من أن الملف صحيح والمحاولة مرة أخرى.");
      }
      setUploading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.fileUrl) return alert("يرجى اختيار ملف");
    
    // Check Base64 size before sending
    const base64Size = new Blob([newMaterial.fileUrl]).size;
    if (base64Size > 40 * 1024 * 1024) { // 40MB limit
      alert('الملف كبير جداً. الحد الأقصى للحجم هو 10 ميجابايت للملف الأصلي.');
      return;
    }
    
    try {
      const mat: CourseMaterial = {
        id: generateUUID(),
        title: newMaterial.title,
        description: newMaterial.description,
        fileUrl: newMaterial.fileUrl,
        fileType: 'PDF',
        createdAt: new Date().toISOString()
      };
      
      // Save to Railway via API
      await materialsApi.create(mat);
      actions.updateMaterials([mat, ...state.materials]);
      setIsUploadModalOpen(false);
      setNewMaterial({ title: '', description: '', fileUrl: '' });
    } catch (error: any) {
      console.error('Failed to save material:', error);
      if (error.message?.includes('413') || error.message?.includes('Content Too Large')) {
        alert('الملف كبير جداً. يرجى اختيار ملف أصغر (أقل من 10 ميجابايت).');
      } else {
        alert('فشل في حفظ المحتوى. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const deleteMaterial = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      try {
        await materialsApi.delete(id);
        actions.updateMaterials(state.materials.filter((m: CourseMaterial) => m.id !== id));
      } catch (error) {
        console.error('Failed to delete material:', error);
        alert('فشل في حذف المحتوى. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  // If Teacher wants to see Admin View (Students Management)
  if (view === 'ADMIN') {
    return (
      <div className="relative">
        <div className="fixed bottom-4 left-4 z-50">
          <button 
            onClick={() => setView('CLASSROOM')} 
            className="bg-red-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700 font-bold"
          >
            <BookOpen size={18} /> ⚽ العودة للكلاس روم
          </button>
        </div>
        <div className="p-8">
          <p className="text-center text-gray-600">إدارة الطلاب - سيتم التوجيه إلى صفحة الإدارة</p>
          <button 
            onClick={() => navigate('/admin')} 
            className="mt-4 mx-auto block bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700"
          >
            الذهاب إلى إدارة الطلاب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section - Red Theme */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b border-red-800 px-6 py-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-red-600 p-2 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-white">⚽ منصة المحتوى (Classroom)</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('ADMIN')} 
              className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30 backdrop-blur-sm"
            >
              <Users size={16} /> إدارة الطلاب
            </button>
            <div className="h-6 w-px bg-white/30"></div>
            <span className="text-sm text-white">{state.user?.username}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Stats Cards - Red Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الملفات المرفوعة</p>
                <p className="text-3xl font-bold">{state.materials.length}</p>
              </div>
              <FileText size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الدروس المتاحة</p>
                <p className="text-3xl font-bold">{state.lessons.length}</p>
              </div>
              <BookOpen size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الطلاب المسجلين</p>
                <p className="text-3xl font-bold">{state.students.length}</p>
              </div>
              <Users size={32} className="opacity-80" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">محتوى الكورس</h1>
            <p className="text-gray-500 mt-2">إدارة المحاضرات والملفات التعليمية</p>
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200 transition-all font-bold"
          >
            <Plus size={20} /> <span>⚽ رفع محتوى جديد</span>
          </button>
        </div>

        {/* Materials Grid - Professional Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.materials.length === 0 ? (
             <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-red-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا يوجد محتوى حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ برفع المحاضرات والمواد التعليمية</p>
                <button 
                  onClick={() => setIsUploadModalOpen(true)} 
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold"
                >
                  ⚽ رفع أول محتوى
                </button>
             </div>
          ) : state.materials.map((item: CourseMaterial) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText size={28} />
                </div>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    deleteMaterial(item.id); 
                  }} 
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{item.description || 'لا يوجد وصف'}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={14} />
                  <span>{new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">{item.fileType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">رفع محتوى جديد</h2>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <input 
                type="text" 
                required 
                placeholder="عنوان المحاضرة" 
                value={newMaterial.title} 
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <textarea 
                placeholder="وصف المحتوى" 
                value={newMaterial.description} 
                onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} 
                className="w-full p-3 border rounded-xl h-24" 
              />
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input 
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  onChange={handleFileUpload} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                {uploading ? (
                  <Loader2 className="animate-spin mx-auto text-red-600" size={24} />
                ) : (
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                )}
                <p className="text-sm text-gray-500">{newMaterial.fileUrl ? "تم اختيار الملف ✅" : "اضغط لاختيار ملف PDF"}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsUploadModalOpen(false)} 
                  className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={!newMaterial.fileUrl || uploading} 
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {uploading ? 'جاري الرفع...' : 'نشر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
