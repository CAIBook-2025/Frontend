'use client';

interface TabNavigationProps {
  tabs: Array<{
    label: string;
    count?: number;
    active?: boolean;
  }>;
  onTabChange: (index: number) => void;
}

export const TabNavigation = ({ tabs, onTabChange }: TabNavigationProps) => {
  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            tab.active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
          {typeof tab.count === 'number' && ` (${tab.count})`}
        </button>
      ))}
    </div>
  );
};
