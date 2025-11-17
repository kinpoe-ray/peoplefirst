import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Send,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useContentStore } from '../stores/contentStore';
import { useAuthStore } from '../stores/authStore';
import { getComments, addComment } from '../api/contents';
import { toggleFavorite, checkIfFavorited } from '../api/favorites';
import { Comment } from '../types/pathfinder';
import { toastError, toastWarning, toastSuccess } from '../components/Toast';
import { SkeletonDetail } from '../components/Skeleton';
import { createLogger } from '../lib/logger';

const logger = createLogger('ContentDetail');

// 情绪到渐变色的映射
const moodGradients = {
  positive: 'from-successGreen/20 to-successGreen/5',
  neutral: 'from-pathBlue/20 to-pathBlue/5',
  negative: 'from-warningRed/20 to-warningRed/5',
};

const moodBorderColors = {
  positive: 'border-l-successGreen',
  neutral: 'border-l-pathBlue',
  negative: 'border-l-warningRed',
};

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentContent, isLoading, fetchContentById, incrementViewCount } = useContentStore();
  const { user } = useAuthStore();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getComments(id);
      setComments(data);
    } catch (err) {
      logger.error('Failed to load comments', err);
    }
  }, [id]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!id || !user) return;
    try {
      const favorited = await checkIfFavorited(id, user.id);
      setIsFavorited(favorited);
    } catch (err) {
      logger.error('Failed to check favorite status', err);
    }
  }, [id, user]);

  const loadContent = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);
      await fetchContentById(id);
      await incrementViewCount(id);
      await loadComments();
      await checkFavoriteStatus();
    } catch (err) {
      logger.error('Failed to load content', err);
      setError('加载内容失败，请重试');
      toastError('加载内容失败');
    }
  }, [id, fetchContentById, incrementViewCount, loadComments, checkFavoriteStatus]);

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id, loadContent]);

  useEffect(() => {
    if (currentContent) {
      setFavoriteCount(currentContent.favorite_count || 0);
    }
  }, [currentContent]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toastWarning('请先登录');
      return;
    }
    if (!id) return;

    // Optimistic update
    const previousFavorited = isFavorited;
    const previousCount = favoriteCount;
    setIsFavorited(!previousFavorited);
    setFavoriteCount(prev => !previousFavorited ? prev + 1 : Math.max(0, prev - 1));

    try {
      const newFavorited = await toggleFavorite(id);
      // Update with actual values
      setIsFavorited(newFavorited);
      if (currentContent) {
        setFavoriteCount(currentContent.favorite_count);
      }
    } catch (error) {
      // Rollback on error
      logger.error('Failed to toggle favorite', error);
      setIsFavorited(previousFavorited);
      setFavoriteCount(previousCount);
      toastError('操作失败，请重试');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toastWarning('请先登录');
      return;
    }
    if (!commentText.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await addComment(id, commentText);
      setCommentText('');
      await loadComments();
      toastSuccess('评论发送成功！');
    } catch (error) {
      logger.error('Failed to submit comment', error);
      toastError('评论发送失败，请重试');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <SkeletonDetail />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-warningRed/10 border-2 border-warningRed/30 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-warningRed" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">加载失败</h3>
            <p className="text-dark-text-secondary mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={loadContent}
                className="flex items-center gap-2 px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </button>
              <button
                onClick={() => navigate('/contents')}
                className="px-6 py-3 bg-dark-surface hover:bg-dark-surface/80 border border-dark-border text-dark-text-secondary hover:text-white rounded-lg font-medium transition-all"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentContent) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-dark-surface border-2 border-dark-border rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-dark-text-tertiary" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">内容不存在</h3>
            <p className="text-dark-text-secondary mb-6">该内容可能已被删除或不存在</p>
            <button
              onClick={() => navigate('/contents')}
              className="px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all"
            >
              返回内容列表
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-dark-text-tertiary mb-8">
          <Link to="/contents" className="hover:text-pathBlue transition-colors">
            内容库
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark-text-secondary">{currentContent.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark-text-secondary">{currentContent.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-pathBlue/20 text-pathBlue text-sm font-medium rounded-full">
              {currentContent.category}
            </span>
            {currentContent.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/5 text-dark-text-tertiary text-sm rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-semibold mb-4 text-white">
            {currentContent.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-dark-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {currentContent.view_count} 浏览
            </span>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1.5 transition-colors ${
                isFavorited ? 'text-warmOrange' : 'hover:text-warmOrange'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              {favoriteCount} 收藏
            </button>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              {currentContent.comment_count} 评论
            </span>
          </div>
        </div>

        {/* Truth Sentence - Highlighted */}
        <div className="bg-gradient-to-r from-warmOrange/20 to-warmOrange/5 border border-warmOrange/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-1 h-full bg-warmOrange rounded-full" />
            <div>
              <h2 className="text-sm font-medium text-warmOrange mb-2">一句话真相</h2>
              <p className="text-lg text-white leading-relaxed">{currentContent.truth_sentence}</p>
            </div>
          </div>
        </div>

        {/* Daily Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">真实的一天</h2>
          <div className="space-y-3">
            {currentContent.daily_timeline.map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${moodGradients[item.mood]} border-l-4 ${moodBorderColors[item.mood]} rounded-lg p-4 transition-all hover:translate-x-1`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Clock className="w-4 h-4 text-dark-text-tertiary" />
                    <span className="text-sm font-medium text-white">{item.time}</span>
                  </div>
                  <p className="text-dark-text-secondary leading-relaxed">{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Highlight vs Collapse Moments */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">高光 vs 崩溃时刻</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Highlight Moments */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-successGreen" />
                <h3 className="text-lg font-semibold text-successGreen">高光时刻</h3>
              </div>
              <div className="space-y-4">
                {currentContent.highlight_moments.map((moment, index) => (
                  <div key={index} className="border-l-2 border-successGreen/30 pl-4">
                    <h4 className="text-white font-medium mb-1">{moment.title}</h4>
                    <p className="text-sm text-dark-text-secondary leading-relaxed">
                      {moment.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapse Moments */}
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-warningRed" />
                <h3 className="text-lg font-semibold text-warningRed">崩溃时刻</h3>
              </div>
              <div className="space-y-4">
                {currentContent.collapse_moments.map((moment, index) => (
                  <div key={index} className="border-l-2 border-warningRed/30 pl-4">
                    <h4 className="text-white font-medium mb-1">{moment.title}</h4>
                    <p className="text-sm text-dark-text-secondary leading-relaxed">
                      {moment.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Skill Radar */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-white">能力需求雷达</h2>
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(currentContent.skill_radar).map(([key, value]) => {
                const skillLabels: Record<string, string> = {
                  creativity: '创造力',
                  logic: '逻辑思维',
                  communication: '沟通能力',
                  stress_resistance: '抗压能力',
                  learning_ability: '学习能力',
                };

                return (
                  <div key={key} className="text-center">
                    <div className="mb-3">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pathBlue/20 to-pathBlue/5 border-4 border-pathBlue/30 flex items-center justify-center">
                        <span className="text-2xl font-bold text-pathBlue">{value}</span>
                      </div>
                    </div>
                    <p className="text-sm text-dark-text-secondary">{skillLabels[key]}</p>
                    <div className="mt-2 w-full bg-dark-border rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-pathBlue to-pathBlue-light h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-white">
            评论 ({comments.length})
          </h2>

          {/* Comment Input */}
          {user ? (
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full bg-transparent text-white placeholder-dark-text-tertiary resize-none focus:outline-none mb-3"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || isSubmittingComment}
                  className="flex items-center gap-2 px-4 py-2 bg-pathBlue hover:bg-pathBlue-dark disabled:bg-dark-border disabled:text-dark-text-tertiary text-white rounded-lg transition-colors"
                >
                  {isSubmittingComment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  发送
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6 mb-6 text-center">
              <p className="text-dark-text-secondary mb-3">登录后可以发表评论</p>
              <button className="text-pathBlue hover:underline">立即登录</button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-dark-text-tertiary">
                暂无评论，来抢沙发吧！
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-dark-surface border border-dark-border rounded-xl p-4 hover:border-pathBlue/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={comment.author?.avatar_url || '/default-avatar.png'}
                      alt={comment.author?.username}
                      className="w-10 h-10 rounded-full bg-dark-border"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">
                          {comment.author?.username || '匿名用户'}
                        </span>
                        <span className="text-xs text-dark-text-tertiary">
                          {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-dark-text-secondary leading-relaxed mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                        <button className="hover:text-pathBlue transition-colors">回复</button>
                        <button className="flex items-center gap-1 hover:text-warmOrange transition-colors">
                          <Heart className="w-3 h-3" />
                          {comment.like_count}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
