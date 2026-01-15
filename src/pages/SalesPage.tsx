import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Users, Target, Eye, CheckCircle2, Plus, Search, Phone, MessageSquare, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, Student, PaymentPlan, InstallmentStatus } from '../../types';
import { getLeadStatusColor, getLeadStatusLabel, fileToBase64 } from '../../utils';
import { generateUUID } from '../utils/uuid';
import { StatCard } from '../components/shared/StatCard';
import { leadsApi, studentsApi } from '../api/client';

export const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', phone: '', source: '', notes: '' });

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

  const filteredLeads = state.leads.filter((l: Lead) => 
    l.name.includes(searchTerm) || l.phone.includes(searchTerm)
  );

  const handleLogout = async () => {
    await actions.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
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
