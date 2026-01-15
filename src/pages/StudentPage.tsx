import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, BookOpen, LogOut, CheckCircle2, Upload, Loader2, FileText, Lock, Eye, Play, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, PaymentPlan, InstallmentStatus, CourseMaterial } from '../../types';
import { calculateFinancials, formatCurrency, fileToBase64 } from '../lib/business-utils';
import { SecureMaterialViewer } from '../components/shared/SecureMaterialViewer';
import { studentsApi } from '../api/client';

export const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'CLASSROOM'>('FINANCE');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);

  const student = state.students.find((s: Student) => s.id === state.user?.studentId);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">خطأ: لم يتم العثور على بيانات الطالب.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="text-red-600 underline hover:text-red-700"
          >
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  const financials = calculateFinancials(student);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'inst1' | 'inst2' | 'inst3') => {
    if (e.target.files && e.target.files[0]) {
      setUploadingKey(key);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        
        const updatedStudent = {
          ...student,
          installments: {
            ...student.installments,
            [key]: { status: InstallmentStatus.PENDING, proofUrl: base64 }
          }
        };

        try {
          await studentsApi.update(student.id, updatedStudent);
          actions.updateStudents(state.students.map((s: Student) => 
            s.id === student.id ? updatedStudent : s
          ));
        } catch (error) {
          console.error('Failed to update student:', error);
          alert('فشل في رفع الإيصال. يرجى المحاولة مرة أخرى.');
        }
        
        setUploadingKey(null);
      } catch (err) {
        alert("خطأ في رفع الملف");
        setUploadingKey(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-20">
        <div className="container mx-auto px-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('FINANCE')} 
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'FINANCE' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Wallet size={18} /> المدفوعات
          </button>
          <button 
            onClick={() => setActiveTab('CLASSROOM')} 
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CLASSROOM' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BookOpen size={18} /> الكلاس روم
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* FINANCIALS TAB */}
        {activeTab === 'FINANCE' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">مرحباً، {student.name}</h2>
              <div className="flex flex-col md:flex-row gap-8 mt-6">
                <div>
                  <p className="text-red-100 text-sm mb-1">إجمالي المدفوع</p>
                  <p className="text-3xl font-bold">{formatCurrency(financials.paid)}</p>
                </div>
                <div>
                  <p className="text-red-100 text-sm mb-1">المبلغ المتبقي</p>
                  <p className="text-3xl font-bold text-yellow-300">{formatCurrency(financials.remaining)}</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mt-8">جدول الأقساط</h3>
            <div className="grid gap-4">
              {student.plan === PaymentPlan.FULL ? (
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center text-green-700 font-bold">
                  تم سداد رسوم الكورس بالكامل 🎉
                </div>
              ) : (
                ['inst1', 'inst2', 'inst3'].map((key, idx) => {
                  const k = key as 'inst1' | 'inst2' | 'inst3';
                  const inst = student.installments[k];
                  const isPending = inst.status === InstallmentStatus.PENDING;
                  const isPaid = inst.status === InstallmentStatus.PAID;
                  const isRejected = inst.status === InstallmentStatus.REJECTED;

                  return (
                    <div key={key} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPaid ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {isPaid ? <CheckCircle2 /> : <span className="font-bold">{idx + 1}</span>}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">القسط رقم {idx + 1}</h4>
                          <p className="text-sm text-gray-500">القيمة: 1000 ج.م</p>
                          {isRejected && <p className="text-xs text-red-500 mt-1">تم رفض الإيصال السابق، يرجى إعادة الرفع.</p>}
                        </div>
                      </div>

                      <div>
                        {isPaid ? (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold">تم الدفع</span>
                        ) : isPending ? (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold animate-pulse">قيد المراجعة...</span>
                        ) : (
                          <label className={`flex items-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all shadow-md ${uploadingKey === key ? 'opacity-70 pointer-events-none' : ''}`}>
                            {uploadingKey === key ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>جاري الرفع...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={20} />
                                <span>رفع إيصال الدفع</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, k)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CLASSROOM TAB */}
        {activeTab === 'CLASSROOM' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-4">المحاضرات والمواد التعليمية</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-red-100 text-sm mb-1">الملفات</p>
                  <p className="text-2xl font-bold">{state.materials.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-red-100 text-sm mb-1">الدروس</p>
                  <p className="text-2xl font-bold">{state.lessons.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-red-100 text-sm mb-1">المكتمل</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-red-100 text-sm mb-1">التقدم</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-red-600" />
                الملفات والمستندات
              </h3>
              {state.materials.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-red-600" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">لا يوجد محتوى متاح حتى الآن</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.materials.map((item: CourseMaterial) => (
                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Lock size={12} />
                          محمي
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description || 'لا يوجد وصف'}</p>
                      <button 
                        onClick={() => setViewingMaterial(item)} 
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        ⚽ مشاهدة المحتوى
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lessons Section */}
            {state.lessons.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BookOpen size={24} className="text-blue-600" />
                  الدروس التفاعلية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Play size={24} />
                        </div>
                        {lesson.duration && (
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Clock size={12} />
                            {lesson.duration} د
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{lesson.description || 'لا يوجد وصف'}</p>
                      <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                        <Play size={18} />
                        بدء الدرس
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secure Viewer Modal */}
      {viewingMaterial && (
        <SecureMaterialViewer 
          material={viewingMaterial} 
          onClose={() => setViewingMaterial(null)} 
        />
      )}
    </div>
  );
};
