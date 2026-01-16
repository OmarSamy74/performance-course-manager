import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, Plus, Trash2, Clock, Upload, Loader2, Play, Edit, CheckCircle2, FileCheck, Brain, GraduationCap, Calendar as CalendarIcon, Target, MessageSquare, BarChart3, Mail, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CourseMaterial, Lesson, Assignment, Quiz } from '../../types';
import { generateUUID } from '../lib/utils';
import { fileToBase64 } from '../lib/business-utils';
import { materialsApi, lessonsApi, assignmentsApi, quizzesApi } from '../api/client';
import { LessonPlayer } from '../components/classroom/LessonPlayer';
import { SecureMaterialViewer } from '../components/shared/SecureMaterialViewer';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/button';
import { PageHeader } from '../components/layout/PageHeader';

type ClassroomTab = 'STREAM' | 'CLASSWORK' | 'PEOPLE' | 'GRADES';
type ClassworkTab = 'MATERIALS' | 'LESSONS' | 'ASSIGNMENTS' | 'QUIZZES';

export const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [view, setView] = useState<'CLASSROOM' | 'ADMIN'>('CLASSROOM');
  const [activeTab, setActiveTab] = useState<ClassroomTab>('STREAM');
  const [classworkTab, setClassworkTab] = useState<ClassworkTab>('MATERIALS');
  const [announcement, setAnnouncement] = useState('');
  
  // Materials state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '' });
  // Removed uploading state - no longer needed with Google Drive links
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);
  
  // Lessons state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', videoUrl: '', moduleId: 'default', order: 0, duration: 0 });
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
  
  // Assignments state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });
  
  // Quizzes state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', questions: [] as any[], timeLimit: 0, passingScore: 60 });

  // Data is automatically loaded by AppContext when user changes
  // No need to manually call refreshData here

  // Materials handlers - Use Google Drive link instead of file upload
  const handleDriveLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const driveUrl = e.target.value.trim();
    
    // Validate Google Drive URL
    if (driveUrl && !driveUrl.includes('drive.google.com')) {
      alert('يرجى إدخال رابط Google Drive صحيح');
      return;
    }
    
    // Convert Google Drive sharing URL to direct view URL if needed
    let finalUrl = driveUrl;
    if (driveUrl.includes('/file/d/')) {
      // Extract file ID from sharing URL
      const fileIdMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        // Convert to direct view URL
        finalUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    
    setNewMaterial({ ...newMaterial, fileUrl: finalUrl });
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
        order: newLesson.order || state.lessons.length,
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

  // Redirect to admin page if view is ADMIN
  useEffect(() => {
    if (view === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [view, navigate]);

  // If Teacher wants to see Admin View - show loading while redirecting
  if (view === 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التوجيه إلى صفحة الإدارة...</p>
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
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 shadow-lg border-b border-blue-800 px-6 py-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white text-blue-600 p-2 rounded-lg">
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
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">الملفات</p>
                <p className="text-3xl font-bold">{state.materials.length}</p>
              </div>
              <FileText size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">الدروس</p>
                <p className="text-3xl font-bold">{state.lessons.length}</p>
              </div>
              <Play size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">الواجبات</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <FileCheck size={32} className="opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">الاختبارات</p>
                <p className="text-3xl font-bold">{quizzes.length}</p>
              </div>
              <Brain size={32} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Main Tabs - Google Classroom Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('STREAM')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'STREAM' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare size={18} /> البث (Stream)
            </button>
            <button
              onClick={() => setActiveTab('CLASSWORK')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'CLASSWORK' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={18} /> الأعمال (Classwork)
            </button>
            <button
              onClick={() => setActiveTab('PEOPLE')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'PEOPLE' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={18} /> الأشخاص (People)
            </button>
            <button
              onClick={() => setActiveTab('GRADES')}
              className={`flex-1 py-4 px-6 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'GRADES' 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={18} /> الدرجات (Grades)
            </button>
          </div>
        </div>

        {/* Stream Tab - Announcements */}
        {activeTab === 'STREAM' && (
          <div className="space-y-6">
            {/* Post Announcement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">نشر إعلان</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="شارك شيئاً مع الفصل..."
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAnnouncement('')}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (announcement.trim()) {
                        alert('سيتم إضافة نظام الإعلانات قريباً');
                        setAnnouncement('');
                      }
                    }}
                    leftIcon={<Send size={18} />}
                  >
                    نشر
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">النشاط الأخير</h3>
              <div className="space-y-4">
                {assignments.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <FileCheck className="text-blue-600 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800">تم إنشاء واجب جديد</p>
                        <p className="text-sm text-gray-600">{assignments[0].title}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(assignments[0].createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>
                )}
                {state.materials.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <FileText className="text-green-600 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800">تم رفع مادة جديدة</p>
                        <p className="text-sm text-gray-600">{state.materials[0].title}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(state.materials[0].createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>
                )}
                {state.materials.length === 0 && assignments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">لا يوجد نشاط حتى الآن</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Classwork Tab - Organized Content */}
        {activeTab === 'CLASSWORK' && (
          <div className="space-y-6">
            {/* Sub-tabs for Classwork */}
            <div className="bg-gray-50 rounded-xl p-2 flex gap-2">
              <button
                onClick={() => setClassworkTab('MATERIALS')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  classworkTab === 'MATERIALS' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <FileText size={16} className="inline mr-2" /> المواد
              </button>
              <button
                onClick={() => setClassworkTab('LESSONS')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  classworkTab === 'LESSONS' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Play size={16} className="inline mr-2" /> الدروس
              </button>
              <button
                onClick={() => setClassworkTab('ASSIGNMENTS')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  classworkTab === 'ASSIGNMENTS' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <FileCheck size={16} className="inline mr-2" /> الواجبات
              </button>
              <button
                onClick={() => setClassworkTab('QUIZZES')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  classworkTab === 'QUIZZES' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Brain size={16} className="inline mr-2" /> الاختبارات
              </button>
            </div>

            {/* Content Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {classworkTab === 'MATERIALS' && 'المواد التعليمية'}
                {classworkTab === 'LESSONS' && 'الدروس'}
                {classworkTab === 'ASSIGNMENTS' && 'الواجبات'}
                {classworkTab === 'QUIZZES' && 'الاختبارات'}
              </h2>
              <button 
                onClick={() => {
                  if (classworkTab === 'MATERIALS') setIsUploadModalOpen(true);
                  if (classworkTab === 'LESSONS') setIsLessonModalOpen(true);
                  if (classworkTab === 'ASSIGNMENTS') setIsAssignmentModalOpen(true);
                  if (classworkTab === 'QUIZZES') setIsQuizModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-green-700 shadow-lg shadow-blue-200 transition-all font-bold"
              >
                <Plus size={20} /> 
                <span>
                  {classworkTab === 'MATERIALS' && '⚽ رفع مادة جديدة'}
                  {classworkTab === 'LESSONS' && 'إضافة درس جديد'}
                  {classworkTab === 'ASSIGNMENTS' && 'إضافة واجب جديد'}
                  {classworkTab === 'QUIZZES' && 'إضافة اختبار جديد'}
                </span>
              </button>
            </div>

            {/* Materials Sub-tab */}
            {classworkTab === 'MATERIALS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.materials.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileText className="text-blue-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا يوجد محتوى حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ برفع المحاضرات والمواد التعليمية</p>
                <button 
                  onClick={() => setIsUploadModalOpen(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold"
                >
                  ⚽ رفع أول محتوى
                </button>
              </div>
            ) : state.materials.map((item: CourseMaterial) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer"
                onClick={() => setViewingMaterial(item)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMaterial(item.id);
                    }} 
                    className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{item.description || 'لا يوجد وصف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} />
                    <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{item.fileType}</span>
                </div>
              </div>
            ))}
          </div>
        )}

            {/* Lessons Sub-tab */}
            {classworkTab === 'LESSONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.lessons.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Play className="text-cyan-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد دروس حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة دروس جديدة</p>
                <button 
                  onClick={() => setIsLessonModalOpen(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold"
                >
                  إضافة أول درس
                </button>
              </div>
            ) : state.lessons.map((lesson: Lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 group">
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
                      className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">{lesson.title}</h3>
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

            {/* Assignments Sub-tab */}
            {classworkTab === 'ASSIGNMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <FileCheck className="text-green-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد واجبات حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة واجبات جديدة</p>
                <button 
                  onClick={() => setIsAssignmentModalOpen(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold"
                >
                  إضافة أول واجب
                </button>
              </div>
            ) : assignments.map((assignment: Assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FileCheck size={28} />
                  </div>
                  <button 
                    onClick={() => deleteAssignment(assignment.id)} 
                    className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">{assignment.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 min-h-[3rem]">{assignment.description || 'لا يوجد وصف'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {assignment.dueDate && (
                      <>
                        <CalendarIcon size={14} />
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

            {/* Quizzes Sub-tab */}
            {classworkTab === 'QUIZZES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Brain className="text-purple-600 mx-auto mb-4" size={40} />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">لا توجد اختبارات حالياً</h3>
                <p className="text-gray-500 mb-6">ابدأ بإضافة اختبارات جديدة</p>
                <button 
                  onClick={() => setIsQuizModalOpen(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold"
                >
                  إضافة أول اختبار
                </button>
              </div>
            ) : quizzes.map((quiz: Quiz) => (
              <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Brain size={28} />
                  </div>
                  <button 
                    onClick={() => deleteQuiz(quiz.id)} 
                    className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">{quiz.title}</h3>
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
        )}

        {/* People Tab - Student Management */}
        {activeTab === 'PEOPLE' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">الطلاب المسجلين</h2>
                <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                  {state.students.length} طالب
                </span>
              </div>
              <div className="space-y-3">
                {state.students.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا يوجد طلاب مسجلين حالياً</p>
                ) : state.students.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Mail size={16} />}
                        onClick={() => window.open(`mailto:${student.phone}@example.com`)}
                      >
                        إرسال بريد
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grades Tab - Gradebook */}
        {activeTab === 'GRADES' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">سجل الدرجات</h2>
                <Button
                  variant="primary"
                  leftIcon={<BarChart3 size={18} />}
                  onClick={() => alert('سيتم إضافة تصدير الدرجات قريباً')}
                >
                  تصدير الدرجات
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="p-4 font-bold text-gray-700">اسم الطالب</th>
                      <th className="p-4 font-bold text-gray-700">الواجبات</th>
                      <th className="p-4 font-bold text-gray-700">الاختبارات</th>
                      <th className="p-4 font-bold text-gray-700">المجموع</th>
                      <th className="p-4 font-bold text-gray-700">النسبة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {state.students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-gray-500">
                          لا يوجد طلاب لعرض درجاتهم
                        </td>
                      </tr>
                    ) : state.students.map((student: any) => {
                      const studentAssignments = assignments.length; // Placeholder
                      const studentQuizzes = quizzes.length; // Placeholder
                      const totalScore = 0; // Placeholder
                      const percentage = assignments.length > 0 ? Math.round((totalScore / (assignments.length * 100)) * 100) : 0;
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="p-4 font-semibold text-gray-800">{student.name}</td>
                          <td className="p-4 text-gray-600">{studentAssignments}</td>
                          <td className="p-4 text-gray-600">{studentQuizzes}</td>
                          <td className="p-4 font-bold text-gray-800">{totalScore}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              percentage >= 80 ? 'bg-green-100 text-green-700' :
                              percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="رفع محتوى جديد"
        icon={<FileText className="text-white" size={24} />}
        iconColor="blue"
        size="lg"
      >
        <form onSubmit={handleAddMaterial} className="space-y-5">
          <FormField label="عنوان المحاضرة" required>
            <Input 
              type="text" 
              required 
              placeholder="أدخل عنوان المحاضرة" 
              value={newMaterial.title} 
              onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} 
            />
          </FormField>
          <FormField label="وصف المحتوى">
            <Textarea 
              placeholder="أدخل وصفاً للمحتوى (اختياري)" 
              value={newMaterial.description} 
              onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} 
              className="h-28"
            />
          </FormField>
              <FormField label="رابط Google Drive *" required>
                <Input 
                  type="url" 
                  required 
                  placeholder="https://drive.google.com/file/d/1fB_M6Sumtr37jx5VOvmMADAHCdcNEQhk/view?usp=sharing" 
                  value={newMaterial.fileUrl} 
                  onChange={handleDriveLinkChange}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  أدخل رابط مشاركة Google Drive للملف (PDF أو صورة)
                </p>
                {newMaterial.fileUrl && newMaterial.fileUrl.includes('drive.google.com') && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-green-600" />
                      رابط Google Drive صحيح
                    </p>
                  </div>
                )}
              </FormField>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsUploadModalOpen(false)} 
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={!newMaterial.fileUrl || uploading} 
              variant="primary"
              isLoading={uploading}
              className="flex-1"
              leftIcon={uploading ? undefined : '📤'}
            >
              {uploading ? undefined : 'نشر المحتوى'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => {
          setIsLessonModalOpen(false);
          setNewLesson({ title: '', description: '', content: '', videoUrl: '', moduleId: 'default', order: state.lessons.length, duration: 0 });
        }}
        title="إضافة درس جديد"
        icon={<Play className="text-white" size={24} />}
        iconColor="blue"
        size="lg"
      >
        <form onSubmit={handleAddLesson} className="space-y-5">
          <FormField label="عنوان الدرس" required>
            <Input 
              type="text" 
              required 
              placeholder="أدخل عنوان الدرس" 
              value={newLesson.title} 
              onChange={e => setNewLesson({...newLesson, title: e.target.value})} 
            />
          </FormField>
          <FormField label="وصف الدرس">
            <Textarea 
              placeholder="أدخل وصفاً للدرس" 
              value={newLesson.description} 
              onChange={e => setNewLesson({...newLesson, description: e.target.value})} 
              className="h-24"
            />
          </FormField>
          <FormField label="رابط الفيديو">
            <Input 
              type="url" 
              placeholder="https://youtube.com/... أو https://vimeo.com/..." 
              value={newLesson.videoUrl} 
              onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} 
            />
          </FormField>
          <FormField label="محتوى الدرس">
            <Textarea 
              placeholder="أدخل محتوى الدرس (HTML مسموح)" 
              value={newLesson.content} 
              onChange={e => setNewLesson({...newLesson, content: e.target.value})} 
              className="h-32 font-mono text-sm"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ترتيب الدرس">
              <Input 
                type="number" 
                placeholder="0" 
                value={newLesson.order} 
                onChange={e => setNewLesson({...newLesson, order: parseInt(e.target.value) || 0})} 
              />
            </FormField>
            <FormField label="المدة (دقائق)">
              <Input 
                type="number" 
                placeholder="0" 
                value={newLesson.duration} 
                onChange={e => setNewLesson({...newLesson, duration: parseInt(e.target.value) || 0})} 
              />
            </FormField>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsLessonModalOpen(false)} 
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="flex-1"
              leftIcon="💾"
            >
              حفظ الدرس
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title="إضافة واجب جديد"
        icon={<FileCheck className="text-white" size={24} />}
        iconColor="green"
        size="md"
      >
        <form onSubmit={handleAddAssignment} className="space-y-5">
          <FormField label="عنوان الواجب" required>
            <Input 
              type="text" 
              required 
              placeholder="أدخل عنوان الواجب" 
              value={newAssignment.title} 
              onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} 
            />
          </FormField>
          <FormField label="وصف الواجب">
            <Textarea 
              placeholder="أدخل وصفاً للواجب" 
              value={newAssignment.description} 
              onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} 
              className="h-24"
            />
          </FormField>
          <FormField label="تاريخ الاستحقاق">
            <Input 
              type="datetime-local" 
              value={newAssignment.dueDate} 
              onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} 
            />
          </FormField>
          <FormField label="الدرجة الكاملة">
            <Input 
              type="number" 
              placeholder="100" 
              value={newAssignment.maxScore} 
              onChange={e => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value) || 100})} 
            />
          </FormField>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsAssignmentModalOpen(false)} 
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="success"
              className="flex-1"
              leftIcon="💾"
            >
              حفظ الواجب
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title="إضافة اختبار جديد"
        icon={<Brain className="text-white" size={24} />}
        iconColor="purple"
        size="md"
      >
        <form onSubmit={handleAddQuiz} className="space-y-5">
          <FormField label="عنوان الاختبار" required>
            <Input 
              type="text" 
              required 
              placeholder="أدخل عنوان الاختبار" 
              value={newQuiz.title} 
              onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} 
            />
          </FormField>
          <FormField label="وصف الاختبار">
            <Textarea 
              placeholder="أدخل وصفاً للاختبار" 
              value={newQuiz.description} 
              onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} 
              className="h-24"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="الوقت (دقائق)">
              <Input 
                type="number" 
                placeholder="0" 
                value={newQuiz.timeLimit} 
                onChange={e => setNewQuiz({...newQuiz, timeLimit: parseInt(e.target.value) || 0})} 
              />
            </FormField>
            <FormField label="درجة النجاح">
              <Input 
                type="number" 
                placeholder="60" 
                value={newQuiz.passingScore} 
                onChange={e => setNewQuiz({...newQuiz, passingScore: parseInt(e.target.value) || 60})} 
              />
            </FormField>
          </div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Brain className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm font-medium text-yellow-800">
                ملاحظة: يمكنك إضافة الأسئلة لاحقاً بعد إنشاء الاختبار
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsQuizModalOpen(false)} 
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="flex-1"
              leftIcon="💾"
            >
              حفظ الاختبار
            </Button>
          </div>
        </form>
      </Modal>

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
