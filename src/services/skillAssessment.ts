import { SkillAssessmentRequest, SkillAssessmentResult } from '../types';

// MiniMax AI API配置
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class SkillAssessmentService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = MINIMAX_API_KEY || '';
    this.baseUrl = MINIMAX_BASE_URL;
  }

  /**
   * 评估用户技能水平
   */
  async assessSkill(request: SkillAssessmentRequest): Promise<SkillAssessmentResult> {
    if (!this.apiKey) {
      throw new Error('MiniMax API密钥未配置');
    }

    try {
      const prompt = this.buildAssessmentPrompt(request);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的技能评估专家，擅长根据用户背景和技能描述进行准确的技能水平评估。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: ChatCompletionResponse = await response.json();
      const result = this.parseAssessmentResult(data.choices[0].message.content);
      
      return {
        skill_name: request.skill_name,
        level: result.level || 1,
        score: result.score || 0,
        confidence: result.confidence || 0.5,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        recommendations: result.recommendations || [],
        next_steps: result.next_steps || [],
        estimated_learning_time: result.estimated_learning_time,
      };
    } catch (error) {
      console.error('技能评估失败:', error);
      // 返回默认评估结果
      return this.getDefaultAssessment(request.skill_name);
    }
  }

  /**
   * 根据用户技能图谱生成学习建议
   */
  async generateLearningRecommendations(
    skills: Array<{ name: string; level: number; score: number }>
  ): Promise<string[]> {
    if (!this.apiKey) {
      return ['请配置MiniMax API密钥以获取AI学习建议'];
    }

    try {
      const prompt = `
        基于以下用户技能情况，生成3-5个具体的学习建议：
        
        用户技能状况：
        ${skills.map(skill => `- ${skill.name}: 等级${skill.level}, 分数${skill.score}`).join('\n')}
        
        请返回具体、可执行的学习建议，每个建议包含：
        1. 技能名称
        2. 具体行动步骤
        3. 推荐资源
        4. 预期时间
        
        格式要求：每个建议用一行，包含用"|"分隔的四个部分
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位资深的职业发展导师，擅长根据用户的技能状况提供个性化的学习建议。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: ChatCompletionResponse = await response.json();
      const recommendations = data.choices[0].message.content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, ''))
        .filter(line => line.length > 10);

      return recommendations.length > 0 ? recommendations : ['建议定期练习和复习相关技能'];
    } catch (error) {
      console.error('生成学习建议失败:', error);
      return ['建议制定系统化的学习计划', '多参与实践项目巩固技能', '寻求专业指导加速提升'];
    }
  }

  /**
   * 分析技能发展趋势
   */
  async analyzeSkillTrends(
    currentSkills: Array<{ name: string; level: number; score: number }>,
    previousSkills: Array<{ name: string; level: number; score: number }>
  ): Promise<Array<{
    skill_name: string;
    trend: 'improving' | 'declining' | 'stable';
    change_score: number;
    change_level: number;
    insights: string[];
  }>> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const prompt = `
        分析用户技能发展趋势：
        
        当前技能状况：
        ${currentSkills.map(skill => `- ${skill.name}: 等级${skill.level}, 分数${skill.score}`).join('\n')}
        
        之前技能状况：
        ${previousSkills.map(skill => `- ${skill.name}: 等级${skill.level}, 分数${skill.score}`).join('\n')}
        
        请分析每个技能的变动趋势，并提供洞察。
        返回格式：技能名称|趋势(improving/declining/stable)|分数变化|等级变化|洞察1;洞察2;洞察3
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位数据分析师，专门分析技能发展趋势并提供专业洞察。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data: ChatCompletionResponse = await response.json();
      return this.parseTrendAnalysis(data.choices[0].message.content);
    } catch (error) {
      console.error('技能趋势分析失败:', error);
      return [];
    }
  }

  private buildAssessmentPrompt(request: SkillAssessmentRequest): string {
    const { skill_name, user_background, assessment_type } = request;
    
    let prompt = `请评估用户在"${skill_name}"技能方面的水平。\n\n`;
    
    if (user_background) {
      prompt += `用户背景：\n`;
      prompt += `- 教育水平：${user_background.education_level}\n`;
      if (user_background.major) {
        prompt += `- 专业：${user_background.major}\n`;
      }
      prompt += `- 经验年限：${user_background.experience_years}年\n`;
      if (user_background.previous_skills?.length) {
        prompt += `- 已有技能：${user_background.previous_skills.join(', ')}\n`;
      }
      prompt += '\n';
    }
    
    prompt += `评估类型：${assessment_type === 'knowledge' ? '理论知识' : assessment_type === 'practical' ? '实践能力' : '综合评估'}\n\n`;
    
    prompt += `请返回JSON格式的评估结果，包含以下字段：
{
  "level": 1-5的数字等级,
  "score": 0-100的分数,
  "confidence": 0-1的置信度,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["劣势1", "劣势2"],
  "recommendations": ["建议1", "建议2"],
  "next_steps": ["下一步1", "下一步2"],
  "estimated_learning_time": "预估学习时间（小时）"
}`;
    
    return prompt;
  }

  private parseAssessmentResult(content: string): Partial<SkillAssessmentResult> {
    try {
      // 尝试解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          level: result.level || 1,
          score: result.score || 0,
          confidence: result.confidence || 0.5,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          recommendations: result.recommendations || [],
          next_steps: result.next_steps || [],
          estimated_learning_time: result.estimated_learning_time,
        };
      }
    } catch (error) {
      console.error('解析评估结果失败:', error);
    }
    
    // 备用解析方法
    return this.fallbackParse(content);
  }

  private fallbackParse(content: string): Partial<SkillAssessmentResult> {
    // 简单的文本解析作为备用方案
    const levelMatch = content.match(/等级[：:]\s*(\d+)/);
    const scoreMatch = content.match(/分数[：:]\s*(\d+)/);
    
    return {
      level: levelMatch ? parseInt(levelMatch[1]) : 1,
      score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
      confidence: 0.5,
      strengths: ['需要进一步评估'],
      weaknesses: ['数据不足'],
      recommendations: ['进行详细技能测试'],
      next_steps: ['补充技能信息'],
    };
  }

  private parseTrendAnalysis(content: string): Array<{
    skill_name: string;
    trend: 'improving' | 'declining' | 'stable';
    change_score: number;
    change_level: number;
    insights: string[];
  }> {
    const trends = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 5) {
        trends.push({
          skill_name: parts[0].trim(),
          trend: parts[1].trim() as 'improving' | 'declining' | 'stable',
          change_score: parseFloat(parts[2]) || 0,
          change_level: parseInt(parts[3]) || 0,
          insights: parts[4].split(';').map(s => s.trim()).filter(s => s),
        });
      }
    }
    
    return trends;
  }

  private getDefaultAssessment(skillName: string): SkillAssessmentResult {
    return {
      skill_name: skillName,
      level: 1,
      score: 50,
      confidence: 0.3,
      strengths: ['新学者'],
      weaknesses: ['需要系统性学习'],
      recommendations: ['从基础开始学习', '多练习实践'],
      next_steps: ['制定学习计划', '寻找学习资源'],
      estimated_learning_time: '40-60小时',
    };
  }
}

export const skillAssessmentService = new SkillAssessmentService();