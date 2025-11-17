import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Plus, BookOpen, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SEO from '../components/SEO';
import { useStories } from '../hooks/useStories';
import { useAuthStore } from '../stores/authStore';
import { SkeletonStoryList } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { pageSEO } from '../config/seo';

export default function StoryWall() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Initialize from URL params
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const validPage = !isNaN(page) && page >= 1 ? page : 1;
    setCurrentPage(validPage);
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 1 when search changes
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
        setSearchParams({ page: '1' });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch, setSearchParams]);

  // Use React Query for data fetching with caching
  const {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStories(currentPage, 12, debouncedSearch || undefined);

  const stories = paginatedData?.data || [];
  const pagination = {
    currentPage: paginatedData?.page || 1,
    totalPages: paginatedData?.totalPages || 1,
    total: paginatedData?.total || 0,
    pageSize: paginatedData?.pageSize || 12,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
    setSearchParams({ page: '1' });
  };

  return (
    <Layout>
      <SEO
        title={pageSEO.stories.title}
        description={pageSEO.stories.description}
        url="/stories"
        keywords={['迷茫者故事', '真实故事', '职业经历', '人生分享', '探索故事', '成长故事']}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-medium mb-4">迷茫者故事墙</h1>
            <p className="text-dark-text-secondary">分享你的尝试、失败和发现</p>
          </div>

          <div className="flex items-center gap-4">
            {isFetching && !isLoading && (
              <RefreshCw className="w-5 h-5 text-pathBlue animate-spin" />
            )}
            {user && (
              <Link
                to="/stories/create"
                className="flex items-center gap-2 px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                发布故事
              </Link>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-warningRed/10 border border-warningRed/30 rounded-lg p-4 mb-6">
            <p className="text-warningRed text-sm">
              {error.message || '加载故事失败'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-pathBlue hover:text-pathBlue-dark"
            >
              点击重试
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索故事标题或内容..."
            isLoading={isFetching}
            className="max-w-xl"
          />
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <SkeletonStoryList count={12} />
          </div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-dark-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">暂无故事</h3>
            <p className="text-dark-text-secondary mb-6">
              {debouncedSearch
                ? `未找到包含「${debouncedSearch}」的故事`
                : '成为第一个分享故事的人吧!'}
            </p>
            {debouncedSearch ? (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg transition-colors"
              >
                清除搜索
              </button>
            ) : user ? (
              <Link
                to="/stories/create"
                className="px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                发布故事
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  to={`/stories/${story.id}`}
                  className="group block break-inside-avoid bg-dark-surface hover:bg-dark-surface/80 border border-dark-border hover:border-pathBlue/50 rounded-xl p-6 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {story.author?.avatar_url ? (
                      <img
                        src={story.author.avatar_url}
                        alt={story.author.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-pathBlue/20 flex items-center justify-center">
                        <span className="text-pathBlue text-sm font-medium">
                          {story.author?.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {story.author?.username}
                      </p>
                      <p className="text-xs text-dark-text-tertiary">
                        {new Date(story.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="px-3 py-1 bg-pathBlue/20 text-pathBlue text-xs rounded-full">
                      {story.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-pathBlue transition-colors duration-200 line-clamp-2">
                    {story.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {story.comment_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              isLoading={isFetching}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
