import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Heart, MessageCircle, FileText, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SEO from '../components/SEO';
import { useContents } from '../hooks/useContents';
import { CareerCategory } from '../types/pathfinder';
import { SkeletonList } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { pageSEO } from '../config/seo';

const categories: CareerCategory[] = ['全部', '运营', '产品', '设计', '开发', '市场'];

export default function ContentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory>('全部');
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
  } = useContents(
    selectedCategory === '全部' ? undefined : selectedCategory,
    currentPage,
    12,
    debouncedSearch || undefined
  );

  const contents = paginatedData?.data || [];
  const pagination = {
    currentPage: paginatedData?.page || 1,
    totalPages: paginatedData?.totalPages || 1,
    total: paginatedData?.total || 0,
    pageSize: paginatedData?.pageSize || 12,
  };

  const handleCategoryChange = (category: CareerCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchParams({ page: '1' });
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
        title={pageSEO.contents.title}
        description={pageSEO.contents.description}
        url="/contents"
        keywords={['职业去魅化', '职业真相', '工作日常', '职业探索', '运营', '产品', '设计', '开发', '市场']}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-medium mb-4">职业去魅化内容库</h1>
            <p className="text-dark-text-secondary">真实的一天、高光与崩溃,看清职业的真相</p>
          </div>
          {isFetching && !isLoading && (
            <RefreshCw className="w-5 h-5 text-pathBlue animate-spin" />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-warningRed/10 border border-warningRed/30 rounded-lg p-4 mb-6">
            <p className="text-warningRed text-sm">
              {error.message || '加载内容失败'}
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
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索内容标题或描述..."
            isLoading={isFetching}
            className="max-w-xl"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-pathBlue text-white'
                  : 'bg-white/5 text-dark-text-secondary hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonList count={12} />
          </div>
        ) : contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-24 h-24 bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-dark-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">暂无内容</h3>
            <p className="text-dark-text-secondary mb-6">
              {debouncedSearch
                ? `未找到包含「${debouncedSearch}」的内容`
                : selectedCategory === '全部'
                ? '还没有任何职业内容，敬请期待'
                : `暂无「${selectedCategory}」类别的内容`}
            </p>
            {debouncedSearch ? (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg transition-colors"
              >
                清除搜索
              </button>
            ) : selectedCategory !== '全部' ? (
              <button
                onClick={() => handleCategoryChange('全部')}
                className="px-6 py-2 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors"
              >
                查看所有内容
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Link
                  key={content.id}
                  to={`/contents/${content.id}`}
                  className="group bg-dark-surface hover:bg-dark-surface/80 border border-dark-border hover:border-pathBlue/50 rounded-xl p-6 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-pathBlue/20 text-pathBlue text-xs rounded-full">
                      {content.category}
                    </span>
                    {content.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/5 text-dark-text-tertiary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-pathBlue transition-colors duration-200">
                    {content.title}
                  </h3>

                  <p className="text-warmOrange text-sm mb-4 line-clamp-2">{content.truth_sentence}</p>

                  <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {content.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {content.favorite_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {content.comment_count}
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
