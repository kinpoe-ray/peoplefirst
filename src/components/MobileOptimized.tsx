import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// 移动端优化的卡片组件
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className = '', onClick }: MobileCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border
        ${isMobile ? 'p-4 mx-2' : 'p-6'}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// 移动端优化的网格组件
interface MobileGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function MobileGrid({ children, cols = 2, gap = 4, className = '' }: MobileGridProps) {
  const isMobile = useIsMobile();
  
  const gridCols = isMobile 
    ? cols === 1 ? 'grid-cols-1' : 'grid-cols-2'
    : cols === 1 ? 'grid-cols-1' 
    : cols === 2 ? 'md:grid-cols-2'
    : cols === 3 ? 'md:grid-cols-3' 
    : 'md:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

// 移动端优化的按钮组
interface MobileButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function MobileButtonGroup({ children, orientation = 'horizontal', className = '' }: MobileButtonGroupProps) {
  const isMobile = useIsMobile();
  const isVertical = orientation === 'vertical' || isMobile;
  
  return (
    <div className={`
      ${isVertical ? 'flex flex-col space-y-2' : 'flex flex-wrap gap-2'}
      ${className}
    `}>
      {children}
    </div>
  );
}

// 移动端优化的模态框
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function MobileModal({ isOpen, onClose, title, children, size = 'md' }: MobileModalProps) {
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: isMobile ? 'w-full h-auto' : 'w-96',
    md: isMobile ? 'w-full h-auto' : 'w-[32rem]',
    lg: isMobile ? 'w-full h-auto' : 'w-[48rem]',
    full: 'w-full h-full'
  };

  const positionClasses = size === 'full' 
    ? 'inset-0 rounded-none' 
    : isMobile 
      ? 'absolute bottom-0 left-0 right-0 rounded-t-xl'
      : 'fixed inset-0 m-auto rounded-lg';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div 
        className={`
          ${positionClasses}
          ${sizeClasses[size]}
          bg-white
          ${size === 'full' ? '' : 'max-h-[90vh] overflow-auto'}
          animate-in slide-in-from-bottom duration-300
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// 移动端优化的标签页
interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
  }>;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function MobileTabs({ tabs, defaultTab, onTabChange }: MobileTabsProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [showTabModal, setShowTabModal] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
    if (isMobile) {
      setShowTabModal(false);
    }
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (isMobile) {
    return (
      <div className="w-full">
        {/* 移动端标签选择器 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            {activeTabData?.icon && (
              <div className="w-5 h-5">{activeTabData.icon}</div>
            )}
            <span className="font-medium">{activeTabData?.label}</span>
          </div>
          <button
            onClick={() => setShowTabModal(true)}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          {activeTabData?.content}
        </div>

        {/* 标签选择模态框 */}
        <MobileModal
          isOpen={showTabModal}
          onClose={() => setShowTabModal(false)}
          title="选择标签"
          size="sm"
        >
          <div className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                {tab.icon && <div className="w-5 h-5">{tab.icon}</div>}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </MobileModal>
      </div>
    );
  }

  // 桌面端标签页
  return (
    <div className="w-full">
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon && <div className="w-4 h-4">{tab.icon}</div>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6">
        {activeTabData?.content}
      </div>
    </div>
  );
}

// 移动端优化的统计卡片
interface MobileStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function MobileStatCard({ title, value, icon, color = 'blue', trend, onClick }: MobileStatCardProps) {
  const isMobile = useIsMobile();
  
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <MobileCard onClick={onClick} className={onClick ? 'hover:scale-105 transition-transform' : ''}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm ${isMobile ? 'text-gray-600' : 'text-gray-500'} font-medium`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${isMobile ? 'text-lg' : 'text-2xl'} text-gray-900 mt-1`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </MobileCard>
  );
}