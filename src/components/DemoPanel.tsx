import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateDemoData, clearTestData } from '../utils/testDataGenerator';
import { useToast } from './Toast';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { 
  Play, 
  RotateCcw, 
  Database, 
  Zap, 
  Users, 
  Trophy, 
  BookOpen, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface DemoPanelProps {
  className?: string;
}

export default function DemoPanel({ className = '' }: DemoPanelProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const generateData = async () => {
    if (!user?.id) {
      handleError('请先登录');
      return;
    }

    setIsGenerating(true);
    try {
      await generateDemoData(user.id);
      handleSuccess(
        '演示数据生成成功！您现在可以体验完整的系统功能。',
        '数据生成完成'
      );
      
      // 刷新页面以加载新数据
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      handleError(error, '生成演示数据');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearData = async () => {
    if (!user?.id) {
      handleError('请先登录');
      return;
    }

    setIsClearing(true);
    try {
      await clearTestData(user.id);
      handleSuccess(
        '测试数据已清除，您的账户回到初始状态。',
        '数据清除完成'
      );
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      handleError(error, '清除测试数据');
    } finally {
      setIsClearing(false);
    }
  };

  const demoFeatures = [
    {
      icon: Database,
      title: '技能数据',
      description: '生成用户技能和学习进度'
    },
    {
      icon: Trophy,
      title: '徽章系统',
      description: '创建游戏化成就徽章'
    },
    {
      icon: BookOpen,
      title: '课程记录',
      description: '模拟学习课程和成绩'
    },
    {
      icon: Zap,
      title: '测评记录',
      description: '生成技能测评历史'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Play className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">演示模式</h3>
          <p className="text-sm text-gray-600">
            生成测试数据，体验完整功能
          </p>
        </div>
      </div>

      {/* 功能介绍 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {demoFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-white rounded-lg">
              <feature.icon className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{feature.title}</p>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={generateData}
          disabled={isGenerating || !user}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isGenerating ? '生成中...' : '生成演示数据'}
        </button>

        <button
          onClick={clearData}
          disabled={isClearing || !user}
          className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isClearing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
          {isClearing ? '清除中...' : '清除测试数据'}
        </button>
      </div>

      {/* 说明 */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium mb-1">使用说明</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• 生成的数据仅用于演示，不会影响真实用户数据</li>
              <li>• 演示数据包括技能、徽章、课程和测评记录</li>
              <li>• 可以随时清除测试数据回到初始状态</li>
              <li>• 建议在正式使用前清除演示数据</li>
            </ul>
          </div>
        </div>
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">请先登录以使用演示功能</span>
          </div>
        </div>
      )}
    </div>
  );
}