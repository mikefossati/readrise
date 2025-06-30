import React from 'react';
import { Button } from '../ui/button';
import { BookOpen, Plus, Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LibraryEmptyStateProps {
  isFiltered?: boolean;
  searchTerm?: string;
  activeTab?: string;
}

export const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({
  isFiltered = false,
  searchTerm,
  activeTab,
}) => {
  const navigate = useNavigate();

  if (isFiltered) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {searchTerm 
            ? `No books match "${searchTerm}" in your ${activeTab === 'all' ? 'library' : activeTab?.replace('_', ' ')} collection.`
            : `No books in your ${activeTab?.replace('_', ' ')} collection yet.`
          }
        </p>
        <Button 
          onClick={() => navigate('/search')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Books
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-purple-500/20">
          <BookOpen className="w-16 h-16 text-purple-400" />
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Start Your Reading Journey</h2>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Your library is empty, but that's just the beginning! Add books to track your reading progress, 
        set goals, and unlock achievements.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate('/search')}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Book
        </Button>
        <Button 
          variant="outline"
          size="lg"
          className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8"
          onClick={() => window.open('https://www.goodreads.com/list/show/1.Best_Books_Ever', '_blank')}
        >
          Browse Recommendations
        </Button>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Track Progress</h3>
          <p className="text-gray-400 text-sm">Monitor your reading sessions and see your growth over time</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Discover Books</h3>
          <p className="text-gray-400 text-sm">Find your next great read with our book search and recommendations</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Achieve Goals</h3>
          <p className="text-gray-400 text-sm">Set reading goals and unlock achievements as you progress</p>
        </div>
      </div>
    </div>
  );
};
