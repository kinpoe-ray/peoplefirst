import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Award, Settings as SettingsIcon, BarChart3 } from 'lucide-react';
import { MobileCard } from '../components/MobileOptimized';
import Profile from './Profile';
import Badges from './Badges';
import Settings from './Settings';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'profile' | 'badges' | 'statistics' | 'settings';

export default function MySpace() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'profile';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'profile' as TabType, label: '个人资料', icon: User },
    { id: 'badges' as TabType, label: '我的徽章', icon: Award },
    { id: 'statistics' as TabType, label: '数据统计', icon: BarChart3 },
    { id: 'settings' as TabType, label: '设置', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <MobileCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
            <p className="text-sm text-gray-600">
              {profile?.user_type === 'student' && '学生'}
              {profile?.user_type === 'teacher' && '老师'}
              {profile?.user_type === 'alumni' && '校友'}
            </p>
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
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'badges' && <Badges />}

      {activeTab === 'statistics' && (
        <MobileCard>
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">数据统计功能开发中</h3>
            <p className="text-gray-600">
              即将推出个人成长数据分析，包括技能成长曲线、学习时长统计等
            </p>
          </div>
        </MobileCard>
      )}

      {activeTab === 'settings' && <Settings />}
    </div>
  );
}
