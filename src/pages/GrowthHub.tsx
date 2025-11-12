import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Rocket, Dumbbell, Brain, TrendingUp, BookOpen } from 'lucide-react';
import { MobileCard } from '../components/MobileOptimized';
import SkillGym from './SkillGym';
import ChallengeMode from './ChallengeMode';
import AICareerAdvisor from './AICareerAdvisor';
import GradeManagement from './GradeManagement';

type TabType = 'assessment' | 'ai' | 'learning-paths' | 'grades';

export default function GrowthHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'assessment';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [assessmentMode, setAssessmentMode] = useState<'quick' | 'challenge'>('quick');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'assessment' as TabType, label: '技能测评', icon: Dumbbell },
    { id: 'ai' as TabType, label: 'AI导师', icon: Brain },
    { id: 'learning-paths' as TabType, label: '学习路径', icon: TrendingUp },
    { id: 'grades' as TabType, label: '成绩管理', icon: BookOpen },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <MobileCard>
        <div className="flex items-center gap-3 mb-6">
          <Rocket className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">成长中心</h1>
            <p className="text-sm text-gray-600">系统化提升技能，AI助力职业发展</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 -mb-6 -mx-4 md:-mx-6">
          <div className="flex space-x-1 overflow-x-auto px-4 md:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </MobileCard>

      {/* Tab Content */}
      {activeTab === 'assessment' && (
        <>
          {/* Assessment Mode Selector */}
          <MobileCard>
            <h3 className="font-semibold text-gray-900 mb-3">选择测评模式</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAssessmentMode('quick')}
                className={`text-left p-4 border-2 rounded-lg transition-colors ${
                  assessmentMode === 'quick'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">快速测评模式</h3>
                </div>
                <p className="text-sm text-gray-600">经典的单轮测评模式，适合快速了解技能水平</p>
              </button>

              <button
                onClick={() => setAssessmentMode('challenge')}
                className={`text-left p-4 border-2 rounded-lg transition-colors ${
                  assessmentMode === 'challenge'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">闯关挑战模式</h3>
                </div>
                <p className="text-sm text-gray-600">三关递进挑战，更有挑战性和趣味性</p>
              </button>
            </div>
          </MobileCard>

          {/* Render selected assessment mode - hide their headers */}
          <div className="assessment-content">
            {assessmentMode === 'quick' ? <SkillGym hideHeader /> : <ChallengeMode hideHeader />}
          </div>
        </>
      )}

      {activeTab === 'ai' && <AICareerAdvisor hideHeader />}

      {activeTab === 'learning-paths' && (
        <MobileCard>
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">学习路径功能开发中</h3>
            <p className="text-gray-600">
              即将推出AI生成的个性化学习路径，敬请期待！
            </p>
          </div>
        </MobileCard>
      )}

      {activeTab === 'grades' && <GradeManagement hideHeader />}
    </div>
  );
}
