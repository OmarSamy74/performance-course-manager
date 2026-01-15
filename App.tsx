import React, { useState, useEffect, useMemo } from 'react';

// Browser-compatible UUID generator
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
import { 
  Users, Wallet, AlertCircle, Plus, Trash2, CheckCircle2, 
  FileSpreadsheet, Search, LogOut, Upload, Eye, XCircle, UserCircle, Loader2,
  Briefcase, Phone, MessageSquare, ArrowRight, LayoutDashboard, Target,
  BookOpen, FileText, Lock, Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { Student, PaymentPlan, COURSE_COST, HALF_PAYMENT_INITIAL, User, UserRole, InstallmentStatus, Lead, LeadStatus, CourseMaterial } from './types';
import { calculateFinancials, formatCurrency, getStatusColor, getStatusLabel, fileToBase64, getLeadStatusColor, getLeadStatusLabel } from './utils';
import { useAuth } from './src/hooks/useAuth';
import { studentsApi, leadsApi, materialsApi } from './src/api/client';

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const { user: currentUser, loading: authLoading, login: apiLogin, logout: apiLogout } = useAuth();
  
  // --- GLOBAL STATE ---
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch data from API when user is logged in
  useEffect(() => {
    if (currentUser && !authLoading) {
      setDataLoading(true);
      Promise.all([
        studentsApi.list().catch(() => ({ students: [] })),
        leadsApi.list().catch(() => ({ leads: [] })),
        materialsApi.list().catch(() => ({ materials: [] }))
      ]).then(([studentsRes, leadsRes, materialsRes]) => {
        setStudents(studentsRes.students || []);
        setLeads(leadsRes.leads || []);
        setMaterials(materialsRes.materials || []);
        setDataLoading(false);
      }).catch(() => {
        // Fallback to localStorage if API fails
        const savedStudents = localStorage.getItem('course_system_v2_students');
        const savedLeads = localStorage.getItem('course_system_crm_leads');
        const savedMaterials = localStorage.getItem('course_system_materials');
        if (savedStudents) setStudents(JSON.parse(savedStudents));
        if (savedLeads) setLeads(JSON.parse(savedLeads));
        if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
        setDataLoading(false);
      });
    } else if (!currentUser && !authLoading) {
      setDataLoading(false);
    }
  }, [currentUser, authLoading]);

  // Sync data to API when it changes (for updates)
  const updateStudents = async (newStudents: Student[]) => {
    setStudents(newStudents);
    // Try to sync to API, but don't fail if it doesn't work
    try {
      // In a real implementation, we'd update via API here
      // For now, we'll keep localStorage as backup
      localStorage.setItem('course_system_v2_students', JSON.stringify(newStudents));
    } catch (e) {
      console.error('Failed to sync students:', e);
    }
  };

  const updateLeads = async (newLeads: Lead[]) => {
    setLeads(newLeads);
    try {
      localStorage.setItem('course_system_crm_leads', JSON.stringify(newLeads));
    } catch (e) {
      console.error('Failed to sync leads:', e);
    }
  };

  const updateMaterials = async (newMaterials: CourseMaterial[]) => {
    setMaterials(newMaterials);
    try {
      localStorage.setItem('course_system_materials', JSON.stringify(newMaterials));
    } catch (e) {
      console.error('Failed to sync materials:', e);
    }
  };

  // --- ACTIONS ---
  const login = async (username: string, password: string) => {
    try {
      await apiLogin(username, password);
    } catch (error: any) {
      // Fallback to local login for backward compatibility
      if (username === 'admin' && password === '123') {
        // Will be handled by API
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    await apiLogout();
  };

  // --- ROUTING RENDER ---
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="animate-spin text-white" size={48} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="mt-4 text-white font-bold">⚽ جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={login} students={students} />;
  }

  // Admin Role
  if (currentUser.role === UserRole.ADMIN) {
    return <AdminDashboard user={currentUser} students={students} setStudents={updateStudents} leads={leads} setLeads={updateLeads} onLogout={logout} />;
  }

  // Teacher Role (Includes Admin features + Classroom)
  if (currentUser.role === UserRole.TEACHER) {
    return <TeacherDashboard user={currentUser} students={students} setStudents={updateStudents} leads={leads} setLeads={updateLeads} materials={materials} setMaterials={updateMaterials} onLogout={logout} />;
  }

  // Sales Role
  if (currentUser.role === UserRole.SALES) {
    return <SalesDashboard user={currentUser} leads={leads} setLeads={updateLeads} students={students} setStudents={updateStudents} onLogout={logout} />;
  }

  // Student Role
  return <StudentPortal user={currentUser} students={students} setStudents={updateStudents} materials={materials} onLogout={logout} />;
};

// --- LOGIN VIEW ---
const LoginView = ({ onLogin, students }: { onLogin: (username: string, password: string) => Promise<void>, students: Student[] }) => {
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Students login with phone number as both username and password
      await onLogin(phone, phone);
    } catch (err: any) {
      setError(err.message || 'رقم الهاتف غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(username, password);
    } catch (err: any) {
      setError(err.message || 'بيانات خاطئة. Admin: admin/123 | Teacher: teacher/123 | Sales: sales/123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-4 relative overflow-hidden">
      {/* Soccer Field Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 w-24 h-32 border-4 border-white transform -translate-y-1/2 border-r-0 rounded-r-full"></div>
        <div className="absolute top-1/2 right-0 w-24 h-32 border-4 border-white transform -translate-y-1/2 border-l-0 rounded-l-full"></div>
      </div>

      {/* Soccer Field Image Background (Optional - uncomment to use) */}
      {/* <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80" 
          alt="Soccer Field" 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div> */}

      {/* Soccer Ball Decoration */}
      <div className="absolute top-10 right-10 w-20 h-20 opacity-20 animate-bounce">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="white"/>
          <path d="M50 5 L50 95 M5 50 L95 50 M25 25 L75 75 M75 25 L25 75" stroke="#1a472a" strokeWidth="3"/>
          <circle cx="50" cy="50" r="8" fill="#1a472a"/>
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-300 relative z-10 border-4 border-green-400">
        {/* Soccer Theme Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-white">
              <circle cx="12" cy="12" r="10" fill="white" opacity="0.3"/>
              <path d="M12 2 L12 22 M2 12 L22 12 M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚽ أكاديمية كرة القدم</h1>
          <p className="text-gray-600 font-semibold">نظام إدارة التدريب والأداء</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setError('');
              setPhone('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              loginType === 'student'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 طالب
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('staff');
              setError('');
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              loginType === 'staff'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎓 فريق العمل
          </button>
        </div>

        {/* Student Login Form */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-green-600" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-500 mt-1">استخدم رقم هاتفك المسجل</p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
              {loading ? 'جاري الدخول...' : 'دخول كطالب'}
            </button>
          </form>
        )}

        {/* Staff Login Form */}
        {loginType === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserCircle size={16} className="text-green-600" />
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, teacher, sales..."
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-green-600" />
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
              {loading ? 'جاري الدخول...' : 'دخول كفريق عمل'}
            </button>

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              <p className="mb-1">🔑 حسابات تجريبية:</p>
              <p>Admin: admin / 123</p>
              <p>Teacher: omar.samy / 123</p>
              <p>Sales: sales / 123</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- SALES DASHBOARD (CRM) ---
const SalesDashboard = ({ user, leads, setLeads, students, setStudents, onLogout }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Stats
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l: Lead) => l.status === LeadStatus.NEW).length;
    const interested = leads.filter((l: Lead) => l.status === LeadStatus.INTERESTED).length;
    const converted = leads.filter((l: Lead) => l.status === LeadStatus.CONVERTED).length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, newLeads, interested, converted, conversionRate };
  }, [leads]);

  // Form State
  const [newLead, setNewLead] = useState({ name: '', phone: '', source: '', notes: '' });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: generateUUID(),
      name: newLead.name,
      phone: newLead.phone,
      source: newLead.source || 'Direct',
      notes: newLead.notes,
      status: LeadStatus.NEW,
      createdAt: new Date().toISOString()
    };
    setLeads([lead, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ name: '', phone: '', source: '', notes: '' });
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(leads.map((l: Lead) => l.id === id ? { ...l, status } : l));
  };

  const deleteLead = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setLeads(leads.filter((l: Lead) => l.id !== id));
    }
  };

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    // If selecting 'Converted' and it wasn't already converted
    if (newStatus === LeadStatus.CONVERTED && lead.status !== LeadStatus.CONVERTED) {
      
      const isAlreadyStudent = students.some((s: Student) => s.phone === lead.phone);
      if (isAlreadyStudent) {
        alert('هذا العميل مسجل بالفعل كطالب.');
        updateLeadStatus(lead.id, newStatus);
        return;
      }

      const confirmConvert = confirm(`هل تريد تحويل "${lead.name}" إلى قائمة الطلاب الآن؟`);
      if (confirmConvert) {
         // Create Student
         const newStudent: Student = {
          id: generateUUID(),
          name: lead.name,
          phone: lead.phone,
          plan: PaymentPlan.HALF,
          installments: {
            inst1: { status: InstallmentStatus.UNPAID },
            inst2: { status: InstallmentStatus.UNPAID },
            inst3: { status: InstallmentStatus.UNPAID }
          },
          createdAt: new Date().toISOString()
        };
        // Add to students
        setStudents([newStudent, ...students]);
        // Update Lead Status
        updateLeadStatus(lead.id, newStatus);
        alert('تم إضافة الطالب إلى النظام المالي بنجاح ✅');
      } else {
        // If cancelled, do nothing (do not change status)
      }
    } else {
      // Normal update
      updateLeadStatus(lead.id, newStatus);
    }
  };

  const filteredLeads = leads.filter((l: Lead) => l.name.includes(searchTerm) || l.phone.includes(searchTerm));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b border-green-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-white text-green-600 p-2 rounded-lg"><Briefcase size={20} /></div>
            <span className="font-bold text-white">⚽ نظام المبيعات (CRM)</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-white">أهلاً، {user.username}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
                <LogOut size={18} />
                <span className="hidden md:inline">خروج</span>
            </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="إجمالي العملاء" value={stats.total} icon={<Users className="text-blue-600" />} bgColor="bg-blue-50" textColor="text-blue-900" />
          <StatCard title="عملاء جدد" value={stats.newLeads} icon={<Target className="text-purple-600" />} bgColor="bg-purple-50" textColor="text-purple-900" />
          <StatCard title="مهتمين" value={stats.interested} icon={<Eye className="text-orange-600" />} bgColor="bg-orange-50" textColor="text-orange-900" />
          <StatCard title="نسبة التحويل" value={`${stats.conversionRate}%`} subValue={`${stats.converted} طالب`} icon={<CheckCircle2 className="text-green-600" />} bgColor="bg-green-50" textColor="text-green-900" />
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">قائمة العملاء المحتملين</h2>
          <div className="flex gap-3">
            <div className="relative">
                <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-10 py-2 border rounded-xl w-64 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-lg shadow-green-200 transition-all">
                <Plus size={20} /> <span>إضافة عميل</span>
            </button>
          </div>
        </div>

        {/* CRM Table (Sheet) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-4">العميل</th>
                  <th className="p-4">المصدر</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 w-1/4">ملاحظات</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-400">لا يوجد عملاء حالياً</td></tr>
                ) : filteredLeads.map((lead: Lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{lead.name}</div>
                      <a href={`tel:${lead.phone}`} className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        <Phone size={12} /> {lead.phone}
                      </a>
                    </td>
                    <td className="p-4 text-gray-600">{lead.source}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="p-4">
                      <select 
                        value={lead.status} 
                        onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${getLeadStatusColor(lead.status)} focus:ring-0`}
                        disabled={lead.status === LeadStatus.CONVERTED}
                      >
                        {Object.values(LeadStatus).map(s => (
                          <option key={s} value={s}>{getLeadStatusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-500 truncate max-w-xs" title={lead.notes}>{lead.notes || '-'}</td>
                    <td className="p-4 flex items-center gap-2">
                      <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer" className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="WhatsApp">
                        <MessageSquare size={16} />
                      </a>
                      <button onClick={() => deleteLead(lead.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">إضافة عميل جديد</h2>
            <form onSubmit={handleAddLead} className="space-y-3">
              <input type="text" required placeholder="اسم العميل" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full p-3 border rounded-xl" />
              <input type="text" required placeholder="رقم الهاتف" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full p-3 border rounded-xl" />
              <input type="text" placeholder="المصدر (مثلاً: فيسبوك، إحالة)" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})} className="w-full p-3 border rounded-xl" />
              <textarea placeholder="ملاحظات" value={newLead.notes} onChange={e => setNewLead({...newLead, notes: e.target.value})} className="w-full p-3 border rounded-xl h-24" />
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600">إلغاء</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ user, students, setStudents, leads, setLeads, onLogout }: any) => {
  const [view, setView] = useState<'FINANCE' | 'CRM'>('FINANCE');

  // If Admin wants to see CRM, render SalesDashboard but with Admin privileges
  if (view === 'CRM') {
    return (
      <div className="relative">
        <div className="fixed bottom-4 left-4 z-50">
          <button onClick={() => setView('FINANCE')} className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-green-700">
            <LayoutDashboard size={16} /> ⚽ العودة للمالية
          </button>
        </div>
        <SalesDashboard user={user} leads={leads} setLeads={setLeads} students={students} setStudents={setStudents} onLogout={onLogout} />
      </div>
    );
  }

  // --- EXISTING ADMIN DASHBOARD CODE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [proofModalData, setProofModalData] = useState<{studentId: string, installmentKey: string, url: string} | null>(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<PaymentPlan>(PaymentPlan.HALF);

  // Derived Stats
  const stats = useMemo(() => {
    let totalExpected = students.length * COURSE_COST;
    let totalCollected = 0;
    let totalRemaining = 0;
    let fullPaidCount = 0;
    let pendingReviews = 0;

    students.forEach((s: Student) => {
      const { paid, remaining, isFullyPaid } = calculateFinancials(s);
      totalCollected += paid;
      totalRemaining += remaining;
      if (isFullyPaid) fullPaidCount++;

      if (s.installments.inst1.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst2.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst3.status === InstallmentStatus.PENDING) pendingReviews++;
    });

    return { totalExpected, totalCollected, totalRemaining, fullPaidCount, pendingReviews };
  }, [students]);

  // Handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newStudent: Student = {
      id: generateUUID(),
      name: newName,
      phone: newPhone,
      plan: newPlan,
      installments: {
        inst1: { status: InstallmentStatus.UNPAID },
        inst2: { status: InstallmentStatus.UNPAID },
        inst3: { status: InstallmentStatus.UNPAID }
      },
      createdAt: new Date().toISOString()
    };

    setStudents([newStudent, ...students]);
    setNewName('');
    setNewPhone('');
    setNewPlan(PaymentPlan.HALF);
    setIsModalOpen(false);
  };

  const updateInstallmentStatus = (studentId: string, key: 'inst1' | 'inst2' | 'inst3', status: InstallmentStatus) => {
    setStudents(students.map((s: Student) => {
      if (s.id === studentId) {
        return {
          ...s,
          installments: {
            ...s.installments,
            [key]: { ...s.installments[key], status }
          }
        };
      }
      return s;
    }));
    if (proofModalData) setProofModalData(null); // Close modal if open
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      setStudents(students.filter((s: Student) => s.id !== id));
    }
  };

  const exportToExcel = () => {
    const data = students.map((s: Student) => {
      const { paid, remaining } = calculateFinancials(s);
      return {
        "اسم الطالب": s.name,
        "رقم الهاتف": s.phone,
        "نظام الدفع": s.plan === PaymentPlan.FULL ? "كامل (6000)" : "نصف (3000)",
        "القسط الأول": getStatusLabel(s.installments.inst1.status),
        "القسط الثاني": getStatusLabel(s.installments.inst2.status),
        "القسط الثالث": getStatusLabel(s.installments.inst3.status),
        "إجمالي المدفوع": paid,
        "المبلغ المتبقي": remaining,
        "تاريخ التسجيل": new Date(s.createdAt).toLocaleDateString('ar-EG')
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المدفوعات");
    XLSX.writeFile(wb, "Course_Payments_System.xlsx");
  };

  const filteredStudents = students.filter((s: Student) => 
    s.name.includes(searchTerm) || s.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b border-green-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-white text-green-600 p-2 rounded-lg"><Wallet size={20} /></div>
            <span className="font-bold text-white hidden md:block">⚽ لوحة تحكم المسؤول</span>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setView('CRM')} className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30 backdrop-blur-sm">
              <Briefcase size={16} /> إدارة المبيعات (CRM)
            </button>
            <div className="h-6 w-px bg-white/30"></div>
            <span className="text-sm text-white">أهلاً، {user.username}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <LogOut size={18} />
                <span className="hidden md:inline">خروج</span>
            </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">نظرة عامة</h1>
            <p className="text-gray-500 mt-1">إدارة الطلاب والمدفوعات</p>
          </div>
          <div className="flex gap-3">
              <button onClick={exportToExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-200 transition-all">
                  <FileSpreadsheet size={20} /> <span>إكسيل</span>
              </button>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-200 transition-all">
                  <Plus size={20} /> <span>⚽ طالب جديد</span>
              </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="إجمالي الدخل المتوقع" value={formatCurrency(stats.totalExpected)} icon={<Wallet className="text-blue-600" />} bgColor="bg-blue-50" textColor="text-blue-900" />
          <StatCard title="تم تحصيله فعلياً" value={formatCurrency(stats.totalCollected)} icon={<CheckCircle2 className="text-green-600" />} bgColor="bg-green-50" textColor="text-green-900" />
          <StatCard title="إجمالي المتأخرات" value={formatCurrency(stats.totalRemaining)} icon={<AlertCircle className="text-red-600" />} bgColor="bg-red-50" textColor="text-red-900" />
          <StatCard title="طلبات المراجعة" value={stats.pendingReviews.toString()} subValue="سكرين شوت" icon={<Eye className="text-orange-600" />} bgColor="bg-orange-50" textColor="text-orange-900" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-800">سجل الطلاب</h2>
                <div className="relative">
                    <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-10 py-2 border rounded-lg w-64 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-600 font-semibold">
                        <tr>
                            <th className="p-4">الطالب</th>
                            <th className="p-4">النظام</th>
                            <th className="p-4 text-center">الأقساط</th>
                            <th className="p-4">المدفوع</th>
                            <th className="p-4">المتبقي</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map(student => {
                            const financials = calculateFinancials(student);
                            return (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{student.name}</div>
                                        <div className="text-xs text-gray-500">{student.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.plan === PaymentPlan.FULL ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {student.plan === PaymentPlan.FULL ? 'كامل' : '50%'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                      {student.plan === PaymentPlan.FULL ? (
                                        <div className="text-center text-green-500 font-bold text-sm">تم السداد</div>
                                      ) : (
                                        <div className="flex justify-center gap-2">
                                          {['inst1', 'inst2', 'inst3'].map((key, idx) => {
                                            const k = key as 'inst1' | 'inst2' | 'inst3';
                                            const inst = student.installments[k];
                                            return (
                                              <button 
                                                key={key}
                                                onClick={() => {
                                                  // Cycle Status: UNPAID -> PAID -> UNPAID (Simple toggle for Admin)
                                                  // OR if Pending, show modal
                                                  if (inst.status === InstallmentStatus.PENDING && inst.proofUrl) {
                                                    setProofModalData({ studentId: student.id, installmentKey: k, url: inst.proofUrl });
                                                  } else {
                                                    const nextStatus = inst.status === InstallmentStatus.PAID ? InstallmentStatus.UNPAID : InstallmentStatus.PAID;
                                                    updateInstallmentStatus(student.id, k, nextStatus);
                                                  }
                                                }}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all relative ${getStatusColor(inst.status)}`}
                                                title={`قسط ${idx+1}: ${getStatusLabel(inst.status)}`}
                                              >
                                                {inst.status === InstallmentStatus.PAID && <CheckCircle2 size={16} />}
                                                {inst.status === InstallmentStatus.PENDING && <Eye size={16} className="animate-pulse" />}
                                                {inst.status === InstallmentStatus.UNPAID && <span className="text-xs font-bold">{idx+1}</span>}
                                                {inst.status === InstallmentStatus.REJECTED && <XCircle size={16} />}
                                              </button>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4 text-green-600 font-bold">{formatCurrency(financials.paid)}</td>
                                    <td className="p-4 font-bold text-red-500">{formatCurrency(financials.remaining)}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Proof Review Modal */}
        {proofModalData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-in zoom-in duration-200">
              <h3 className="text-xl font-bold mb-4">مراجعة إيصال الدفع</h3>
              <div className="bg-gray-100 rounded-lg p-2 mb-4 max-h-[60vh] overflow-auto flex justify-center">
                <img src={proofModalData.url} alt="Proof" className="max-w-full rounded shadow-sm" />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => updateInstallmentStatus(proofModalData.studentId, proofModalData.installmentKey as any, InstallmentStatus.REJECTED)}
                  className="flex-1 py-3 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-xl transition-colors"
                >
                  رفض
                </button>
                <button 
                  onClick={() => updateInstallmentStatus(proofModalData.studentId, proofModalData.installmentKey as any, InstallmentStatus.PAID)}
                  className="flex-1 py-3 bg-green-600 text-white hover:bg-green-700 font-bold rounded-xl transition-colors shadow-lg shadow-green-200"
                >
                  قبول وتأكيد الدفع
                </button>
              </div>
              <button onClick={() => setProofModalData(null)} className="w-full mt-3 text-gray-500 text-sm hover:underline">إلغاء</button>
            </div>
          </div>
        )}
      
        {/* Add Student Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">إضافة طالب جديد</h2>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="الاسم الثلاثي" />
                      <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="01xxxxxxxxx" />
                      <div className="grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => setNewPlan(PaymentPlan.HALF)} className={`p-3 rounded-xl border-2 ${newPlan === PaymentPlan.HALF ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>50% مقدم</button>
                          <button type="button" onClick={() => setNewPlan(PaymentPlan.FULL)} className={`p-3 rounded-xl border-2 ${newPlan === PaymentPlan.FULL ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>كامل</button>
                      </div>
                      <div className="flex gap-3 mt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl">إلغاء</button>
                          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">حفظ</button>
                      </div>
                  </form>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- TEACHER DASHBOARD (NEW) ---
const TeacherDashboard = ({ user, materials, setMaterials, students, setStudents, leads, setLeads, onLogout }: any) => {
  const [view, setView] = useState<'CLASSROOM' | 'ADMIN'>('CLASSROOM');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', fileUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setNewMaterial({ ...newMaterial, fileUrl: base64 });
      } catch (err) {
        alert("خطأ في رفع الملف");
      }
      setUploading(false);
    }
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.fileUrl) return alert("يرجى اختيار ملف");
    
    const mat: CourseMaterial = {
      id: generateUUID(),
      title: newMaterial.title,
      description: newMaterial.description,
      fileUrl: newMaterial.fileUrl,
      fileType: 'PDF',
      createdAt: new Date().toISOString()
    };
    
    setMaterials([mat, ...materials]);
    setIsUploadModalOpen(false);
    setNewMaterial({ title: '', description: '', fileUrl: '' });
  };

  const deleteMaterial = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      setMaterials(materials.filter((m: CourseMaterial) => m.id !== id));
    }
  };

  // If Teacher wants to see Admin View (Students Management)
  if (view === 'ADMIN') {
    return (
      <div className="relative">
        <div className="fixed bottom-4 left-4 z-50">
          <button onClick={() => setView('CLASSROOM')} className="bg-green-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-green-700 font-bold">
            <BookOpen size={18} /> ⚽ العودة للكلاس روم
          </button>
        </div>
        <AdminDashboard user={user} students={students} setStudents={setStudents} leads={leads} setLeads={setLeads} onLogout={onLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b border-green-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-white text-green-600 p-2 rounded-lg"><BookOpen size={20} /></div>
            <span className="font-bold text-white">⚽ منصة المحتوى (Classroom)</span>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setView('ADMIN')} className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30 backdrop-blur-sm">
              <Users size={16} /> إدارة الطلاب
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <span className="text-sm text-white">{user.username}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm">
                <LogOut size={18} />
                <span className="hidden md:inline">خروج</span>
            </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">محتوى الكورس</h1>
            <p className="text-gray-500 mt-1">إدارة المحاضرات والملفات</p>
          </div>
          <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all">
            <Plus size={20} /> <span>⚽ رفع محتوى جديد</span>
          </button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 ? (
             <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-400">لا يوجد محتوى حالياً</h3>
                <p className="text-gray-400 mt-1">ابدأ برفع المحاضرات والمواد التعليمية</p>
             </div>
          ) : materials.map((item: CourseMaterial) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <button onClick={() => deleteMaterial(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                <span>•</span>
                <span>PDF Document</span>
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
              <input type="text" required placeholder="عنوان المحاضرة" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} className="w-full p-3 border rounded-xl" />
              <textarea placeholder="وصف المحتوى" value={newMaterial.description} onChange={e => setNewMaterial({...newMaterial, description: e.target.value})} className="w-full p-3 border rounded-xl h-24" />
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input type="file" accept="application/pdf,image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                {uploading ? <Loader2 className="animate-spin mx-auto text-indigo-600" /> : <Upload className="mx-auto text-gray-400 mb-2" />}
                <p className="text-sm text-gray-500">{newMaterial.fileUrl ? "تم اختيار الملف ✅" : "اضغط لاختيار ملف PDF"}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl text-gray-600">إلغاء</button>
                <button type="submit" disabled={!newMaterial.fileUrl} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">نشر</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STUDENT PORTAL (UPDATED) ---
const StudentPortal = ({ user, students, setStudents, materials, onLogout }: any) => {
  const student = students.find((s: Student) => s.id === user.studentId);
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'CLASSROOM'>('FINANCE');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<CourseMaterial | null>(null);

  if (!student) return <div className="p-8 text-center">خطأ: لم يتم العثور على بيانات الطالب. <button onClick={onLogout} className="text-blue-500 underline">خروج</button></div>;

  const financials = calculateFinancials(student);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'inst1' | 'inst2' | 'inst3') => {
    if (e.target.files && e.target.files[0]) {
      setUploadingKey(key);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setTimeout(() => {
          setStudents(students.map((s: Student) => {
            if (s.id === student.id) {
              return {
                ...s,
                installments: {
                  ...s.installments,
                  [key]: { status: InstallmentStatus.PENDING, proofUrl: base64 }
                }
              };
            }
            return s;
          }));
          setUploadingKey(null);
        }, 1500);
      } catch (err) {
        alert("Error uploading file");
        setUploadingKey(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg border-b border-green-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-bold text-white text-xl">⚽ بوابة الطالب</h1>
        <button onClick={onLogout} className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm transition-colors">
          <LogOut size={18} /> <span className="hidden md:inline">خروج</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-20">
        <div className="container mx-auto px-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('FINANCE')} 
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'FINANCE' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Wallet size={18} /> المدفوعات
          </button>
          <button 
            onClick={() => setActiveTab('CLASSROOM')} 
            className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'CLASSROOM' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BookOpen size={18} /> الكلاس روم
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-6">
        
        {/* FINANCIALS TAB */}
        {activeTab === 'FINANCE' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
             <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">مرحباً، {student.name}</h2>
                <div className="flex flex-col md:flex-row gap-8 mt-6">
                  <div>
                    <p className="text-green-100 text-sm mb-1">إجمالي المدفوع</p>
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
                              {uploadingKey === key ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                              <span>{uploadingKey === key ? 'جاري الرفع...' : 'رفع إيصال الدفع'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, k)} />
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
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">المحاضرات المتاحة</h2>
            
            {materials.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-400">لا يوجد محتوى متاح حتى الآن</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((item: CourseMaterial) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <FileText size={24} />
                      </div>
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Lock size={12} />
                        محمي
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{item.description}</p>
                    <button onClick={() => setViewingMaterial(item)} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-100">
                      ⚽ مشاهدة المحتوى
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Secure Viewer Modal */}
      {viewingMaterial && (
        <SecureMaterialViewer material={viewingMaterial} onClose={() => setViewingMaterial(null)} />
      )}
    </div>
  );
};

// --- SECURE VIEWER COMPONENT (Anti-Download) ---
const SecureMaterialViewer = ({ material, onClose }: { material: CourseMaterial, onClose: () => void }) => {
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    // Convert Base64 string to a Blob URL to avoid Chrome "Not allowed to load local resource" or length limits
    const createBlobUrl = () => {
      try {
        if (!material.fileUrl) return '';

        // Handle Base64 Data URI format (e.g., "data:application/pdf;base64,.....")
        const parts = material.fileUrl.split(',');
        const base64 = parts.length > 1 ? parts[1] : parts[0];
        const mime = parts.length > 1 ? parts[0].match(/:(.*?);/)?.[1] || 'application/pdf' : 'application/pdf';
        
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: mime });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.error("Failed to create blob URL", e);
        return '';
      }
    };

    const url = createBlobUrl();
    setBlobUrl(url);

    // Cleanup when component unmounts
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [material.fileUrl]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      {/* Header */}
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

      {/* Viewer Container */}
      <div className="flex-1 w-full relative bg-gray-800 overflow-hidden flex justify-center items-center">
        {/* Anti-Download Overlay Logic: We use iframe with toolbar=0. 
            Note: Completely preventing download on web is impossible, but this stops 99% of users. */}
        {blobUrl ? (
          <iframe 
            src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
            className="w-full h-full md:w-3/4 bg-white shadow-2xl"
            style={{ border: 'none' }}
            title="Secure Viewer"
          />
        ) : (
          <div className="text-white flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <span>جاري تحميل الملف...</span>
          </div>
        )}
        
        {/* Transparent overlay to discourage drag/drop (optional, might block scrolling if full cover) */}
        {/* <div className="absolute inset-0 z-10" /> */}
      </div>

      <div className="w-full bg-gray-900 p-2 text-center text-gray-500 text-xs select-none">
        محمي ضد التحميل والطباعة © Course System
      </div>
    </div>
  );
};

// Simple Stat Card Component
const StatCard = ({ title, value, subValue, icon, bgColor, textColor }: any) => (
  <div className={`p-6 rounded-2xl shadow-sm border border-gray-100 bg-white`}>
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${bgColor}`}>{icon}</div>
      </div>
      <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${textColor}`}>{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
  </div>
);

export default App;