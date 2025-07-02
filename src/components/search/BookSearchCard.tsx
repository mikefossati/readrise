import React, { useState, useEffect } from 'react';
import { getCache } from '../../utils/cache';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, CheckCircle, Star, Calendar, FileText, Loader2 } from 'lucide-react';

/**
 * BookSearchCard displays a book search result with cover, title, authors, and metadata.
 * Uses cached cover images for performance.
 */
interface BookSearchCardProps {
  book: {
    id: string;
    title: string;
    authors: string[];
    description: string;
    cover: string | null;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
  };
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => Promise<void>;
}

export const BookSearchCard: React.FC<BookSearchCardProps> = ({
  book,
  isAdded,
  isAdding,
  onAdd,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async () => {
    try {
      setAddError(null);
      await onAdd();
    } catch (err) {
      setAddError('Failed to add book');
    }
  };

  const truncatedDescription = book.description.length > 150 
    ? book.description.substring(0, 150) + '...'
    : book.description;

  const publishYear = book.publishedDate ? new Date(book.publishedDate).getFullYear() : null;

  // Use cached cover if available
  const [cachedCover, setCachedCover] = useState<string | undefined>(undefined);
  useEffect(() => {
    const cover = getCache<string>(`google_book_cover_${book.id}`) || undefined;
    setCachedCover(cover);
  }, [book.id]);

  return (
    <Card className="bg-gradient-to-br from-slate-800/70 to-purple-900/60 border-slate-700/50 flex flex-col h-full hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200">
      <CardHeader className="p-4 pb-2">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-16 h-24 rounded overflow-hidden bg-slate-700 flex items-center justify-center">
            {(cachedCover || book.cover) ? (
              <img 
                src={cachedCover || book.cover || undefined} 
                alt={`Cover of ${book.title}`} 
                className="object-cover w-full h-full"
                loading="lazy"
              />
            ) : (
              <span className="text-gray-500 text-xs text-center px-1">No Cover</span>
            )}
            
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold line-clamp-2 text-white mb-1">
              {book.title}
            </CardTitle>
            <div className="text-sm text-purple-300 font-medium line-clamp-1 mb-2">
              {book.authors.join(', ')}
            </div>
            
            {/* Book metadata */}
            <div className="flex flex-wrap gap-2 text-xs">
              {publishYear && (
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  <Calendar className="w-3 h-3 mr-1" />
                  {publishYear}
                </Badge>
              )}
              {book.pageCount && (
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  <FileText className="w-3 h-3 mr-1" />
                  {book.pageCount}p
                </Badge>
              )}
              {book.averageRating && (
                <Badge variant="outline" className="text-yellow-400 border-yellow-600">
                  <Star className="w-3 h-3 mr-1" />
                  {book.averageRating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.categories.slice(0, 2).map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30"
              >
                {category}
              </Badge>
            ))}
            {book.categories.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-slate-600/20 text-slate-400">
                +{book.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {book.description && (
          <div className="flex-1 mb-4">
            <div className="text-xs text-gray-300 leading-relaxed">
              {showFullDescription ? book.description : truncatedDescription}
            </div>
            {book.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs text-purple-400 hover:text-purple-300 mt-1 transition-colors"
              >
                {showFullDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Add button */}
        <div className="mt-auto">
          {addError && (
            <div className="text-xs text-red-400 mb-2">{addError}</div>
          )}
          
          <Button
            onClick={handleAdd}
            disabled={isAdded || isAdding}
            className={`w-full transition-all duration-200 ${
              isAdded 
                ? 'bg-green-600/20 text-green-300 border-green-600/30 cursor-default' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            variant={isAdded ? 'outline' : 'default'}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : isAdded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Added to Library
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add to Library
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
