import React from 'react';

import { BookOpen, Clock, CheckCircle, Heart } from 'lucide-react';

interface LibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  bookCounts: Record<string, number>;
}

const TAB_CONFIG = [
  { 
    key: 'all', 
    label: 'All Books', 
    icon: BookOpen,
    color: 'from-slate-500 to-slate-600'
  },
  { 
    key: 'want_to_read', 
    label: 'Want to Read', 
    icon: Heart,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    key: 'currently_reading', 
    label: 'Reading', 
    icon: Clock,
    color: 'from-orange-500 to-orange-600'
  },
  { 
    key: 'finished', 
    label: 'Finished', 
    icon: CheckCircle,
    color: 'from-green-500 to-green-600'
  },
];

export const LibraryTabs: React.FC<LibraryTabsProps> = ({
  activeTab,
  onTabChange,
  bookCounts,
}) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-700/50">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = bookCounts[tab.key] || 0;
          
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                relative flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${isActive 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105` 
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              
              {count > 0 && (
                <span className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 text-xs rounded-full
                  ${isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-600 text-gray-300'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
