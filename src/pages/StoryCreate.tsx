import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import { CareerCategory, StoryFormData } from '../types/pathfinder';
import { toastError, toastWarning, toastSuccess } from '../components/Toast';

const CAREER_CATEGORIES: CareerCategory[] = ['运营', '产品', '设计', '开发', '市场'];

export default function StoryCreate() {
  const navigate = useNavigate();
  const { createStory } = useStoryStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    category: '运营',
    attempts: '',
    failures: '',
    discoveries: '',
    tags: [],
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/stories');
    return null;
  }

  function handleInputChange(field: keyof StoryFormData, value: string | CareerCategory) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleAddTag() {
    if (!newTag.trim()) return;
    if (formData.tags.includes(newTag.trim())) {
      toastWarning('标签已存在');
      return;
    }
    if (formData.tags.length >= 5) {
      toastWarning('最多添加5个标签');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag('');
  }

  function handleRemoveTag(tag: string) {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toastWarning('请输入标题');
      return;
    }
    if (!formData.attempts.trim() || !formData.failures.trim() || !formData.discoveries.trim()) {
      toastWarning('请填写完整的三段内容');
      return;
    }

    setIsSubmitting(true);
    try {
      const story = await createStory(formData);
      toastSuccess(isDraft ? '草稿保存成功！' : '故事发布成功！');
      navigate(`/stories/${story.id}`);
    } catch (error) {
      console.error('Failed to create story:', error);
      toastError('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">分享你的故事</h1>
          <p className="text-dark-text-secondary">
            记录你在职业探索中的尝试、失败与发现，帮助更多迷茫者找到方向
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              故事标题 <span className="text-warningRed">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="用一句话概括你的故事..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue"
              maxLength={100}
            />
            <p className="mt-2 text-sm text-dark-text-tertiary text-right">
              {formData.title.length}/100
            </p>
          </div>

          {/* Category */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              职业领域 <span className="text-warningRed">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {CAREER_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleInputChange('category', category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    formData.category === category
                      ? 'bg-pathBlue text-white'
                      : 'bg-dark-bg text-dark-text-secondary hover:bg-dark-bg/80 border border-dark-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: 我试了什么 */}
          <div className="bg-gradient-to-br from-pathBlue/10 to-pathBlue/5 border border-pathBlue/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-pathBlue rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📝</span>
              </div>
              <label className="text-white font-medium">
                我试了什么 <span className="text-warningRed">*</span>
              </label>
            </div>
            <p className="text-sm text-dark-text-tertiary mb-3">
              分享你尝试过的方法、投入的时间和精力、做过的实践...
            </p>
            <textarea
              value={formData.attempts}
              onChange={(e) => handleInputChange('attempts', e.target.value)}
              placeholder="我尝试了..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue resize-none"
              rows={8}
              maxLength={2000}
            />
            <p className="mt-2 text-sm text-dark-text-tertiary text-right">
              {formData.attempts.length}/2000
            </p>
          </div>

          {/* Section 2: 我失败了什么 */}
          <div className="bg-gradient-to-br from-warmOrange/10 to-warmOrange/5 border border-warmOrange/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-warmOrange rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">❌</span>
              </div>
              <label className="text-white font-medium">
                我失败了什么 <span className="text-warningRed">*</span>
              </label>
            </div>
            <p className="text-sm text-dark-text-tertiary mb-3">
              分享你遇到的困难、失败的原因、走过的弯路...
            </p>
            <textarea
              value={formData.failures}
              onChange={(e) => handleInputChange('failures', e.target.value)}
              placeholder="我遇到了..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-warmOrange resize-none"
              rows={8}
              maxLength={2000}
            />
            <p className="mt-2 text-sm text-dark-text-tertiary text-right">
              {formData.failures.length}/2000
            </p>
          </div>

          {/* Section 3: 我发现了什么 */}
          <div className="bg-gradient-to-br from-successGreen/10 to-successGreen/5 border border-successGreen/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-successGreen rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <label className="text-white font-medium">
                我发现了什么 <span className="text-warningRed">*</span>
              </label>
            </div>
            <p className="text-sm text-dark-text-tertiary mb-3">
              分享你的收获、领悟、对未来的启发...
            </p>
            <textarea
              value={formData.discoveries}
              onChange={(e) => handleInputChange('discoveries', e.target.value)}
              placeholder="我发现..."
              className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-successGreen resize-none"
              rows={8}
              maxLength={2000}
            />
            <p className="mt-2 text-sm text-dark-text-tertiary text-right">
              {formData.discoveries.length}/2000
            </p>
          </div>

          {/* Tags */}
          <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
            <label className="block text-white font-medium mb-3">
              相关标签
              <span className="text-sm text-dark-text-tertiary font-normal ml-2">
                (最多5个)
              </span>
            </label>

            {/* Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="输入标签后按回车添加"
                className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.length >= 5}
                className="px-4 py-2 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>

            {/* Tag List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-dark-bg border border-dark-border rounded-full text-sm text-white"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-warningRed transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/stories')}
              className="px-6 py-3 bg-dark-surface hover:bg-dark-bg border border-dark-border text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setIsDraft(false)}
              className="px-6 py-3 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? '发布中...' : '发布故事'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
