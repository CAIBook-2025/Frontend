import type React from 'react';
import { Calendar } from 'lucide-react';

export const StatCard = ({
  icon,
  value,
  label,
  footer,
  variant = 'blue',
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  footer: string;
  variant?: 'blue' | 'yellow' | 'red';
}) => {
  const colorVariants = {
    blue: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    },
    yellow: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
    },
    red: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
    },
  };

  const colors = colorVariants[variant];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`${colors.iconBg} ${colors.iconText} rounded-full p-3 w-12 h-12 flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-gray-500 text-sm">{label}</div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
          <div className="text-gray-400 text-xs mt-2">{footer}</div>
        </div>
      </div>
    </div>
  );
};
