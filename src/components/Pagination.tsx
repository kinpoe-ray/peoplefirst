import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jumpToPage, setJumpToPage] = useState('');

  // Sync URL with current page
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== currentPage && !isNaN(pageFromUrl) && pageFromUrl >= 1 && pageFromUrl <= totalPages) {
      onPageChange(pageFromUrl);
    }
  }, [searchParams, totalPages]);

  // Update URL when page changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (currentPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', currentPage.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [currentPage, setSearchParams]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(jumpToPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPage('');
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5; // Show max 5 page numbers

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= Math.min(showPages, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > showPages) {
          pages.push('ellipsis');
        }
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = Math.max(totalPages - showPages + 2, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Page info */}
      <div className="text-sm text-dark-text-secondary">
        第 <span className="font-medium text-white">{currentPage}</span> 页，共{' '}
        <span className="font-medium text-white">{totalPages}</span> 页
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === 1 || isLoading
              ? 'bg-dark-surface text-dark-text-tertiary cursor-not-allowed opacity-50'
              : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:border-ember/50 hover:text-ember'
          }`}
          aria-label="上一页"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">上一页</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-2 text-dark-text-tertiary"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-ember text-white shadow-lg shadow-ember/30'
                    : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:border-ember/50 hover:text-ember'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={`第 ${page} 页`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            currentPage === totalPages || isLoading
              ? 'bg-dark-surface text-dark-text-tertiary cursor-not-allowed opacity-50'
              : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:border-ember/50 hover:text-ember'
          }`}
          aria-label="下一页"
        >
          <span className="hidden sm:inline">下一页</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Jump to page */}
      <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
        <span className="text-sm text-dark-text-secondary">跳转</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpToPage}
          onChange={(e) => setJumpToPage(e.target.value)}
          placeholder={currentPage.toString()}
          className="w-16 px-2 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-sm text-white placeholder-dark-text-tertiary focus:outline-none focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !jumpToPage}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isLoading || !jumpToPage
              ? 'bg-dark-surface text-dark-text-tertiary cursor-not-allowed opacity-50'
              : 'bg-ember/10 text-ember border border-ember/30 hover:bg-ember/20'
          }`}
        >
          前往
        </button>
      </form>
    </div>
  );
}
