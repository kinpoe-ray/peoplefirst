import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Plus, BookOpen } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { SkeletonStoryList } from '../components/Skeleton';
import Pagination from '../components/Pagination';

export default function StoryWall() {
  const { stories, pagination, isLoading, fetchStories, setCurrentPage } = useStoryStore();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const validPage = !isNaN(page) && page >= 1 ? page : 1;
    fetchStories(validPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-medium mb-4">迷茫者故事墙</h1>
            <p className="text-dark-text-secondary">分享你的尝试、失败和发现</p>
          </div>

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
            <p className="text-dark-text-secondary mb-6">成为第一个分享故事的人吧!</p>
            {user && (
              <Link
                to="/stories/create"
                className="px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                发布故事
              </Link>
            )}
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
              onPageChange={setCurrentPage}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
