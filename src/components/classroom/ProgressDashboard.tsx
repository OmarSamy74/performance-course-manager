import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, BookOpen, Target } from 'lucide-react';
import { progressApi } from '../../api/client';

interface ProgressSummary {
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  totalTimeSpent: number;
  lastActivityAt: string;
}

export const ProgressDashboard: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.getSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8 text-gray-500">لا توجد بيانات متاحة</div>;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">تقدمك في الكورس</h2>
        <div className="mt-6 flex items-center gap-8">
          <div>
            <p className="text-indigo-100 text-sm mb-1">نسبة الإكمال</p>
            <p className="text-4xl font-bold">{summary.completionPercentage}%</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">الوقت المستغرق</p>
            <p className="text-2xl font-bold">{formatTime(summary.totalTimeSpent)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">إجمالي الدروس</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">الدروس المكتملة</p>
              <p className="text-2xl font-bold text-gray-800">{summary.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Target size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">المتبقي</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.totalLessons - summary.completedLessons}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">شريط التقدم</h3>
        <div className="bg-gray-100 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${summary.completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {summary.completedLessons} من {summary.totalLessons} درس مكتمل
        </p>
      </div>
    </div>
  );
};
