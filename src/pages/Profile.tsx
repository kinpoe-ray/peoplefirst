import { useState, useEffect } from 'react';
import { User, Edit2, Save, X, Target, Heart, TrendingUp, Calendar, BookOpen, MessageSquare, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../stores/authStore';
import { getUserAttempts } from '../api/tasks';
import { getFavoriteContents, getFavoriteStories } from '../api/favorites';
import { UserTaskAttempt } from '../types/pathfinder';
import { supabase } from '../lib/supabase';
import { toastSuccess, toastError } from '../components/Toast';
import { Skeleton, SkeletonProfile } from '../components/Skeleton';
import { createLogger } from '../lib/logger';

const logger = createLogger('Profile');

type TabType = 'overview' | 'edit' | 'tasks' | 'favorites';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [taskAttempts, setTaskAttempts] = useState<UserTaskAttempt[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [favoriteContents, setFavoriteContents] = useState<any[]>([]);
  const [favoriteStories, setFavoriteStories] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    current_career: user?.current_career || '',
    career_confusion_level: user?.career_confusion_level || 5,
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || '',
        bio: user.bio || '',
        current_career: user.current_career || '',
        career_confusion_level: user.career_confusion_level || 5,
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      loadTaskAttempts();
    } else if (activeTab === 'favorites') {
      loadFavorites();
    }
  }, [activeTab]);

  const loadTaskAttempts = async () => {
    setIsLoadingTasks(true);
    try {
      const attempts = await getUserAttempts();
      setTaskAttempts(attempts);
    } catch (error) {
      logger.error('Failed to load task attempts', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const loadFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const [contents, stories] = await Promise.all([
        getFavoriteContents(),
        getFavoriteStories(),
      ]);
      setFavoriteContents(contents);
      setFavoriteStories(stories);
    } catch (error) {
      logger.error('Failed to load favorites', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateUser({
        username: editForm.username,
        bio: editForm.bio,
        current_career: editForm.current_career,
        career_confusion_level: editForm.career_confusion_level,
      });

      setIsEditing(false);
      toastSuccess('个人资料已更新！');
    } catch (error: any) {
      logger.error('Failed to update profile', error);
      toastError('更新失败：' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      username: user?.username || '',
      bio: user?.bio || '',
      current_career: user?.current_career || '',
      career_confusion_level: user?.career_confusion_level || 5,
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview' as TabType, label: '概览', icon: User },
    { id: 'edit' as TabType, label: '编辑资料', icon: Edit2 },
    { id: 'tasks' as TabType, label: '任务记录', icon: Target },
    { id: 'favorites' as TabType, label: '我的收藏', icon: Heart },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-successGreen bg-successGreen/10 border-successGreen/30';
      case 'in_progress':
        return 'text-pathBlue bg-pathBlue/10 border-pathBlue/30';
      case 'failed':
        return 'text-warningRed bg-warningRed/10 border-warningRed/30';
      default:
        return 'text-dark-text-tertiary bg-white/5 border-dark-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'failed':
        return '已失败';
      default:
        return '未知';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-dark-text-secondary">请先登录查看个人中心</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pathBlue to-warmOrange flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                <p className="text-dark-text-secondary">{user.email}</p>
                {user.current_career && (
                  <p className="text-sm text-dark-text-tertiary mt-1">当前职业：{user.current_career}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pathBlue">{taskAttempts.length}</div>
                <div className="text-xs text-dark-text-tertiary">任务尝试</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-successGreen">
                  {taskAttempts.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-dark-text-tertiary">已完成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warmOrange">
                  {user.career_confusion_level || '-'}
                </div>
                <div className="text-xs text-dark-text-tertiary">迷茫指数</div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
              <p className="text-dark-text-secondary">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-border mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-pathBlue text-white'
                      : 'border-transparent text-dark-text-tertiary hover:text-dark-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-pathBlue" />
                  <h3 className="text-lg font-semibold text-white">最近活动</h3>
                </div>
                <div className="space-y-3">
                  {taskAttempts.slice(0, 3).map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm text-white">{attempt.task?.title}</p>
                        <p className="text-xs text-dark-text-tertiary mt-1">
                          {new Date(attempt.started_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(attempt.status)}`}>
                        {getStatusText(attempt.status)}
                      </span>
                    </div>
                  ))}
                  {taskAttempts.length === 0 && (
                    <p className="text-sm text-dark-text-tertiary text-center py-8">还没有任务记录</p>
                  )}
                </div>
              </div>

              {/* Confusion Level */}
              <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-warmOrange" />
                  <h3 className="text-lg font-semibold text-white">迷茫指数</h3>
                </div>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-warmOrange mb-4">
                    {user.career_confusion_level || 0}
                  </div>
                  <div className="w-full bg-dark-border rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-successGreen via-warmOrange to-warningRed h-2 rounded-full transition-all"
                      style={{ width: `${(user.career_confusion_level || 0) * 10}%` }}
                    />
                  </div>
                  <p className="text-sm text-dark-text-tertiary">0 = 非常清晰，10 = 极度迷茫</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === 'edit' && (
            <div className="max-w-2xl">
              <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      用户名
                    </label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                      placeholder="输入用户名"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors resize-none"
                      rows={4}
                      placeholder="介绍一下自己..."
                    />
                  </div>

                  {/* Current Career */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      当前职业
                    </label>
                    <input
                      type="text"
                      value={editForm.current_career}
                      onChange={(e) => setEditForm({ ...editForm, current_career: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue transition-colors"
                      placeholder="例如：产品经理、设计师等"
                    />
                  </div>

                  {/* Confusion Level */}
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                      职业迷茫指数：{editForm.career_confusion_level}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={editForm.career_confusion_level}
                      onChange={(e) => setEditForm({ ...editForm, career_confusion_level: parseInt(e.target.value) })}
                      className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-dark-text-tertiary mt-2">
                      <span>非常清晰</span>
                      <span>极度迷茫</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg font-medium transition-all"
                    >
                      <Save className="w-4 h-4" />
                      保存修改
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-6 py-3 bg-dark-bg hover:bg-white/5 text-dark-text-secondary rounded-lg font-medium transition-all"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              {isLoadingTasks ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ) : taskAttempts.length > 0 ? (
                <div className="grid gap-4">
                  {taskAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-pathBlue/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{attempt.task?.title}</h3>
                          <p className="text-sm text-dark-text-secondary line-clamp-2">
                            {attempt.task?.description}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(attempt.status)}`}>
                          {getStatusText(attempt.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-dark-text-tertiary">
                        <span>开始时间：{new Date(attempt.started_at).toLocaleDateString('zh-CN')}</span>
                        {attempt.completed_at && (
                          <span>完成时间：{new Date(attempt.completed_at).toLocaleDateString('zh-CN')}</span>
                        )}
                        <span>当前步骤：{attempt.current_step}</span>
                        {attempt.rating && <span>评分：{attempt.rating}/5</span>}
                      </div>

                      {attempt.ai_feedback && (
                        <div className="mt-4 p-4 bg-dark-bg rounded-lg border-l-4 border-pathBlue">
                          <p className="text-sm text-dark-text-secondary">{attempt.ai_feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Target className="w-16 h-16 text-dark-text-tertiary mx-auto mb-4" />
                  <p className="text-dark-text-secondary mb-2">还没有任务记录</p>
                  <p className="text-sm text-dark-text-tertiary">去试验场开始你的第一个任务吧！</p>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {isLoadingFavorites ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Skeleton className="h-48 w-full rounded-xl" />
                      <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              ) : favoriteContents.length > 0 || favoriteStories.length > 0 ? (
                <div className="space-y-8">
                  {/* Favorite Contents */}
                  {favoriteContents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-pathBlue" />
                        <h3 className="text-lg font-semibold text-white">职业内容 ({favoriteContents.length})</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {favoriteContents.map((content) => (
                          <Link
                            key={content.id}
                            to={`/contents/${content.id}`}
                            className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-pathBlue/30 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="px-3 py-1 bg-pathBlue/20 text-pathBlue text-xs font-medium rounded-full">
                                {content.category}
                              </span>
                              <Heart className="w-5 h-5 text-warmOrange fill-current" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-pathBlue transition-colors">
                              {content.title}
                            </h4>
                            <p className="text-sm text-dark-text-secondary line-clamp-2 mb-3">
                              {content.truth_sentence}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-dark-text-tertiary">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {content.view_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {content.favorite_count}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Favorite Stories */}
                  {favoriteStories.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-warmOrange" />
                        <h3 className="text-lg font-semibold text-white">用户故事 ({favoriteStories.length})</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {favoriteStories.map((story) => (
                          <Link
                            key={story.id}
                            to={`/stories/${story.id}`}
                            className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-warmOrange/30 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <span className="px-3 py-1 bg-warmOrange/20 text-warmOrange text-xs font-medium rounded-full">
                                {story.category}
                              </span>
                              <Heart className="w-5 h-5 text-warmOrange fill-current" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-warmOrange transition-colors">
                              {story.title}
                            </h4>
                            <p className="text-sm text-dark-text-secondary line-clamp-3">
                              {story.attempts}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Heart className="w-16 h-16 text-dark-text-tertiary mx-auto mb-4" />
                  <p className="text-dark-text-secondary mb-2">还没有收藏</p>
                  <p className="text-sm text-dark-text-tertiary mb-6">浏览职业内容和故事，收藏感兴趣的内容</p>
                  <div className="flex gap-3 justify-center">
                    <Link
                      to="/contents"
                      className="px-4 py-2 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg text-sm font-medium transition-all"
                    >
                      浏览职业内容
                    </Link>
                    <Link
                      to="/stories"
                      className="px-4 py-2 bg-dark-bg hover:bg-white/5 text-dark-text-secondary rounded-lg text-sm font-medium transition-all"
                    >
                      浏览故事墙
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
