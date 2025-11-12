import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Skill } from '../lib/supabase';
import { SkillGraph, SkillStats, SkillAchievement, SkillAssessmentResult } from '../types';
import { skillAssessmentService } from '../services/skillAssessment';

export const useSkills = () => {
  const { profile } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载技能失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const createSkill = useCallback(async (skillData: Omit<Skill, 'id' | 'created_at'>) => {
    if (!profile) throw new Error('用户未登录');

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          ...skillData,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSkills(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建技能失败');
      throw err;
    }
  }, [profile]);

  const updateSkill = useCallback(async (skillId: string, updates: Partial<Skill>) => {
    if (!profile) throw new Error('用户未登录');

    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) throw error;
      
      setSkills(prev => prev.map(skill => 
        skill.id === skillId ? data : skill
      ));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新技能失败');
      throw err;
    }
  }, [profile]);

  return {
    skills,
    loading,
    error,
    loadSkills,
    createSkill,
    updateSkill,
  };
};

export const useUserSkills = () => {
  const { profile } = useAuth();
  const [userSkills, setUserSkills] = useState<Array<{
    skill_id: string;
    level: number;
    score: number;
    verified: boolean;
    skill?: Skill;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserSkills = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          level,
          score,
          verified,
          skills (
            id,
            name,
            category,
            description,
            icon
          )
        `)
        .eq('user_id', profile.id);

      if (error) throw error;
      
      const formattedData = data?.map(item => {
        const skillData = Array.isArray(item.skills) ? item.skills[0] : item.skills;
        return {
          skill_id: item.skill_id,
          level: item.level,
          score: item.score,
          verified: item.verified,
          skill: skillData ? { ...skillData, created_at: new Date().toISOString() } : undefined,
        };
      }) || [];
      
      setUserSkills(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载用户技能失败');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadUserSkills();
  }, [loadUserSkills]);

  const updateUserSkill = useCallback(async (
    skillId: string, 
    level: number, 
    score: number
  ) => {
    if (!profile) throw new Error('用户未登录');

    try {
      const { data, error } = await supabase
        .from('user_skills')
        .upsert({
          user_id: profile.id,
          skill_id: skillId,
          level,
          score,
          verified: score >= 70,
          updated_at: new Date().toISOString(),
        })
        .select(`
          skill_id,
          level,
          score,
          verified,
          skills (
            id,
            name,
            category,
            description,
            icon
          )
        `)
        .single();

      if (error) throw error;
      
      // @ts-ignore - 临时忽略类型检查
      const formattedData = {
        skill_id: data.skill_id,
        level: data.level,
        score: data.score,
        verified: data.verified,
        // @ts-ignore
        skill: Array.isArray(data.skills) ? data.skills[0] : (data.skills ? { 
          // @ts-ignore
          ...data.skills, 
          created_at: new Date().toISOString()
        } : undefined),
      };
      
      setUserSkills(prev => {
        const existingIndex = prev.findIndex(us => us.skill_id === skillId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = formattedData;
          return updated;
        } else {
          return [...prev, formattedData];
        }
      });
      
      return formattedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新用户技能失败');
      throw err;
    }
  }, [profile]);

  const assessSkillWithAI = useCallback(async (skillName: string, assessmentType: 'knowledge' | 'practical' | 'comprehensive' = 'comprehensive') => {
    if (!profile) throw new Error('用户未登录');

    try {
      // 准备评估请求数据
      const userBackground = {
        education_level: profile.user_type || 'unknown',
        major: profile.major,
        experience_years: 0, // 可以从用户资料中获取
        previous_skills: userSkills.map(us => us.skill?.name).filter(Boolean) as string[],
      };

      const request = {
        skill_name: skillName,
        user_background: userBackground,
        assessment_type: assessmentType,
      };

      const result = await skillAssessmentService.assessSkill(request);
      
      // 更新用户技能记录
      const userSkill = await updateUserSkill(
        skillName, // 这里需要根据skillName找到对应的skill_id
        result.level,
        result.score
      );

      return { ...result, userSkill };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI技能评估失败');
      throw err;
    }
  }, [profile, userSkills, updateUserSkill]);

  return {
    userSkills,
    loading,
    error,
    loadUserSkills,
    updateUserSkill,
    assessSkillWithAI,
  };
};

export const useSkillGraph = () => {
  const { profile } = useAuth();
  const [skillGraphs, setSkillGraphs] = useState<SkillGraph[]>([]);
  const [currentGraph, setCurrentGraph] = useState<SkillGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkillGraphs = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      // 这里需要创建skill_graphs表
      // 暂时返回空数据
      setSkillGraphs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载技能图谱失败');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const generateSkillGraph = useCallback(async (title: string, description?: string) => {
    if (!profile) throw new Error('用户未登录');

    try {
      // 获取所有可用技能
      const { data: skills } = await supabase
        .from('skills')
        .select('*');

      if (!skills) throw new Error('获取技能数据失败');

      // 获取用户技能状态
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', profile.id);

      // 构建技能图谱
      const skillGraph: SkillGraph = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        title,
        description,
        nodes: skills.map((skill, index) => {
          const userSkill = userSkills?.find(us => us.skill_id === skill.id);
          return {
            id: skill.id,
            skill_id: skill.id,
            skill,
            level: userSkill?.level || 0,
            score: userSkill?.score || 0,
            status: userSkill?.level ? 'in_progress' : 'locked',
            position: {
              x: (index % 5) * 200 + 100,
              y: Math.floor(index / 5) * 150 + 100,
            },
          };
        }),
        edges: [], // 可以根据技能前置关系生成
        total_skills: skills.length,
        completed_skills: userSkills?.filter(us => us.level >= 3).length || 0,
        average_score: userSkills?.reduce((sum, us) => sum + us.score, 0) / (userSkills?.length || 1) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCurrentGraph(skillGraph);
      return skillGraph;
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成技能图谱失败');
      throw err;
    }
  }, [profile]);

  useEffect(() => {
    loadSkillGraphs();
  }, [loadSkillGraphs]);

  return {
    skillGraphs,
    currentGraph,
    loading,
    error,
    loadSkillGraphs,
    generateSkillGraph,
    setCurrentGraph,
  };
};

export const useSkillStats = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<SkillStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      // 获取用户技能
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select(`
          skill_id,
          level,
          score,
          skills (
            name,
            category
          )
        `)
        .eq('user_id', profile.id);

      if (!userSkills) throw new Error('获取用户技能失败');

      // 计算统计信息
      const totalSkills = userSkills.length;
      const completedSkills = userSkills.filter(us => us.level >= 3).length;
      const inProgressSkills = userSkills.filter(us => us.level >= 1 && us.level < 3).length;
      const lockedSkills = totalSkills - completedSkills - inProgressSkills;
      
      const averageScore = totalSkills > 0 
        ? userSkills.reduce((sum, us) => sum + us.score, 0) / totalSkills
        : 0;

      // 按类别统计
      const categoryDistribution: { [category: string]: number } = {};
      userSkills.forEach(us => {
        const category = (us.skills as any)?.category || '未分类';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });

      // 模拟最近成就
      const recentAchievements: SkillAchievement[] = userSkills
        .filter(us => us.level >= 3)
        .slice(0, 5)
        .map(us => ({
          skill_id: us.skill_id,
          skill_name: (us.skills as any)?.name || '未知技能',
          level_achieved: us.level,
          score: us.score,
          achieved_at: new Date().toISOString(),
        }));

      // 模拟技能趋势
      const skillTrends = userSkills.slice(0, 3).map(us => ({
        skill_name: (us.skills as any)?.name || '未知技能',
        score_change: Math.random() * 20 - 10, // 模拟分数变化
        level_change: Math.random() > 0.5 ? 1 : 0, // 模拟等级变化
        period: 'month' as const,
      }));

      setStats({
        total_skills: totalSkills,
        completed_skills: completedSkills,
        in_progress_skills: inProgressSkills,
        locked_skills: lockedSkills,
        average_score: Math.round(averageScore),
        category_distribution: categoryDistribution,
        recent_achievements: recentAchievements,
        skill_trends: skillTrends,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载技能统计失败');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
  };
};