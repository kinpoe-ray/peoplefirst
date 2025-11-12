import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, MessageSquare, GraduationCap, Hash } from 'lucide-react';
import { MobileCard } from '../components/MobileOptimized';
import SocialHub from './SocialHub';
import Guilds from './Guilds';
import Alumni from './Alumni';

type TabType = 'feed' | 'guilds' | 'alumni';

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'feed';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'feed' as TabType, label: '动态广场', icon: MessageSquare },
    { id: 'guilds' as TabType, label: '技能社团', icon: Hash },
    { id: 'alumni' as TabType, label: '校友圈', icon: GraduationCap },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <MobileCard>
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">社区</h1>
            <p className="text-sm text-gray-600">与同道者交流学习，分享经验心得</p>
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
      {activeTab === 'feed' && <SocialHub />}
      {activeTab === 'guilds' && <Guilds />}
      {activeTab === 'alumni' && <Alumni />}
    </div>
  );
}
