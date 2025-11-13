import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Play,
  Loader2,
  Star,
  Send
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useTaskStore } from '../stores/taskStore';
import { submitTaskForAIFeedback } from '../api/tasks';
import { toastError, toastWarning, toastSuccess } from '../components/Toast';

export default function TaskExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTask, currentAttempt, fetchTaskById, startTask, updateAttemptStep, completeTask } = useTaskStore();

  const [isStarting, setIsStarting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTaskById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentAttempt) {
      setCurrentStep(currentAttempt.current_step);
      if (currentAttempt.ai_feedback) {
        setAiFeedback({
          ai_feedback: currentAttempt.ai_feedback,
          skill_scores: currentAttempt.skill_scores
        });
      }
    }
  }, [currentAttempt]);

  const handleStart = async () => {
    if (!id) return;
    setIsStarting(true);
    try {
      await startTask(id);
      setCurrentStep(1);
    } catch (error) {
      console.error('启动任务失败:', error);
      toastError('启动任务失败，请重试');
    } finally {
      setIsStarting(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (currentAttempt) {
        updateAttemptStep(currentAttempt.id, newStep);
      }
    }
  };

  const handleNextStep = async () => {
    if (!currentTask || !currentAttempt) return;

    const totalSteps = currentTask.steps.length;
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await updateAttemptStep(currentAttempt.id, newStep);
    }
  };

  const handleSubmitStep4 = async () => {
    if (!currentAttempt) return;

    setIsSubmitting(true);
    try {
      // 保存用户提交内容
      await updateAttemptStep(currentAttempt.id, currentStep, formData);

      // 调用AI反馈接口
      const feedback = await submitTaskForAIFeedback(currentAttempt.id, formData);
      setAiFeedback(feedback);

      // 进入Step 5
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await updateAttemptStep(currentAttempt.id, newStep);
    } catch (error) {
      console.error('提交失败:', error);
      toastError('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!currentAttempt || userRating === 0) {
      toastWarning('请先给出你的评分');
      return;
    }

    setIsCompleting(true);
    try {
      await completeTask(currentAttempt.id, userRating);
      toastSuccess('任务完成！感谢你的参与');
      navigate('/tasks');
    } catch (error) {
      console.error('完成任务失败:', error);
      toastError('操作失败，请重试');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!currentTask) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-pathBlue" />
        </div>
      </Layout>
    );
  }

  const totalSteps = currentTask.steps.length;
  const progress = (currentStep / totalSteps) * 100;

  // 如果还没开始任务，显示启动界面
  if (!currentAttempt) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-4">{currentTask.title}</h1>
            <p className="text-dark-text-secondary mb-6">{currentTask.description}</p>

            <div className="flex items-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-pathBlue" />
                <span>{currentTask.duration_minutes} 分钟</span>
              </div>
              <div className="px-3 py-1 bg-dark-border rounded-full">
                {currentTask.difficulty === 'easy' ? '简单' :
                 currentTask.difficulty === 'medium' ? '中等' : '困难'}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">你将体验到：</h3>
              <div className="space-y-3">
                {currentTask.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pathBlue/20 text-pathBlue flex items-center justify-center text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-dark-text-secondary">{step.content.substring(0, 100)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full bg-pathBlue hover:bg-pathBlue-dark text-white font-medium py-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  启动中...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  开始尝试
                </>
              )}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStepData = currentTask.steps[currentStep - 1];

  return (
    <Layout showFooter={false}>
      <div className="h-screen flex flex-col pt-16">
        {/* 顶部进度条 */}
        <div className="bg-dark-surface border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{currentTask.title}</h2>
              <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                <Clock className="w-4 h-4" />
                {currentTask.duration_minutes} 分钟
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-dark-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pathBlue h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-dark-text-secondary whitespace-nowrap">
                {currentStep} / {totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto px-6 py-8 flex gap-8">
            {/* 左侧步骤导航 */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-8 space-y-2">
                {currentTask.steps.map((step, index) => {
                  const stepNum = index + 1;
                  const isActive = stepNum === currentStep;
                  const isCompleted = stepNum < currentStep;

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (stepNum <= currentStep && currentAttempt) {
                          setCurrentStep(stepNum);
                          updateAttemptStep(currentAttempt.id, stepNum);
                        }
                      }}
                      disabled={stepNum > currentStep}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isActive
                          ? 'bg-pathBlue/20 border-2 border-pathBlue'
                          : isCompleted
                          ? 'bg-dark-surface border border-successGreen/30 hover:border-successGreen/50'
                          : 'bg-dark-surface border border-dark-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? 'bg-pathBlue text-white'
                            : isCompleted
                            ? 'bg-successGreen text-white'
                            : 'bg-dark-border text-dark-text-tertiary'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            isActive ? 'text-white' : 'text-dark-text-secondary'
                          }`}>
                            {step.title}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 右侧内容区 */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-dark-surface border border-dark-border rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">{currentStepData.title}</h2>

                {/* Step 1-3: 文字说明 + 媒体内容 */}
                {currentStep <= 3 && (
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
                        {currentStepData.content}
                      </div>
                    </div>

                    {currentStepData.media_url && (
                      <div className="bg-dark-border rounded-lg overflow-hidden">
                        {currentStepData.type === 'video' ? (
                          <div className="aspect-video bg-dark-bg flex items-center justify-center">
                            <Play className="w-16 h-16 text-dark-text-tertiary" />
                            <p className="ml-4 text-dark-text-tertiary">视频播放占位</p>
                          </div>
                        ) : (
                          <div className="aspect-video bg-dark-bg flex items-center justify-center">
                            <img
                              src={currentStepData.media_url}
                              alt={currentStepData.title}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML =
                                  '<div class="text-dark-text-tertiary">图片加载失败</div>';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: 表单提交 */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap mb-6">
                        {currentStepData.content}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">你的思考和方案</label>
                        <textarea
                          value={formData.answer || ''}
                          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                          placeholder="请详细描述你的思考过程和解决方案..."
                          className="w-full h-48 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">遇到的挑战</label>
                        <textarea
                          value={formData.challenges || ''}
                          onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                          placeholder="在完成任务过程中，你遇到了哪些挑战？"
                          className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">你的感受</label>
                        <textarea
                          value={formData.feelings || ''}
                          onChange={(e) => setFormData({ ...formData, feelings: e.target.value })}
                          placeholder="完成这个任务后，你有什么感受或收获？"
                          className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-text-tertiary focus:outline-none focus:border-pathBlue resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSubmitStep4}
                        disabled={isSubmitting || !formData.answer}
                        className="w-full bg-pathBlue hover:bg-pathBlue-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            AI评估中...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            提交并获取AI反馈
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: AI反馈展示 */}
                {currentStep === 5 && aiFeedback && (
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap mb-6">
                        {currentStepData.content}
                      </div>
                    </div>

                    {/* AI反馈 */}
                    <div className="bg-pathBlue/10 border border-pathBlue/30 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-pathBlue">AI 评估反馈</span>
                      </h3>
                      <p className="text-dark-text-secondary leading-relaxed">
                        {aiFeedback.ai_feedback}
                      </p>
                    </div>

                    {/* 能力雷达图评分 */}
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-6">能力评分</h3>
                      <div className="space-y-4">
                        {Object.entries(aiFeedback.skill_scores || {}).map(([key, value]: [string, any]) => {
                          const labels: Record<string, string> = {
                            creativity: '创造力',
                            logic: '逻辑思维',
                            communication: '沟通表达',
                            stress_resistance: '抗压能力',
                            learning_ability: '学习能力'
                          };

                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{labels[key] || key}</span>
                                <span className="text-pathBlue font-semibold">{value}/10</span>
                              </div>
                              <div className="bg-dark-border rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-pathBlue h-full transition-all duration-500"
                                  style={{ width: `${(value / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 用户评分 */}
                    <div className="bg-dark-bg border border-dark-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">给这个任务打分</h3>
                      <div className="flex items-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setUserRating(rating)}
                            className="transition-all duration-200 hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= userRating
                                  ? 'fill-warmOrange text-warmOrange'
                                  : 'text-dark-border hover:text-warmOrange/50'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleCompleteTask}
                        disabled={isCompleting || userRating === 0}
                        className="w-full bg-successGreen hover:bg-successGreen/80 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            完成中...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            完成任务
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部导航按钮 */}
        {currentStep < 5 && (
          <div className="bg-dark-surface border-t border-dark-border">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-2 bg-dark-border hover:bg-dark-border/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                上一步
              </button>

              {currentStep !== 4 && (
                <button
                  onClick={handleNextStep}
                  disabled={currentStep >= totalSteps}
                  className="flex items-center gap-2 px-6 py-2 bg-pathBlue hover:bg-pathBlue-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
