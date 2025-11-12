import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Target,
  Trophy,
  RotateCcw,
  Star,
  ArrowRight
} from 'lucide-react';

// 题目类型定义
export interface Question {
  id: string;
  skill_id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'code';
  options?: { [key: string]: string };
  correct_answer: string | string[];
  difficulty: number;
  explanation?: string;
  skill_points: number;
}

// 闯关进度定义
export interface ChallengeProgress {
  currentLevel: number;
  totalLevels: number;
  levelScore: number;
  totalScore: number;
  completedLevels: number[];
  timeRemaining: number;
  startTime: number;
}

// 用户答案记录
interface UserAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  isCorrect: boolean;
}

interface AssessmentProps {
  skillId: string;
  skillName: string;
  onComplete: (result: ChallengeProgress) => void;
  onBack: () => void;
}

export default function Assessment({ skillId, skillName, onComplete, onBack }: AssessmentProps) {
  const { profile } = useAuth();
  
  // 状态管理
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress>({
    currentLevel: 1,
    totalLevels: 3,
    levelScore: 0,
    totalScore: 0,
    completedLevels: [],
    timeRemaining: 900, // 15分钟
    startTime: Date.now()
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 定时器
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 时间格式化
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 加载题目
  useEffect(() => {
    loadQuestions();
  }, [skillId]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('skill_id', skillId)
        .eq('is_approved', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;

      // 按难度分组，分配到3个关卡
      const questionsByDifficulty = data.reduce((acc, q) => {
        const level = Math.ceil(q.difficulty / 2); // 1-2级->关卡1, 3-4级->关卡2, 5级->关卡3
        if (!acc[level]) acc[level] = [];
        acc[level].push(q);
        return acc;
      }, {} as { [key: number]: any[] });

      // 为每个关卡分配5-8道题
      const allQuestions: Question[] = [];
      Object.entries(questionsByDifficulty).forEach(([level, levelQuestions]) => {
        const typedLevelQuestions = levelQuestions as Question[];
        const shuffled = typedLevelQuestions.sort(() => Math.random() - 0.5);
        allQuestions.push(...shuffled.slice(0, Math.min(8, shuffled.length)));
      });

      setQuestions(allQuestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前关卡的题目
  const getCurrentLevelQuestions = useCallback(() => {
    const questionsPerLevel = Math.ceil(questions.length / 3);
    const startIndex = (progress.currentLevel - 1) * questionsPerLevel;
    const endIndex = Math.min(startIndex + questionsPerLevel, questions.length);
    return questions.slice(startIndex, endIndex);
  }, [questions, progress.currentLevel]);

  // 获取当前题目
  const getCurrentQuestion = useCallback(() => {
    const levelQuestions = getCurrentLevelQuestions();
    return levelQuestions[currentQuestionIndex] || null;
  }, [getCurrentLevelQuestions, currentQuestionIndex]);

  // 处理答案提交
  const handleSubmitAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = checkAnswer(currentQuestion, selectedAnswer);
    const questionTimeSpent = Date.now() - questionStartTime;

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent: questionTimeSpent,
      isCorrect
    };

    setUserAnswers(prev => [...prev, userAnswer]);

    // 计算得分
    const points = isCorrect ? currentQuestion.skill_points * (6 - currentQuestion.difficulty) : 0;
    
    // 延迟显示下一题，让用户看到结果
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // 检查答案
  const checkAnswer = (question: Question, answer: string | string[]): boolean => {
    const correctAnswer = question.correct_answer;
    
    if (question.question_type === 'multiple_choice') {
      if (Array.isArray(answer) && Array.isArray(correctAnswer)) {
        return answer.sort().join(',') === (correctAnswer as string[]).sort().join(',');
      }
      return false;
    }
    
    return answer === correctAnswer;
  };

  // 下一题
  const nextQuestion = () => {
    const levelQuestions = getCurrentLevelQuestions();
    
    if (currentQuestionIndex < levelQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setQuestionStartTime(Date.now());
      setTimeSpent(0);
    } else {
      completeLevel();
    }
  };

  // 完成关卡
  const completeLevel = async () => {
    const levelQuestions = getCurrentLevelQuestions();
    const levelAnswers = userAnswers.filter(answer => 
      levelQuestions.some(q => q.id === answer.questionId)
    );
    
    const correctCount = levelAnswers.filter(a => a.isCorrect).length;
    const levelScore = Math.round((correctCount / levelQuestions.length) * 100);
    
    // 保存关卡结果
    if (profile) {
      await supabase.from('skill_assessments').insert({
        user_id: profile.id,
        skill_id: skillId,
        score: levelScore,
        total_questions: levelQuestions.length,
        correct_answers: correctCount,
        time_spent: Math.floor((Date.now() - progress.startTime) / 1000),
        assessment_data: {
          level: progress.currentLevel,
          user_answers: levelAnswers,
          skill_points: levelAnswers.filter(a => a.isCorrect).reduce((sum, a) => {
            const question = questions.find(q => q.id === a.questionId);
            return sum + (question?.skill_points || 0);
          }, 0)
        }
      });
    }

    if (progress.currentLevel < progress.totalLevels) {
      // 下一关卡
      setProgress(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        completedLevels: [...prev.completedLevels, prev.currentLevel],
        totalScore: prev.totalScore + levelScore
      }));
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer('');
      setQuestionStartTime(Date.now());
    } else {
      // 测评完成
      completeAssessment(levelScore);
    }
  };

  // 完成测评
  const completeAssessment = async (finalLevelScore: number) => {
    const finalScore = Math.round((progress.totalScore + finalLevelScore) / progress.totalLevels);
    
    const finalResult: ChallengeProgress = {
      ...progress,
      levelScore: finalLevelScore,
      totalScore: progress.totalScore + finalLevelScore,
      completedLevels: [...progress.completedLevels, progress.currentLevel]
    };

    setAssessmentComplete(true);
    
    // 更新用户技能等级
    if (profile && finalScore >= 70) {
      const newLevel = Math.floor(finalScore / 25); // 70-89为初级，90+为高级
      await supabase.from('user_skills').upsert({
        user_id: profile.id,
        skill_id: skillId,
        score: finalScore,
        level: newLevel,
        verified: true,
        last_assessment: new Date().toISOString()
      });
    }

    setTimeout(() => {
      onComplete(finalResult);
    }, 3000);
  };

  // 重新开始
  const restart = () => {
    setProgress({
      currentLevel: 1,
      totalLevels: 3,
      levelScore: 0,
      totalScore: 0,
      completedLevels: [],
      timeRemaining: 900,
      startTime: Date.now()
    });
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer('');
    setAssessmentComplete(false);
    setQuestionStartTime(Date.now());
  };

  // 处理多选答案
  const handleMultipleChoice = (option: string) => {
    if (Array.isArray(selectedAnswer)) {
      const newAnswer = selectedAnswer.includes(option)
        ? selectedAnswer.filter(item => item !== option)
        : [...selectedAnswer, option];
      setSelectedAnswer(newAnswer);
    } else {
      setSelectedAnswer([option]);
    }
  };

  // 获取当前关卡的题目
  const currentLevelQuestions = getCurrentLevelQuestions();
  const currentQuestion = getCurrentQuestion();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">加载失败</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (assessmentComplete) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            恭喜完成 {skillName} 技能测评！
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((progress.totalScore + progress.levelScore) / progress.totalLevels)}分
              </div>
              <div className="text-sm text-gray-600">总得分</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {progress.completedLevels.length}
              </div>
              <div className="text-sm text-gray-600">完成关卡</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(900 - progress.timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">用时</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={restart}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <RotateCcw className="h-5 w-5" />
              再次挑战
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              返回技能列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">暂无题目可显示</p>
          <button
            onClick={onBack}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 头部进度信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">{skillName} 技能测评</h1>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                关卡 {progress.currentLevel} / {progress.totalLevels}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <span className={`text-lg font-mono ${progress.timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(progress.timeRemaining)}
            </span>
          </div>
        </div>

        {/* 关卡进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>关卡进度</span>
            <span>{currentQuestionIndex + 1} / {currentLevelQuestions.length}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / currentLevelQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 关卡星级显示 */}
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < progress.currentLevel 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 题目内容 */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {currentQuestion.question_type === 'single_choice' && '单选题'}
              {currentQuestion.question_type === 'multiple_choice' && '多选题'}
              {currentQuestion.question_type === 'fill_blank' && '填空题'}
              {currentQuestion.question_type === 'code' && '编程题'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">难度:</span>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < currentQuestion.difficulty 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {currentQuestion.question_text}
          </h2>
        </div>

        {/* 答案选项 */}
        <div className="space-y-4">
          {currentQuestion.question_type === 'single_choice' && currentQuestion.options && (
            Object.entries(currentQuestion.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedAnswer(key)}
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  selectedAnswer === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === key
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === key && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-700">{key}.</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              </button>
            ))
          )}

          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
            Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleMultipleChoice(key)}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700">{key}.</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                </button>
              );
            })
          )}

          {currentQuestion.question_type === 'fill_blank' && (
            <div className="space-y-4">
              <input
                type="text"
                value={selectedAnswer as string}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="请输入答案"
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
            退出测评
          </button>

          <div className="flex gap-4">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setSelectedAnswer('');
                }}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
                上一题
              </button>
            )}

            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === currentLevelQuestions.length - 1 
                ? '完成关卡' 
                : '下一题'
              }
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 答题进度总览 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">答题进度</h3>
        <div className="grid grid-cols-8 gap-2">
          {currentLevelQuestions.map((_, index) => {
            const answer = userAnswers.find(a => 
              currentLevelQuestions.some(q => q.id === a.questionId) && 
              currentLevelQuestions[index]?.id === a.questionId
            );
            
            return (
              <div
                key={index}
                className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answer
                    ? answer.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}