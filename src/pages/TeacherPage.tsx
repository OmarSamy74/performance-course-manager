import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, Plus, Trash2, Clock, Upload, Loader2, Play, Edit, CheckCircle2, FileCheck, Brain, GraduationCap, Calendar, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseMaterial, Lesson, Assignment, Quiz } from '../../types';
import { generateUUID } from '../lib/utils';
import { fileToBase64 } from '../lib/business-utils';
import { materialsApi, lessonsApi, assignmentsApi, quizzesApi } from '../api/client';
import { LessonPlayer } from '../components/classroom/LessonPlayer';
import { SecureMaterialViewer } from '../components/shared/SecureMaterialViewer';

type ClassroomTab = 'MATERIALS' | 'LESSONS' | 'ASSIGNMENTS' | 'QUIZZES';

export const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [view, setView] = useState<'CLASSROOM' | 'ADMIN'>('CLASSROOM');
  const [activeTab, setActiveTab] = useState<ClassroomTab>('MATERIALS');
  
  // Materials state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  
  // Lessons state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', videoUrl: '', moduleId: 'default', order: state.lessons.length, duration: 0 });
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
  
  // Assignments state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
  
  // Quizzes state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', questions: [] as any[], timeLimit: 0, passingScore: 60 });

  // Load data
  useEffect(() => {
    actions.refreshData();
  }, []);

  // Materials handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024;
      
      if (file.size > maxSize) {
        alert(`الملف كبير جداً. الحد الأقصى للحجم هو 10 ميجابايت.`);
        e.target.value = '';
        return;
      }
      
      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const base64Size = new Blob([base64]).size;
        if (base64Size > 40 * 1024 * 1024) {
          alert('الملف كبير جداً بعد التحويل. يرجى اختيار ملف أصغر.');
          e.target.value = '';
          setUploading(false);
          return;
        }
        setNewMaterial({ ...newMaterial, fileUrl: base64 });
      } catch (err) {
        console.error('File upload error:', err);
        alert("خطأ في رفع الملف.");
      }
      setUploading(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.fileUrl) return alert("يرجى اختيار ملف");
    
    try {
      const mat: CourseMaterial = {
        id: generateUUID(),
        title: newMaterial.title,
        description: newMaterial.description,
        fileUrl: newMaterial.fileUrl,
        fileType: newMaterial.fileUrl.startsWith('data:image') ? 'IMAGE' : 'PDF',
        createdAt: new Date().toISOString()
      };
      
      await materialsApi.create(mat);
      actions.updateMaterials([mat, ...state.materials]);
      setIsUploadModalOpen(false);
      setNewMaterial({ title: '', description: '', fileUrl: '' });
    } catch (error: any) {
      console.error('Failed to save material:', error);
      alert('فشل في حفظ المحتوى.');
    }
  };

  const deleteMaterial = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      try {
        await materialsApi.delete(id);
        actions.updateMaterials(state.materials.filter((m: CourseMaterial) => m.id !== id));
      } catch (error) {
        console.error('Failed to delete material:', error);
        alert('فشل في حذف المحتوى.');
      }
    }
  };

  // Lessons handlers
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lesson: Lesson = {
        id: generateUUID(),
        title: newLesson.title,
        description: newLesson.description,
        content: newLesson.content,
        videoUrl: newLesson.videoUrl || undefined,
        moduleId: newLesson.moduleId,
        order: newLesson.order,
        duration: newLesson.duration || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await lessonsApi.create(lesson);
      actions.updateLessons([lesson, ...state.lessons]);
      setIsLessonModalOpen(false);
      setNewLesson({ title: '', description: '', content: '', videoUrl: '', moduleId: 'default', order: state.lessons.length + 1, duration: 0 });
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('فشل في حفظ الدرس.');
    }
  };

  const deleteLesson = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      try {
        await lessonsApi.delete(id);
        actions.updateLessons(state.lessons.filter((l: Lesson) => l.id !== id));
      } catch (error) {
        console.error('Failed to delete lesson:', error);
        alert('فشل في حذف الدرس.');
      }
    }
  };

  // Assignments handlers
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assignment: Assignment = {
        id: generateUUID(),
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: newAssignment.dueDate,
        status: 'PUBLISHED' as any,
        maxScore: newAssignment.maxScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await assignmentsApi.create(assignment);
      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', dueDate: '', maxScore: 100 });
      actions.refreshData();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      alert('فشل في حفظ الواجب.');
    }
  };

  const deleteAssignment = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الواجب؟")) {
      try {
        await assignmentsApi.delete(id);
        actions.refreshData();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        alert('فشل في حذف الواجب.');
      }
    }
  };

  // Quizzes handlers
  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quiz: Quiz = {
        id: generateUUID(),
        title: newQuiz.title,
        description: newQuiz.description,
        questions: newQuiz.questions,
        timeLimit: newQuiz.timeLimit || undefined,
        passingScore: newQuiz.passingScore,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await quizzesApi.create(quiz);
      setIsQuizModalOpen(false);
      setNewQuiz({ title: '', description: '', questions: [], timeLimit: 0, passingScore: 60 });
      actions.refreshData();
    } catch (error) {
      console.error('Failed to save quiz:', error);
      alert('فشل في حفظ الاختبار.');
    }
  };

  const deleteQuiz = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الاختبار؟")) {
      try {
        await quizzesApi.delete(id);
        actions.refreshData();
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert('فشل في حذف الاختبار.');
      }
    }
  };

  // If viewing lesson
  if (viewingLesson) {
    return <LessonPlayer lesson={viewingLesson} onBack={() => setViewingLesson(null)} />;
  }

  // If Teacher wants to see Admin View
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

  // Get assignments and quizzes from state
  const assignments: Assignment[] = state.assignments || [];
  const quizzes: Quiz[] = state.quizzes || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الملفات</p>
                <p className="text-3xl font-bold">{state.materials.length}</p>
              </div>
              <FileText size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الدروس</p>
                <p className="text-3xl font-bold">{state.lessons.length}</p>
              </div>
              <Play size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الواجبات</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <FileCheck size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">الاختبارات</p>
                <p className="text-3xl font-bold">{quizzes.length}</p>
              </div>
              <Brain size={32} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('MATERIALS')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'MATERIALS' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} /> المواد
            </button>
            <button
              onClick={() => setActiveTab('LESSONS')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'LESSONS' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Play size={18} /> الدروس
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNMENTS')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'ASSIGNMENTS' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileCheck size={18} /> الواجبات
            </button>
            <button
              onClick={() => setActiveTab('QUIZZES')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'QUIZZES' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Brain size={18} /> الاختبارات
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'MATERIALS' && 'المواد التعليمية'}
            {activeTab === 'LESSONS' && 'الدروس'}
            {activeTab === 'ASSIGNMENTS' && 'الواجبات'}
            {activeTab === 'QUIZZES' && 'الاختبارات'}
          </h2>
          <button 
            onClick={() => {
              if (activeTab === 'MATERIALS') setIsUploadModalOpen(true);
              if (activeTab === 'LESSONS') setIsLessonModalOpen(true);
              if (activeTab === 'ASSIGNMENTS') setIsAssignmentModalOpen(true);
              if (activeTab === 'QUIZZES') setIsQuizModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200 transition-all font-bold"
          >
            <Plus size={20} /> 
            <span>
              {activeTab === 'MATERIALS' && '⚽ رفع مادة جديدة'}
              {activeTab === 'LESSONS' && 'إضافة درس جديد'}
              {activeTab === 'ASSIGNMENTS' && 'إضافة واجب جديد'}
              {activeTab === 'QUIZZES' && 'إضافة اختبار جديد'}
            </span>
          </button>
        </div>

        {/* Materials Tab */}
        {activeTab === 'MATERIALS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.materials.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="text-red-600 mx-auto mb-4" size={40} />
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
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group cursor-pointer"
                onClick={() => setViewingMaterial(item)}
              >
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
                    <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">{item.fileType}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'LESSONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.lessons.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Play className="text-red-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد دروس حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة دروس جديدة</p>
                <button 
                  onClick={() => setIsLessonModalOpen(true)} 
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold"
                >
                  إضافة أول درس
                </button>
              </div>
            ) : state.lessons.map((lesson: Lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Play size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingLesson(lesson)} 
                      className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50"
                      title="عرض الدرس"
                    >
                      <Play size={18} />
                    </button>
                    <button 
                      onClick={() => deleteLesson(lesson.id)} 
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{lesson.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{lesson.description || 'لا يوجد وصف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {lesson.duration && (
                      <>
                        <Clock size={14} />
                        <span>{lesson.duration} دقيقة</span>
                      </>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">درس</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'ASSIGNMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileCheck className="text-red-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد واجبات حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة واجبات جديدة</p>
                <button 
                  onClick={() => setIsAssignmentModalOpen(true)} 
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold"
                >
                  إضافة أول واجب
                </button>
              </div>
            ) : assignments.map((assignment: Assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileCheck size={28} />
                  </div>
                  <button 
                    onClick={() => deleteAssignment(assignment.id)} 
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{assignment.description || 'لا يوجد وصف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {assignment.dueDate && (
                      <>
                        <Calendar size={14} />
                        <span>{new Date(assignment.dueDate).toLocaleDateString('ar-EG')}</span>
                      </>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">{assignment.maxScore} نقطة</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'QUIZZES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Brain className="text-red-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد اختبارات حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة اختبارات جديدة</p>
                <button 
                  onClick={() => setIsQuizModalOpen(true)} 
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 font-bold"
                >
                  إضافة أول اختبار
                </button>
              </div>
            ) : quizzes.map((quiz: Quiz) => (
              <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-red-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Brain size={28} />
                  </div>
                  <button 
                    onClick={() => deleteQuiz(quiz.id)} 
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{quiz.description || 'لا يوجد وصف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {quiz.timeLimit && (
                      <>
                        <Clock size={14} />
                        <span>{quiz.timeLimit} دقيقة</span>
                      </>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">{quiz.questions.length} سؤال</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material Upload Modal */}
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
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                {uploading ? (
                  <Loader2 className="animate-spin mx-auto text-red-600" size={24} />
                ) : (
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                )}
                <p className="text-sm text-gray-500">{newMaterial.fileUrl ? "تم اختيار الملف ✅" : "اضغط لاختيار ملف PDF أو صورة"}</p>
                <p className="text-xs text-gray-400 mt-1">الحد الأقصى: 10 ميجابايت</p>
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

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">إضافة درس جديد</h2>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <input 
                type="text" 
                required 
                placeholder="عنوان الدرس" 
                value={newLesson.title} 
                onChange={e => setNewLesson({...newLesson, title: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <textarea 
                placeholder="وصف الدرس" 
                value={newLesson.description} 
                onChange={e => setNewLesson({...newLesson, description: e.target.value})} 
                className="w-full p-3 border rounded-xl h-24" 
              />
              <input 
                type="text" 
                placeholder="رابط الفيديو (YouTube/Vimeo)" 
                value={newLesson.videoUrl} 
                onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <textarea 
                placeholder="محتوى الدرس (HTML مسموح)" 
                value={newLesson.content} 
                onChange={e => setNewLesson({...newLesson, content: e.target.value})} 
                className="w-full p-3 border rounded-xl h-32" 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="ترتيب الدرس" 
                  value={newLesson.order} 
                  onChange={e => setNewLesson({...newLesson, order: parseInt(e.target.value) || 0})} 
                  className="w-full p-3 border rounded-xl" 
                />
                <input 
                  type="number" 
                  placeholder="المدة بالدقائق" 
                  value={newLesson.duration} 
                  onChange={e => setNewLesson({...newLesson, duration: parseInt(e.target.value) || 0})} 
                  className="w-full p-3 border rounded-xl" 
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsLessonModalOpen(false)} 
                  className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">إضافة واجب جديد</h2>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <input 
                type="text" 
                required 
                placeholder="عنوان الواجب" 
                value={newAssignment.title} 
                onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <textarea 
                placeholder="وصف الواجب" 
                value={newAssignment.description} 
                onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} 
                className="w-full p-3 border rounded-xl h-24" 
              />
              <input 
                type="datetime-local" 
                placeholder="تاريخ الاستحقاق" 
                value={newAssignment.dueDate} 
                onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <input 
                type="number" 
                placeholder="الدرجة الكاملة" 
                value={newAssignment.maxScore} 
                onChange={e => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value) || 100})} 
                className="w-full p-3 border rounded-xl" 
              />
              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAssignmentModalOpen(false)} 
                  className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">إضافة اختبار جديد</h2>
            <form onSubmit={handleAddQuiz} className="space-y-4">
              <input 
                type="text" 
                required 
                placeholder="عنوان الاختبار" 
                value={newQuiz.title} 
                onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} 
                className="w-full p-3 border rounded-xl" 
              />
              <textarea 
                placeholder="وصف الاختبار" 
                value={newQuiz.description} 
                onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} 
                className="w-full p-3 border rounded-xl h-24" 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="الوقت بالدقائق" 
                  value={newQuiz.timeLimit} 
                  onChange={e => setNewQuiz({...newQuiz, timeLimit: parseInt(e.target.value) || 0})} 
                  className="w-full p-3 border rounded-xl" 
                />
                <input 
                  type="number" 
                  placeholder="درجة النجاح" 
                  value={newQuiz.passingScore} 
                  onChange={e => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value) || 60})} 
                  className="w-full p-3 border rounded-xl" 
                />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                ملاحظة: يمكنك إضافة الأسئلة لاحقاً بعد إنشاء الاختبار
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsQuizModalOpen(false)} 
                  className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Viewer */}
      {viewingMaterial && (
        <SecureMaterialViewer 
          material={viewingMaterial} 
          onClose={() => setViewingMaterial(null)} 
        />
      )}
    </div>
  );
};
