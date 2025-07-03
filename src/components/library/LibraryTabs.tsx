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
    <nav
      className="w-full flex justify-center mb-8"
      aria-label="Library filter tabs"
      role="tablist"
    >
      <div
        className="
          w-full
          flex
          overflow-x-auto
          scrollbar-none
          snap-x snap-mandatory
          gap-2
          bg-slate-800/50 backdrop-blur-sm rounded-2xl p-1 border border-slate-700/50
          sm:flex-wrap sm:justify-center sm:gap-3
          lg:inline-flex lg:overflow-visible lg:gap-2
        "
      >
        {TAB_CONFIG.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = bookCounts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label + (count > 0 ? ` (${count})` : '')}
              tabIndex={0}
              onClick={() => onTabChange(tab.key)}
              className={
                `snap-center min-w-[44px] min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2
                rounded-xl transition-all duration-200 font-medium outline-none
                ${isActive
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                  : 'text-gray-300 hover:text-white hover:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-blue-400'
                }
                ` +
                (i === 0 ? ' ml-1' : '')
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {/* Smart truncation for small screens, full label for sm+, icon-only for xs */}
              <span className="hidden xs:inline sm:hidden truncate max-w-[60px] text-sm">
                {tab.label.split(' ')[0]}
              </span>
              <span className="hidden sm:inline text-sm">
                {tab.label}
              </span>
              {/* Always show badge, never overflow */}
              {count > 0 && (
                <span
                  className={`ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-slate-600 text-gray-300'}
                  `}
                  aria-label={`${count} books in ${tab.label}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
