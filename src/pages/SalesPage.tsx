import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Users, Target, Eye, CheckCircle2, Plus, Search, Phone, MessageSquare, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, Student, PaymentPlan, InstallmentStatus } from '../../types';
import { getLeadStatusColor, getLeadStatusLabel, fileToBase64 } from '../lib/business-utils';
import { generateUUID } from '../lib/utils';
import { StatCard } from '../components/shared/StatCard';
import { leadsApi, studentsApi } from '../api/client';
import * as XLSX from 'xlsx';

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', source: '', notes: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const total = state.leads.length;
    const newLeads = state.leads.filter((l: Lead) => l.status === LeadStatus.NEW).length;
    const interested = state.leads.filter((l: Lead) => l.status === LeadStatus.INTERESTED).length;
    const converted = state.leads.filter((l: Lead) => l.status === LeadStatus.CONVERTED).length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, newLeads, interested, converted, conversionRate };
  }, [state.leads]);

  const handleAddLead = async (e: React.FormEvent) => {
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
    
    try {
      await leadsApi.create(lead);
      actions.updateLeads([lead, ...state.leads]);
      setIsAddModalOpen(false);
      setNewLead({ name: '', phone: '', source: '', notes: '' });
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('فشل في إضافة العميل. يرجى المحاولة مرة أخرى.');
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    try {
      await leadsApi.update(id, { status });
      actions.updateLeads(state.leads.map((l: Lead) => l.id === id ? { ...l, status } : l));
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const deleteLead = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await leadsApi.delete(id);
        actions.updateLeads(state.leads.filter((l: Lead) => l.id !== id));
      } catch (error) {
        console.error('Failed to delete lead:', error);
        alert('فشل في حذف العميل. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus === LeadStatus.CONVERTED && lead.status !== LeadStatus.CONVERTED) {
      const isAlreadyStudent = state.students.some((s: Student) => s.phone === lead.phone);
      if (isAlreadyStudent) {
        alert('هذا العميل مسجل بالفعل كطالب.');
        await updateLeadStatus(lead.id, newStatus);
        return;
      }

      const confirmConvert = confirm(`هل تريد تحويل "${lead.name}" إلى قائمة الطلاب الآن؟`);
      if (confirmConvert) {
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
        
        try {
          await studentsApi.create(newStudent);
          actions.updateStudents([newStudent, ...state.students]);
          await updateLeadStatus(lead.id, newStatus);
          alert('تم إضافة الطالب إلى النظام المالي بنجاح ✅');
        } catch (error) {
          console.error('Failed to create student:', error);
          alert('فشل في إضافة الطالب. يرجى المحاولة مرة أخرى.');
        }
      }
    } else {
      await updateLeadStatus(lead.id, newStatus);
    }
  };

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return state.leads;
    const term = searchTerm.toLowerCase();
    return state.leads.filter((l: Lead) => 
      l.name.toLowerCase().includes(term) || l.phone.includes(term)
    );
  }, [state.leads, searchTerm]);

  const handleLogout = async () => {
    await actions.logout();
    navigate('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert('يرجى رفع ملف Excel بصيغة .xlsx أو .xls');
      return;
    }

    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (data.length < 2) {
        alert('الملف فارغ أو لا يحتوي على بيانات');
        setIsUploading(false);
        return;
      }

      // Get headers (first row)
      const headers = data[0].map((h: any) => String(h).toLowerCase().trim());
      
      // Find column indices
      const nameIndex = headers.findIndex((h: string) => h.includes('اسم') || h.includes('name') || h === 'الاسم');
      const phoneIndex = headers.findIndex((h: string) => h.includes('هاتف') || h.includes('phone') || h.includes('رقم') || h === 'الهاتف');
      const sourceIndex = headers.findIndex((h: string) => h.includes('مصدر') || h.includes('source') || h === 'المصدر');
      const notesIndex = headers.findIndex((h: string) => h.includes('ملاحظ') || h.includes('note') || h.includes('تعليق') || h === 'ملاحظات');

      if (nameIndex === -1 || phoneIndex === -1) {
        alert('الملف يجب أن يحتوي على أعمدة: الاسم ورقم الهاتف على الأقل');
        setIsUploading(false);
        return;
      }

      // Parse rows (skip header)
      const leadsToCreate: Lead[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const name = row[nameIndex] ? String(row[nameIndex]).trim() : '';
        const phone = row[phoneIndex] ? String(row[phoneIndex]).trim().replace(/\s+/g, '') : '';

        if (!name || !phone) {
          errorCount++;
          continue;
        }

        // Check if lead already exists
        const exists = state.leads.some((l: Lead) => l.phone === phone);
        if (exists) {
          errorCount++;
          continue;
        }

        const lead: Lead = {
          id: generateUUID(),
          name,
          phone,
          source: sourceIndex !== -1 && row[sourceIndex] ? String(row[sourceIndex]).trim() : 'Direct',
          notes: notesIndex !== -1 && row[notesIndex] ? String(row[notesIndex]).trim() : '',
          status: LeadStatus.NEW,
          createdAt: new Date().toISOString()
        };

        leadsToCreate.push(lead);
      }

      if (leadsToCreate.length === 0) {
        alert('لم يتم العثور على عملاء صالحين للاستيراد');
        setIsUploading(false);
        return;
      }

      // Create all leads
      const createdLeads: Lead[] = [];
      for (const lead of leadsToCreate) {
        try {
          await leadsApi.create(lead);
          createdLeads.push(lead);
          successCount++;
        } catch (error) {
          console.error('Failed to create lead:', error);
          errorCount++;
        }
      }

      // Update state
      if (createdLeads.length > 0) {
        actions.updateLeads([...createdLeads, ...state.leads]);
        alert(`تم استيراد ${successCount} عميل بنجاح${errorCount > 0 ? `\nتم تخطي ${errorCount} عميل (مكرر أو بيانات غير صالحة)` : ''}`);
      } else {
        alert('فشل في استيراد العملاء. يرجى المحاولة مرة أخرى.');
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      alert('حدث خطأ أثناء قراءة الملف. يرجى التأكد من صحة تنسيق الملف.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="إجمالي العملاء" value={stats.total} icon={<Users className="text-blue-600" />} bgColor="bg-blue-50" textColor="text-blue-900" />
          <StatCard title="عملاء جدد" value={stats.newLeads} icon={<Target className="text-purple-600" />} bgColor="bg-purple-50" textColor="text-purple-900" />
          <StatCard title="مهتمين" value={stats.interested} icon={<Eye className="text-orange-600" />} bgColor="bg-orange-50" textColor="text-orange-900" />
          <StatCard title="نسبة التحويل" value={`${stats.conversionRate}%`} subValue={`${stats.converted} طالب`} icon={<CheckCircle2 className="text-green-600" />} bgColor="bg-green-50" textColor="text-green-900" />
        </div>

        {/* Excel Import Button - Prominent */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-xl">
                <FileSpreadsheet className="text-white" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">استيراد العملاء من Excel</h3>
                <p className="text-sm text-gray-600">قم برفع ملف Excel يحتوي على بيانات العملاء (الاسم، الهاتف، المصدر، الملاحظات)</p>
              </div>
            </div>
            <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer font-bold text-base min-w-[180px] justify-center border-2 border-blue-500 hover:scale-105 transform">
              <FileSpreadsheet size={22} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{isUploading ? '⏳ جاري الاستيراد...' : '📊 رفع ملف Excel'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">قائمة العملاء المحتملين</h2>
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative">
              <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-10 py-2 border rounded-xl w-64 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer font-bold text-base min-w-[160px] justify-center border-2 border-blue-500">
              <FileSpreadsheet size={22} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{isUploading ? 'جاري الاستيراد...' : '📊 استيراد Excel'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-green-200 transition-all font-bold text-base">
              <Plus size={20} /> <span>إضافة عميل</span>
            </button>
          </div>
        </div>

        {/* CRM Table */}
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
                {state.loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="text-gray-500">جاري التحميل...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-400">
                      {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء حالياً'}
                    </td>
                  </tr>
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
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة عميل جديد"
        icon={<Plus className="text-white" size={24} />}
        iconColor="purple"
        size="md"
      >
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-800 text-sm mb-3">
                <FileSpreadsheet size={18} />
                <span className="font-bold">تنسيق ملف Excel:</span>
              </div>
              <div className="text-xs text-blue-700 space-y-1.5 font-medium">
                <p>• العمود الأول: <strong>الاسم</strong> (مطلوب)</p>
                <p>• العمود الثاني: <strong>رقم الهاتف</strong> (مطلوب)</p>
                <p>• العمود الثالث: <strong>المصدر</strong> (اختياري)</p>
                <p>• العمود الرابع: <strong>ملاحظات</strong> (اختياري)</p>
              </div>
            </div>
        <form onSubmit={handleAddLead} className="space-y-4">
          <FormField label="اسم العميل" required>
            <Input 
              type="text" 
              required 
              placeholder="أدخل اسم العميل" 
              value={newLead.name} 
              onChange={e => setNewLead({...newLead, name: e.target.value})} 
            />
          </FormField>
          <FormField label="رقم الهاتف" required>
            <Input 
              type="text" 
              required 
              placeholder="01xxxxxxxxx" 
              value={newLead.phone} 
              onChange={e => setNewLead({...newLead, phone: e.target.value})} 
            />
          </FormField>
          <FormField label="المصدر">
            <Input 
              type="text" 
              placeholder="مثلاً: فيسبوك، إحالة، إعلان" 
              value={newLead.source} 
              onChange={e => setNewLead({...newLead, source: e.target.value})} 
            />
          </FormField>
          <FormField label="ملاحظات">
            <Textarea 
              placeholder="أدخل أي ملاحظات إضافية" 
              value={newLead.notes} 
              onChange={e => setNewLead({...newLead, notes: e.target.value})} 
              className="h-24"
            />
          </FormField>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)} 
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
              حفظ العميل
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
