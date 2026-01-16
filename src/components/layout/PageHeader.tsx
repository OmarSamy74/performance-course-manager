import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: 'red' | 'blue' | 'green' | 'purple';
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'red',
  actions,
  className = '',
}) => {
  const iconColorClasses = {
    red: 'from-blue-600 to-blue-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
  };

  return (
    <div className={className}>
      <div className="bg-gradient-to-r shadow-lg border-b px-6 py-4 mb-8" style={{
        background: `linear-gradient(to right, var(--tw-gradient-stops))`,
        '--tw-gradient-from': iconColor === 'red' ? '#dc2626' : iconColor === 'blue' ? '#2563eb' : iconColor === 'green' ? '#16a34a' : '#9333ea',
        '--tw-gradient-to': iconColor === 'red' ? '#b91c1c' : iconColor === 'blue' ? '#1d4ed8' : iconColor === 'green' ? '#15803d' : '#7e22ce',
      } as React.CSSProperties}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Icon className="text-white" size={24} />
              </div>
            )}
            <div>
              <h1 className="font-bold text-white text-xl md:text-2xl">{title}</h1>
              {subtitle && (
                <p className="text-white/90 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
