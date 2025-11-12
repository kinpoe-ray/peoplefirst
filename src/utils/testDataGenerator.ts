// 测试数据生成器
import { supabase } from '../lib/supabase';

export interface TestDataConfig {
  userId: string;
  numSkills?: number;
  numAssessments?: number;
  numCourses?: number;
}

export class TestDataGenerator {
  private userId: string;
  private numSkills: number;
  private numAssessments: number;
  private numCourses: number;

  constructor(config: TestDataConfig) {
    this.userId = config.userId;
    this.numSkills = config.numSkills || 5;
    this.numAssessments = config.numAssessments || 10;
    this.numCourses = config.numCourses || 3;
  }

  async generateAllTestData() {
    console.log('开始生成测试数据...');
    
    try {
      await Promise.all([
        this.generateUserSkills(),
        this.generateSkillAssessments(),
        this.generateUserCourses(),
        this.generateUserBadges()
      ]);
      
      console.log('测试数据生成完成！');
    } catch (error) {
      console.error('生成测试数据失败:', error);
      throw error;
    }
  }

  async generateUserSkills() {
    console.log('生成用户技能数据...');
    
    // 获取现有技能
    const { data: skills } = await supabase
      .from('skills')
      .select('id')
      .limit(this.numSkills);

    if (!skills || skills.length === 0) {
      console.warn('未找到技能数据');
      return;
    }

    const userSkills = skills.map((skill, index) => ({
      user_id: this.userId,
      skill_id: skill.id,
      level: Math.floor(Math.random() * 5) + 1,
      score: Math.floor(Math.random() * 40) + 60, // 60-100分
      verified: Math.random() > 0.3, // 70%概率已验证
      progress: Math.floor(Math.random() * 100) + 1,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // 清除现有数据
    await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', this.userId);

    // 插入新数据
    const { error } = await supabase
      .from('user_skills')
      .insert(userSkills);

    if (error) throw error;
    console.log(`生成了 ${userSkills.length} 条用户技能记录`);
  }

  async generateSkillAssessments() {
    console.log('生成技能测评数据...');
    
    // 获取用户技能
    const { data: userSkills } = await supabase
      .from('user_skills')
      .select('skill_id')
      .eq('user_id', this.userId);

    if (!userSkills || userSkills.length === 0) {
      console.warn('未找到用户技能数据');
      return;
    }

    const assessments = [];
    for (let i = 0; i < this.numAssessments; i++) {
      const skill = userSkills[Math.floor(Math.random() * userSkills.length)];
      assessments.push({
        user_id: this.userId,
        skill_id: skill.skill_id,
        score: Math.floor(Math.random() * 40) + 60,
        total_questions: 10,
        correct_answers: Math.floor(Math.random() * 8) + 2,
        time_spent: Math.floor(Math.random() * 600) + 300, // 5-15分钟
        completed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    const { error } = await supabase
      .from('skill_assessments')
      .insert(assessments);

    if (error) throw error;
    console.log(`生成了 ${assessments.length} 条测评记录`);
  }

  async generateUserCourses() {
    console.log('生成用户课程数据...');
    
    // 模拟课程数据
    const courses = [
      { name: '前端开发基础', category: '前端', grade: 85 },
      { name: '数据结构与算法', category: '算法', grade: 92 },
      { name: '数据库原理', category: '后端', grade: 78 },
      { name: '计算机网络', category: '基础', grade: 88 },
      { name: '软件工程', category: '工程', grade: 90 }
    ].slice(0, this.numCourses);

    const userCourses = courses.map(course => ({
      user_id: this.userId,
      course_name: course.name,
      category: course.category,
      grade: course.grade,
      credits: Math.floor(Math.random() * 4) + 2,
      semester: this.getRandomSemester(),
      completed_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));

    const { error } = await supabase
      .from('user_courses')
      .insert(userCourses);

    if (error) throw error;
    console.log(`生成了 ${userCourses.length} 条课程记录`);
  }

  async generateUserBadges() {
    console.log('生成用户徽章数据...');
    
    // 获取可用的徽章
    const { data: badges } = await supabase
      .from('badges')
      .select('id')
      .limit(8);

    if (!badges || badges.length === 0) {
      console.warn('未找到徽章数据');
      return;
    }

    const userBadges = badges.map(badge => ({
      user_id: this.userId,
      badge_id: badge.id,
      earned_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    const { error } = await supabase
      .from('user_badges')
      .insert(userBadges);

    if (error) throw error;
    console.log(`生成了 ${userBadges.length} 条徽章记录`);
  }

  private getRandomSemester(): string {
    const semesters = ['2024春', '2024秋', '2023春', '2023秋', '2022春', '2022秋'];
    return semesters[Math.floor(Math.random() * semesters.length)];
  }
}

// 生成演示数据的便捷函数
export async function generateDemoData(userId: string) {
  const generator = new TestDataGenerator({
    userId,
    numSkills: 8,
    numAssessments: 15,
    numCourses: 5
  });

  await generator.generateAllTestData();
  return '演示数据生成完成！';
}

// 清除测试数据
export async function clearTestData(userId: string) {
  console.log('清除测试数据...');
  
  await Promise.all([
    supabase.from('user_skills').delete().eq('user_id', userId),
    supabase.from('skill_assessments').delete().eq('user_id', userId),
    supabase.from('user_courses').delete().eq('user_id', userId),
    supabase.from('user_badges').delete().eq('user_id', userId)
  ]);
  
  console.log('测试数据清除完成！');
}