import React from 'react';
import { Button } from '../ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LibraryHeaderProps {
  bookCount: number;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({ bookCount }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-12">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          My Library
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Discover, track, and enjoy your reading journey
        </p>
        {/* Stats Card */}
        <div className="inline-flex items-center gap-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-8 py-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{bookCount}</div>
              <div className="text-sm text-gray-400">Books</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-600"></div>
          <Button 
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Books
          </Button>
        </div>
      </div>
    </div>
  );
};
