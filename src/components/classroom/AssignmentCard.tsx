import React from 'react';
import { FileText, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Assignment, SubmissionStatus } from '../../../types';

interface AssignmentCardProps {
  assignment: Assignment;
  submission?: {
    status: SubmissionStatus;
    score?: number;
    submittedAt?: string;
    isLate: boolean;
  };
  onView: () => void;
  onSubmit?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ 
  assignment, 
  submission, 
  onView, 
  onSubmit 
}) => {
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate < new Date();
  const isSubmitted = submission?.status === SubmissionStatus.SUBMITTED || submission?.status === SubmissionStatus.GRADED;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">{assignment.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
          </div>
        </div>
        {isSubmitted && submission?.status === SubmissionStatus.GRADED && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
            {submission.score}/{assignment.maxScore}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>الموعد النهائي: {dueDate.toLocaleDateString('ar-EG')}</span>
        </div>
        {isPastDue && !isSubmitted && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle size={14} />
            <span>متأخر</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isSubmitted ? (
          <>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              submission.status === SubmissionStatus.GRADED 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {submission.status === SubmissionStatus.GRADED ? 'تم التقييم' : 'قيد المراجعة'}
            </div>
            <button
              onClick={onView}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold"
            >
              عرض التفاصيل
            </button>
          </>
        ) : (
          <button
            onClick={onSubmit || onView}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center justify-center gap-2"
          >
            {isPastDue ? 'تسليم متأخر' : 'تسليم الواجب'}
          </button>
        )}
      </div>
    </div>
  );
};
