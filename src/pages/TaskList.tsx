import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, Users, Star, Zap, TrendingUp, Target, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import SEO from '../components/SEO';
import { useTasks } from '../hooks/useTasks';
import { TaskDifficulty } from '../types/pathfinder';
import { SkeletonTaskList } from '../components/Skeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { pageSEO } from '../config/seo';

const difficulties: Array<{ label: string; value: TaskDifficulty | 'all'; color: string; icon: string }> = [
  { label: '全部任务', value: 'all', color: 'pathBlue', icon: 'all' },
  { label: '简单 30min', value: 'easy', color: 'successGreen', icon: 'zap' },
  { label: '中等 45min', value: 'medium', color: 'warmOrange', icon: 'trending' },
  { label: '困难 60min', value: 'hard', color: 'warningRed', icon: 'target' },
];

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty | 'all'>('all');
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
  } = useTasks(
    selectedDifficulty === 'all' ? undefined : selectedDifficulty,
    currentPage,
    12,
    debouncedSearch || undefined
  );

  const tasks = paginatedData?.data || [];
  const pagination = {
    currentPage: paginatedData?.page || 1,
    totalPages: paginatedData?.totalPages || 1,
    total: paginatedData?.total || 0,
    pageSize: paginatedData?.pageSize || 12,
  };

  const handleDifficultyChange = (difficulty: TaskDifficulty | 'all') => {
    setSelectedDifficulty(difficulty);
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

  const getDifficultyStyle = (difficulty: TaskDifficulty) => {
    const styles = {
      easy: {
        text: 'text-successGreen',
        bg: 'bg-successGreen/10',
        border: 'border-successGreen/30',
        label: '简单'
      },
      medium: {
        text: 'text-warmOrange',
        bg: 'bg-warmOrange/10',
        border: 'border-warmOrange/30',
        label: '中等'
      },
      hard: {
        text: 'text-warningRed',
        bg: 'bg-warningRed/10',
        border: 'border-warningRed/30',
        label: '困难'
      }
    };
    return styles[difficulty];
  };

  return (
    <Layout>
      <SEO
        title={pageSEO.tasks.title}
        description={pageSEO.tasks.description}
        url="/tasks"
        keywords={['技能测试', '职业体验', 'AI评估', '实操任务', '发现天赋', '职业技能']}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pathBlue/10 border border-pathBlue/30 rounded-full mb-6">
            <Zap className="w-4 h-4 text-pathBlue" />
            <span className="text-sm font-medium text-pathBlue">技能试验场</span>
            {isFetching && !isLoading && (
              <RefreshCw className="w-4 h-4 text-pathBlue animate-spin ml-2" />
            )}
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-dark-text-secondary bg-clip-text text-transparent">
            30-60分钟，体验一个职业的真实工作
          </h1>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            通过实操任务发现自己的天赋，获得AI智能评估反馈
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-warningRed/10 border border-warningRed/30 rounded-lg p-4 mb-6">
            <p className="text-warningRed text-sm">
              {error.message || '加载任务失败'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 text-sm text-pathBlue hover:text-pathBlue-dark"
            >
              点击重试
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pathBlue mb-1">{pagination.total}</div>
            <div className="text-sm text-dark-text-secondary">可用任务</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-successGreen mb-1">
              {tasks.reduce((sum, t) => sum + t.attempt_count, 0)}
            </div>
            <div className="text-sm text-dark-text-secondary">累计尝试</div>
          </div>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-warmOrange mb-1">
              {tasks.length > 0 ? (tasks.reduce((sum, t) => sum + t.avg_rating, 0) / tasks.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-sm text-dark-text-secondary">平均评分</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="搜索任务标题或描述..."
            isLoading={isFetching}
            className="max-w-xl"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.value;
            return (
              <button
                key={diff.value}
                onClick={() => handleDifficultyChange(diff.value)}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-pathBlue text-white shadow-lg shadow-pathBlue/30 scale-105'
                    : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:border-pathBlue/50 hover:bg-dark-surface/80'
                }`}
              >
                {diff.icon === 'zap' && <Zap className="w-4 h-4" />}
                {diff.icon === 'trending' && <TrendingUp className="w-4 h-4" />}
                {diff.icon === 'target' && <Target className="w-4 h-4" />}
                {diff.label}
              </button>
            );
          })}
        </div>

        {/* Task Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonTaskList count={12} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-12 h-12 text-dark-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">暂无任务</h3>
            <p className="text-dark-text-secondary mb-6">
              {debouncedSearch
                ? `未找到包含「${debouncedSearch}」的任务`
                : '精彩内容即将上线，敬请期待'}
            </p>
            {debouncedSearch && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-ember hover:bg-ember-dark text-white rounded-lg transition-colors"
              >
                清除搜索
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => {
                const diffStyle = getDifficultyStyle(task.difficulty);

                return (
                  <div
                    key={task.id}
                    className="group bg-dark-surface border border-dark-border hover:border-pathBlue/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-pathBlue/10 hover:-translate-y-1"
                  >
                    {/* Header with difficulty badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${diffStyle.bg} ${diffStyle.text} border ${diffStyle.border}`}>
                        <Zap className="w-3.5 h-3.5" />
                        {diffStyle.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-dark-text-tertiary">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{task.duration_minutes}分钟</span>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-pathBlue transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-sm text-dark-text-secondary mb-4 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-dark-text-tertiary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer with stats and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs text-dark-text-tertiary">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{task.attempt_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-dark-text-tertiary">
                          <Star className="w-4 h-4 fill-warmOrange text-warmOrange" />
                          <span className="font-medium">{task.avg_rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <Link
                        to={`/tasks/${task.id}/execute`}
                        className="px-5 py-2.5 bg-pathBlue hover:bg-pathBlue-dark text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-pathBlue/30 flex items-center gap-2 group"
                      >
                        开始尝试
                        <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
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
