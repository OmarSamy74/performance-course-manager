import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Briefcase, LogOut, Plus, Trash2, CheckCircle2, AlertCircle, Eye, XCircle, FileSpreadsheet, Search, LayoutDashboard } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { Student, PaymentPlan, InstallmentStatus, COURSE_COST } from '../../types';
import { calculateFinancials, formatCurrency, getStatusColor, getStatusLabel } from '../lib/business-utils';
import { generateUUID } from '../lib/utils';
import { StatCard } from '../components/shared/StatCard';
import { studentsApi } from '../api/client';
import * as XLSX from 'xlsx';
import { SalesPage } from './SalesPage';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [view, setView] = useState<'FINANCE' | 'CRM'>('FINANCE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [proofModalData, setProofModalData] = useState<{studentId: string, installmentKey: string, url: string} | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<PaymentPlan>(PaymentPlan.HALF);

  // Derived Stats
  const stats = useMemo(() => {
    let totalExpected = state.students.length * COURSE_COST;
    let totalCollected = 0;
    let totalRemaining = 0;
    let fullPaidCount = 0;
    let pendingReviews = 0;

    state.students.forEach((s: Student) => {
      const { paid, remaining, isFullyPaid } = calculateFinancials(s);
      totalCollected += paid;
      totalRemaining += remaining;
      if (isFullyPaid) fullPaidCount++;

      if (s.installments.inst1.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst2.status === InstallmentStatus.PENDING) pendingReviews++;
      if (s.installments.inst3.status === InstallmentStatus.PENDING) pendingReviews++;
    });

    return { totalExpected, totalCollected, totalRemaining, fullPaidCount, pendingReviews };
  }, [state.students]);

  // Handlers
  const handleAddStudent = async (e: React.FormEvent) => {
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

    try {
      await studentsApi.create(newStudent);
      actions.updateStudents([newStudent, ...state.students]);
      setNewName('');
      setNewPhone('');
      setNewPlan(PaymentPlan.HALF);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create student:', error);
      alert('فشل في إضافة الطالب. يرجى المحاولة مرة أخرى.');
    }
  };

  const updateInstallmentStatus = async (studentId: string, key: 'inst1' | 'inst2' | 'inst3', status: InstallmentStatus) => {
    try {
      const student = state.students.find((s: Student) => s.id === studentId);
      if (!student) return;

      const updatedStudent = {
        ...student,
        installments: {
          ...student.installments,
          [key]: { ...student.installments[key], status }
        }
      };

      await studentsApi.update(studentId, updatedStudent);
      actions.updateStudents(state.students.map((s: Student) => 
        s.id === studentId ? updatedStudent : s
      ));
      
      if (proofModalData) setProofModalData(null);
    } catch (error) {
      console.error('Failed to update installment:', error);
      alert('فشل في تحديث حالة القسط. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      try {
        await studentsApi.delete(id);
        actions.updateStudents(state.students.filter((s: Student) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete student:', error);
        alert('فشل في حذف الطالب. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const exportToExcel = () => {
    const data = state.students.map((s: Student) => {
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

  const filteredStudents = state.students.filter((s: Student) => 
    s.name.includes(searchTerm) || s.phone.includes(searchTerm)
  );

  // If Admin wants to see CRM, render SalesPage
  if (view === 'CRM') {
    return (
      <div className="relative">
        <div className="fixed bottom-4 left-4 z-50">
          <button 
            onClick={() => setView('FINANCE')} 
            className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700"
          >
            <LayoutDashboard size={16} /> ⚽ العودة للمالية
          </button>
        </div>
        <SalesPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">نظرة عامة</h1>
            <p className="text-gray-500 mt-1">إدارة الطلاب والمدفوعات</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportToExcel} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-red-200 transition-all"
            >
              <FileSpreadsheet size={20} /> <span>إكسيل</span>
            </button>
            <button 
              onClick={() => setView('CRM')} 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-purple-200 transition-all"
            >
              <Briefcase size={20} /> <span>إدارة المبيعات (CRM)</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-red-200 transition-all"
            >
              <Plus size={20} /> <span>⚽ طالب جديد</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="إجمالي الدخل المتوقع" 
            value={formatCurrency(stats.totalExpected)} 
            icon={<Wallet className="text-blue-600" />} 
            bgColor="bg-blue-50" 
            textColor="text-blue-900" 
          />
          <StatCard 
            title="تم تحصيله فعلياً" 
            value={formatCurrency(stats.totalCollected)} 
            icon={<CheckCircle2 className="text-green-600" />} 
            bgColor="bg-green-50" 
            textColor="text-green-900" 
          />
          <StatCard 
            title="إجمالي المتأخرات" 
            value={formatCurrency(stats.totalRemaining)} 
            icon={<AlertCircle className="text-red-600" />} 
            bgColor="bg-red-50" 
            textColor="text-red-900" 
          />
          <StatCard 
            title="طلبات المراجعة" 
            value={stats.pendingReviews.toString()} 
            subValue="سكرين شوت" 
            icon={<Eye className="text-orange-600" />} 
            bgColor="bg-orange-50" 
            textColor="text-orange-900" 
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-xl font-bold text-gray-800">سجل الطلاب</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="بحث..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-4 pr-10 py-2 border rounded-lg w-64 bg-gray-50 focus:ring-2 focus:ring-red-500 focus:outline-none" 
              />
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-400">
                      لا يوجد طلاب حالياً
                    </td>
                  </tr>
                ) : filteredStudents.map((student: Student) => {
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
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-green-600 font-bold">{formatCurrency(financials.paid)}</td>
                      <td className="p-4 font-bold text-red-500">{formatCurrency(financials.remaining)}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
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
              <button 
                onClick={() => setProofModalData(null)} 
                className="w-full mt-3 text-gray-500 text-sm hover:underline"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      
        {/* Add Student Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="إضافة طالب جديد"
          icon={<Plus className="text-white" size={24} />}
          iconColor="red"
          size="md"
        >
          <form onSubmit={handleAddStudent} className="space-y-5">
            <FormField label="الاسم الثلاثي" required>
              <Input 
                type="text" 
                required 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="أدخل الاسم الثلاثي" 
              />
            </FormField>
            <FormField label="رقم الهاتف">
              <Input 
                type="text" 
                value={newPhone} 
                onChange={(e) => setNewPhone(e.target.value)} 
                placeholder="01xxxxxxxxx" 
              />
            </FormField>
            <FormField label="خطة الدفع">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setNewPlan(PaymentPlan.HALF)} 
                  className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                    newPlan === PaymentPlan.HALF 
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  💰 50% مقدم
                </button>
                <button 
                  type="button" 
                  onClick={() => setNewPlan(PaymentPlan.FULL)} 
                  className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                    newPlan === PaymentPlan.FULL 
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  💳 كامل
                </button>
              </div>
            </FormField>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
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
                حفظ الطالب
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};
