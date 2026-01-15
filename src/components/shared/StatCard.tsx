import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, bgColor, textColor }) => (
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
