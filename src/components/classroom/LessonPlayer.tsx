import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { Lesson } from '../../../types';
import { progressApi } from '../../api/client';

interface LessonPlayerProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete?: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onBack, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Load progress
    progressApi.get(lesson.id).then(({ progress: prog }) => {
      if (prog) {
        setProgress(prog.progress || 0);
        setCompleted(prog.completed || false);
        setTimeSpent(prog.timeSpent || 0);
      }
    });

    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = prev + 1;
        // Update progress every 10 seconds
        if (newTime % 10 === 0) {
          progressApi.update(lesson.id, { 
            progress: Math.min(progress + 1, 100),
            timeSpent: 1
          });
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lesson.id]);

  const handleComplete = async () => {
    await progressApi.update(lesson.id, { completed: true, progress: 100 });
    setCompleted(true);
    setProgress(100);
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-20 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {lesson.duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{lesson.duration} دقيقة</span>
              </div>
            )}
            {completed && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 size={14} />
                <span>مكتمل</span>
              </div>
            )}
          </div>
        </div>
        {!completed && (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            إكمال الدرس
          </button>
        )}
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {lesson.videoUrl && (
          <div className="mb-6 bg-black rounded-lg overflow-hidden">
            <iframe
              src={lesson.videoUrl}
              className="w-full aspect-video"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        {lesson.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700">{lesson.description}</p>
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />

        {progress > 0 && (
          <div className="mt-8 bg-gray-100 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
