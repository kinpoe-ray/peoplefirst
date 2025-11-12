import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Assessment from '../components/Assessment';
import { questionBankBySkill } from '../data/questionBank';
import { 
  Target, 
  Trophy, 
  Clock, 
  Star, 
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Zap
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  level_required: number;
  market_demand: number;
}

interface SkillLevel {
  id: string;
  user_id: string;
  skill_id: string;
  level: number;
  score: number;
  verified: boolean;
  last_assessment: string;
}

interface ChallengeProgress {
  currentLevel: number;
  totalLevels: number;
  levelScore: number;
  totalScore: number;
  completedLevels: number[];
  timeRemaining: number;
  startTime: number;
}

interface ChallengeModeProps {
  hideHeader?: boolean;
}

export default function ChallengeMode({ hideHeader = false }: ChallengeModeProps) {
  const { profile } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillLevels, setSkillLevels] = useState<{ [skillId: string]: SkillLevel }>({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
    loadUserSkillLevels();
  }, []);

  const loadSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category');

    if (!error && data) {
      setSkills(data);
    }
    setLoading(false);
  };

  const loadUserSkillLevels = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('skill_levels')
      .select('*')
      .eq('user_id', profile.id);

    if (!error && data) {
      const levelsMap = data.reduce((acc, level) => {
        acc[level.skill_id] = level;
        return acc;
      }, {} as { [skillId: string]: SkillLevel });
      setSkillLevels(levelsMap);
    }
  };

  const startChallenge = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsAssessing(true);
    setAssessmentComplete(false);
    setFinalResult(null);
  };

  const handleAssessmentComplete = (result: ChallengeProgress) => {
    setIsAssessing(false);
    setAssessmentComplete(true);
    setFinalResult(result);
    
    // 刷新用户技能等级
    loadUserSkillLevels();
  };

  const backToSkillList = () => {
    setIsAssessing(false);
    setSelectedSkill(null);
    setAssessmentComplete(false);
    setFinalResult(null);
  };

  const getSkillLevelText = (level: number) => {
    const levels = ['入门', '初级', '中级', '高级', '专家'];
    return levels[Math.min(level, 4)] || '专家';
  };

  const getSkillLevelColor = (level: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800'
    ];
    return colors[Math.min(level, 4)] || 'bg-yellow-100 text-yellow-800';
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as { [key: string]: Skill[] });

  if (isAssessing && selectedSkill) {
    return (
      <Assessment
        skillId={selectedSkill.id}
        skillName={selectedSkill.name}
        onComplete={handleAssessmentComplete}
        onBack={backToSkillList}
      />
    );
  }

  if (assessmentComplete && finalResult && selectedSkill) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 成绩展示 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            恭喜完成 {selectedSkill.name} 挑战！
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((finalResult.totalScore + finalResult.levelScore) / finalResult.totalLevels)}分
              </div>
              <div className="text-sm text-gray-600">综合得分</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {finalResult.completedLevels.length}
              </div>
              <div className="text-sm text-gray-600">完成关卡</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {getSkillLevelText(skillLevels[selectedSkill.id]?.level || 0)}
              </div>
              <div className="text-sm text-gray-600">当前等级</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(900 - finalResult.timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">用时</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">关卡成绩详情</h3>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: finalResult.totalLevels }, (_, i) => {
                const level = i + 1;
                const isCompleted = finalResult.completedLevels.includes(level);
                const isCurrent = level === finalResult.currentLevel;
                
                return (
                  <div
                    key={level}
                    className={`p-3 rounded-lg border-2 ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : isCurrent 
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">关卡 {level}</div>
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <Trophy className="h-4 w-4 text-green-600" />
                      ) : (
                        <Target className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-600">
                        {isCompleted ? '已完成' : isCurrent ? '进行中' : '未开始'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startChallenge(selectedSkill)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Zap className="h-5 w-5" />
              再次挑战
            </button>
            <button
              onClick={backToSkillList}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              选择其他技能
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部介绍 */}
      {!hideHeader && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">技能挑战模式</h1>
              <p className="text-sm text-gray-600">通过闯关式测评，全面检验你的专业技能水平</p>
            </div>
          </div>

          {/* 特色介绍 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">闯关模式</div>
                <div className="text-xs text-blue-700">3个递进关卡</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">计时挑战</div>
                <div className="text-xs text-green-700">15分钟限时</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">技能徽章</div>
                <div className="text-xs text-purple-700">获得官方认证</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">能力分析</div>
                <div className="text-xs text-orange-700">详细能力报告</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {category === '技术技能' && <BookOpen className="h-6 w-6 text-blue-600" />}
              {category === '运营技能' && <Users className="h-6 w-6 text-green-600" />}
              {category === '产品技能' && <Target className="h-6 w-6 text-purple-600" />}
              {category === '数据技能' && <TrendingUp className="h-6 w-6 text-orange-600" />}
              {category === '营销技能' && <Zap className="h-6 w-6 text-pink-600" />}
              {category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill) => {
                const userLevel = skillLevels[skill.id];
                const hasQuestions = questionBankBySkill[skill.id] && questionBankBySkill[skill.id].length > 0;
                
                return (
                  <div
                    key={skill.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{skill.icon}</span>
                        <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      </div>
                      {userLevel?.verified && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">已认证</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">市场需求:</span>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${skill.market_demand}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{skill.market_demand}%</span>
                        </div>
                      </div>
                    </div>

                    {userLevel && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-500">当前等级:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(userLevel.level)}`}>
                          {getSkillLevelText(userLevel.level)} ({userLevel.score}分)
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => hasQuestions ? startChallenge(skill) : null}
                      disabled={!hasQuestions}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        hasQuestions
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {hasQuestions ? (
                        <>
                          <Target className="h-4 w-4" />
                          开始挑战
                        </>
                      ) : (
                        <>
                          <span>暂未开放</span>
                        </>
                      )}
                    </button>
                    
                    {hasQuestions && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-gray-500">
                          {questionBankBySkill[skill.id].length} 道题目
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// 时间格式化工具函数
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}