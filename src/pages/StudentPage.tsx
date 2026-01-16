import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, BookOpen, LogOut, CheckCircle2, Upload, Loader2, FileText, Lock, Eye, Play, Clock, MessageSquare, ListTodo, BarChart3, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, PaymentPlan, InstallmentStatus, CourseMaterial } from '../../types';
import { calculateFinancials, formatCurrency, fileToBase64 } from '../lib/business-utils';
import { SecureMaterialViewer } from '../components/shared/SecureMaterialViewer';
import { LessonPlayer } from '../components/classroom/LessonPlayer';
import { studentsApi } from '../api/client';

export const StudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'CLASSROOM'>('FINANCE');
  const [classroomTab, setClassroomTab] = useState<'STREAM' | 'CLASSWORK' | 'TODO' | 'GRADES'>('STREAM');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  const [viewingLesson, setViewingLesson] = useState<any>(null);

  // Wait for data to load before checking for student
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const student = state.students.find((s: Student) => s.id === state.user?.studentId);

  if (!student && state.user?.studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">خطأ: لم يتم العثور على بيانات الطالب.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 underline hover:text-blue-700"
          >
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // If no studentId in user, show error
  if (!state.user?.studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-4">خطأ: لا يوجد معرف طالب مرتبط بحسابك.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 underline hover:text-blue-700"
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
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB for receipts
      
      if (file.size > maxSize) {
        alert(`صورة الإيصال كبيرة جداً. الحد الأقصى هو 5 ميجابايت.`);
        e.target.value = '';
        return;
      }
      
      setUploadingKey(key);
      
      try {
        // Process file asynchronously to prevent blocking
        const base64 = await Promise.resolve(fileToBase64(file));
        
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
          console.log('Receipt uploaded successfully');
        } catch (error) {
          console.error('Failed to update student:', error);
          alert('فشل في رفع الإيصال. يرجى المحاولة مرة أخرى.');
        }
      } catch (err) {
        console.error('File upload error:', err);
        alert("خطأ في رفع الملف. يرجى المحاولة مرة أخرى.");
      } finally {
        setUploadingKey(null);
        // Reset input to allow re-uploading same file
        e.target.value = '';
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
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'FINANCE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Wallet size={18} /> المدفوعات
          </button>
          <button 
            onClick={() => setActiveTab('CLASSROOM')} 
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CLASSROOM' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BookOpen size={18} /> الكلاس روم
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* FINANCIALS TAB */}
        {activeTab === 'FINANCE' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 rounded-2xl p-8 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">مرحباً، {student.name}</h2>
              <div className="flex flex-col md:flex-row gap-8 mt-6">
                <div>
                  <p className="text-blue-100 text-sm mb-1">إجمالي المدفوع</p>
                  <p className="text-3xl font-bold">{formatCurrency(financials.paid)}</p>
                </div>
                <div>
                  <p className="text-green-100 text-sm mb-1">المبلغ المتبقي</p>
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
                          <label className={`flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-md ${uploadingKey === key ? 'opacity-70 pointer-events-none' : ''}`}>
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

        {/* CLASSROOM TAB - Google Classroom Style */}
        {activeTab === 'CLASSROOM' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            {/* Classroom Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setClassroomTab('STREAM')}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    classroomTab === 'STREAM' 
                      ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare size={18} /> البث (Stream)
                </button>
                <button
                  onClick={() => setClassroomTab('CLASSWORK')}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    classroomTab === 'CLASSWORK' 
                      ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen size={18} /> الأعمال (Classwork)
                </button>
                <button
                  onClick={() => setClassroomTab('TODO')}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    classroomTab === 'TODO' 
                      ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListTodo size={18} /> قائمة المهام (To-Do)
                </button>
                <button
                  onClick={() => setClassroomTab('GRADES')}
                  className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    classroomTab === 'GRADES' 
                      ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 size={18} /> درجاتي (Grades)
                </button>
              </div>
            </div>

            {/* Stream Tab - Announcements */}
            {classroomTab === 'STREAM' && (
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <h2 className="text-2xl font-bold mb-4">مرحباً، {student.name}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-blue-100 text-sm mb-1">الملفات</p>
                      <p className="text-2xl font-bold">{state.materials.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-cyan-100 text-sm mb-1">الدروس</p>
                      <p className="text-2xl font-bold">{state.lessons.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-green-100 text-sm mb-1">الواجبات</p>
                      <p className="text-2xl font-bold">{state.assignments?.length || 0}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-red-100 text-sm mb-1">التقدم</p>
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                  </div>
                </div>

                {/* Recent Announcements/Activity */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">الإعلانات والنشاط الأخير</h3>
                  <div className="space-y-4">
                    {state.assignments && state.assignments.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <FileText className="text-blue-600 mt-1" size={20} />
                          <div>
                            <p className="font-semibold text-gray-800">واجب جديد</p>
                            <p className="text-sm text-gray-600">{state.assignments[0].title}</p>
                            {state.assignments[0].dueDate && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <CalendarIcon size={12} />
                                استحقاق: {new Date(state.assignments[0].dueDate).toLocaleDateString('ar-EG')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {state.materials.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-start gap-3">
                          <FileText className="text-green-600 mt-1" size={20} />
                          <div>
                            <p className="font-semibold text-gray-800">مادة جديدة متاحة</p>
                            <p className="text-sm text-gray-600">{state.materials[0].title}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(state.materials[0].createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {(!state.assignments || state.assignments.length === 0) && state.materials.length === 0 && (
                      <p className="text-center text-gray-500 py-8">لا يوجد نشاط حتى الآن</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Classwork Tab - All Content */}
            {classroomTab === 'CLASSWORK' && (
              <div className="space-y-8">
                {/* Materials Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={24} className="text-blue-600" />
                    الملفات والمستندات
                  </h3>
                  {state.materials.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-blue-600" size={32} />
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
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-green-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
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
                          <button 
                            onClick={() => setViewingLesson(lesson)}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                          >
                            <Play size={18} />
                            بدء الدرس
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments Section */}
                {state.assignments && state.assignments.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText size={24} className="text-green-600" />
                      الواجبات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {state.assignments.map((assignment: any) => (
                        <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-xl">
                              <FileText size={24} />
                            </div>
                            {assignment.dueDate && (
                              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                <CalendarIcon size={12} />
                                {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{assignment.title}</h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assignment.description || 'لا يوجد وصف'}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm text-gray-600">{assignment.maxScore} نقطة</span>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold">
                              عرض الواجب
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* To-Do Tab - Upcoming Assignments */}
            {classroomTab === 'TODO' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">قائمة المهام</h2>
                  <div className="space-y-4">
                    {state.assignments && state.assignments.length > 0 ? (
                      state.assignments
                        .filter((a: any) => a.dueDate && new Date(a.dueDate) > new Date())
                        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                        .map((assignment: any) => {
                          const dueDate = new Date(assignment.dueDate);
                          const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          const isUrgent = daysLeft <= 3;
                          
                          return (
                            <div 
                              key={assignment.id} 
                              className={`p-5 rounded-xl border-2 transition-all ${
                                isUrgent 
                                  ? 'bg-red-50 border-red-200' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <FileText className={`${isUrgent ? 'text-red-600' : 'text-gray-600'}`} size={20} />
                                    <h3 className="font-bold text-gray-800">{assignment.title}</h3>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-3">{assignment.description || 'لا يوجد وصف'}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <CalendarIcon size={14} />
                                      <span>استحقاق: {dueDate.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 font-bold ${
                                      isUrgent ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      <AlertCircle size={14} />
                                      <span>{daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'متأخر'}</span>
                                    </div>
                                  </div>
                                </div>
                                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold whitespace-nowrap">
                                  إكمال الواجب
                                </button>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <ListTodo className="text-gray-400 mx-auto mb-3" size={48} />
                        <p className="text-gray-600 font-medium">لا توجد واجبات قادمة</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grades Tab */}
            {classroomTab === 'GRADES' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">درجاتي</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="p-4 font-bold text-gray-700">الواجب/الاختبار</th>
                          <th className="p-4 font-bold text-gray-700">الدرجة</th>
                          <th className="p-4 font-bold text-gray-700">الدرجة الكاملة</th>
                          <th className="p-4 font-bold text-gray-700">النسبة</th>
                          <th className="p-4 font-bold text-gray-700">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {state.assignments && state.assignments.length > 0 ? (
                          state.assignments.map((assignment: any) => {
                            const score = 0; // Placeholder - should come from submissions
                            const percentage = assignment.maxScore > 0 ? Math.round((score / assignment.maxScore) * 100) : 0;
                            
                            return (
                              <tr key={assignment.id} className="hover:bg-gray-50">
                                <td className="p-4 font-semibold text-gray-800">{assignment.title}</td>
                                <td className="p-4 text-gray-600">{score}</td>
                                <td className="p-4 text-gray-600">{assignment.maxScore}</td>
                                <td className="p-4">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    percentage >= 80 ? 'bg-green-100 text-green-700' :
                                    percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {percentage}%
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold">
                                    {score > 0 ? 'تم التصحيح' : 'لم يتم التصحيح'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-gray-500">
                              لا توجد درجات متاحة حتى الآن
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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

      {/* Lesson Player */}
      {viewingLesson && (
        <LessonPlayer 
          lesson={viewingLesson} 
          onBack={() => setViewingLesson(null)} 
        />
      )}
    </div>
  );
};
