import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, ArrowLeft, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import DOMPurify from 'dompurify';
import Layout from '../components/layout/Layout';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { getComments, addComment } from '../api/stories';
import { Comment } from '../types/pathfinder';
import { toastError, toastSuccess } from '../components/Toast';
import { SkeletonDetail } from '../components/Skeleton';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStory, isLoading, fetchStoryById, toggleLike, toggleFavorite } = useStoryStore();
  const { user } = useAuthStore();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStoryById(id);
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadComments() {
    if (id) {
      try {
        const data = await getComments(id);
        setComments(data);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      await addComment(id, newComment);
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toastError('评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleLike() {
    if (!id) return;
    try {
      await toggleLike(id);
      // Store handles refetch for accurate count
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toastError('点赞失败，请重试');
    }
  }

  async function handleToggleFavorite() {
    if (!id) return;
    try {
      await toggleFavorite(id);
      // Store handles refetch for accurate count
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toastError('收藏失败，请重试');
    }
  }

  if (isLoading || !currentStory) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/stories')}
            className="flex items-center gap-2 text-dark-text-secondary hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回故事墙
          </button>
          <SkeletonDetail />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/stories')}
          className="flex items-center gap-2 text-dark-text-secondary hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回故事墙
        </button>

        {/* Header */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {currentStory.author?.avatar_url ? (
                  <img
                    src={currentStory.author.avatar_url}
                    alt={currentStory.author.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-pathBlue/20 flex items-center justify-center">
                    <span className="text-pathBlue font-medium">
                      {currentStory.author?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{currentStory.author?.username}</p>
                  <p className="text-sm text-dark-text-tertiary">
                    {new Date(currentStory.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <span className="inline-block px-3 py-1 bg-pathBlue/20 text-pathBlue text-sm rounded-full mb-4">
                {currentStory.category}
              </span>

              <h1 className="text-3xl font-semibold text-white mb-4">
                {currentStory.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {currentStory.tags.map((tag) => (
                  <span key={tag} className="text-sm text-dark-text-tertiary">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {user && (
            <div className="flex items-center gap-4 pt-6 border-t border-dark-border">
              <button
                onClick={handleToggleLike}
                className="flex items-center gap-2 px-4 py-2 bg-dark-bg hover:bg-dark-surface border border-dark-border rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm">{currentStory.like_count}</span>
              </button>

              <button
                onClick={handleToggleFavorite}
                className="flex items-center gap-2 px-4 py-2 bg-dark-bg hover:bg-dark-surface border border-dark-border rounded-lg transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                收藏
              </button>

              <div className="flex items-center gap-2 text-dark-text-tertiary">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{currentStory.comment_count} 条评论</span>
              </div>
            </div>
          )}
        </div>

        {/* Three Section Layout */}
        <div className="space-y-6">
          {/* Section 1: 我试了什么 - Blue Theme */}
          <div className="bg-gradient-to-br from-pathBlue/10 to-pathBlue/5 border border-pathBlue/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pathBlue rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📝</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">我试了什么</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentStory.attempts.replace(/\n/g, '<br/>')) }}
              />
            </div>
          </div>

          {/* Section 2: 我失败了什么 - Orange Theme */}
          <div className="bg-gradient-to-br from-warmOrange/10 to-warmOrange/5 border border-warmOrange/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warmOrange rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">❌</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">我失败了什么</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentStory.failures.replace(/\n/g, '<br/>')) }}
              />
            </div>
          </div>

          {/* Section 3: 我发现了什么 - Green Theme */}
          <div className="bg-gradient-to-br from-successGreen/10 to-successGreen/5 border border-successGreen/30 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-successGreen rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">我发现了什么</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <div
                className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentStory.discoveries.replace(/\n/g, '<br/>')) }}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <button
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-dark-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-pathBlue" />
              <h2 className="text-xl font-semibold text-white">
                评论 ({comments.length})
              </h2>
            </div>
            {isCommentsExpanded ? (
              <ChevronUp className="w-5 h-5 text-dark-text-tertiary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-dark-text-tertiary" />
            )}
          </button>

          {isCommentsExpanded && (
            <div className="px-8 pb-8">
              {/* Add Comment */}
              {user && (
                <div className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的想法..."
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="px-6 py-2 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '发送中...' : '发送评论'}
                    </button>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-center py-8 text-dark-text-tertiary">
                  暂无评论，来抢沙发吧！
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-dark-bg rounded-lg">
                      {comment.author?.avatar_url ? (
                        <img
                          src={comment.author.avatar_url}
                          alt={comment.author.username}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-pathBlue/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-pathBlue text-xs">
                            {comment.author?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-white">
                            {comment.author?.username}
                          </span>
                          <span className="text-xs text-dark-text-tertiary">
                            {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm text-dark-text-secondary">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
