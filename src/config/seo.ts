/**
 * SEO Configuration for PeopleFirst
 *
 * Centralized configuration for site-wide SEO settings
 */

export interface SEOConfig {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultOGImage: string;
  baseUrl: string;
  twitterHandle?: string;
  locale: string;
}

export const seoConfig: SEOConfig = {
  siteName: 'PeopleFirst',
  defaultTitle: 'PeopleFirst - 先试试再决定',
  titleTemplate: '%s | PeopleFirst',
  defaultDescription: '不是规划人生，而是体验人生。在真实的尝试中发现真正的自己。通过职业去魅化、技能试验场和迷茫者故事墙，帮助你在探索中找到方向。',
  defaultOGImage: '/og-image.png',
  baseUrl: import.meta.env.VITE_BASE_URL || 'https://peoplefirst.app',
  twitterHandle: '@peoplefirst',
  locale: 'zh_CN',
};

// Page-specific SEO defaults
export const pageSEO = {
  home: {
    title: '先试试再决定',
    description: '不是规划人生，而是体验人生。在真实的尝试中发现真正的自己。PeopleFirst帮助迷茫中的探索者通过真实体验找到方向。',
  },
  contents: {
    title: '职业去魅化内容库',
    description: '真实的一天、高光与崩溃，看清职业的真相。不是光鲜的宣传片，而是真实的工作日常，让你在尝试前就看清职业真相。',
  },
  stories: {
    title: '迷茫者故事墙',
    description: '真实的尝试、真实的失败、真实的发现。在他人的故事中找到共鸣，在分享中获得力量。你不是一个人。',
  },
  tasks: {
    title: '技能试验场',
    description: '30-60分钟沉浸式任务，AI实时反馈。不是纸上谈兵，而是真刀真枪地试一试，在实践中发现自己的天赋。',
  },
  login: {
    title: '登录',
    description: '登录PeopleFirst，继续你的探索之旅。每一次登录，都是重新发现自己的开始。',
  },
  signup: {
    title: '注册',
    description: '加入PeopleFirst，开始你的探索之旅。不需要完美的计划，只需要一点点勇气和开始的决心。',
  },
};
