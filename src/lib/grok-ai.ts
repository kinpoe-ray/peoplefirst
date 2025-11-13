/**
 * Grok AI Integration
 * xAI Grok API 集成模块
 *
 * 使用说明：
 * 1. 在 .env 文件中设置 VITE_GROK_API_KEY
 * 2. 或在代码中通过环境变量注入
 */

const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || '';
const GROK_API_BASE_URL = 'https://api.x.ai/v1';

if (!GROK_API_KEY) {
  console.warn('⚠️  VITE_GROK_API_KEY 未设置，AI 功能将不可用');
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokCompletionOptions {
  model?: string; // grok-beta, grok-vision-beta
  temperature?: number; // 0-2
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface CareerAssessmentInput {
  userType: 'student' | 'professional';
  interests: string[];
  currentSkills: string[];
  careerGoals?: string;
  educationLevel?: string;
  graduationYear?: number;
  workExperience?: number; // 年数
}

export interface CareerAssessmentResult {
  recommendedRoles: Array<{
    role: string;
    matchScore: number; // 0-1
    reasons: string[];
    salaryRange: string;
    growthPotential: 'low' | 'medium' | 'high';
  }>;
  skillGaps: Array<{
    skill: string;
    importance: 'low' | 'medium' | 'high';
    learningTime: number; // 小时
  }>;
  learningPathRecommendations: string[];
  summary: string;
}

export interface SkillRecommendationInput {
  userId: string;
  currentSkills: string[];
  targetRole?: string;
  timeAvailableHours?: number;
  learningStyle?: 'video' | 'article' | 'interactive' | 'project';
}

export interface SkillRecommendation {
  skillId?: string;
  skillName: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  estimatedTime: number;
  difficulty: number; // 1-5
  marketDemand: number; // 1-100
  resources?: Array<{
    type: 'video' | 'article' | 'course';
    title: string;
    url: string;
  }>;
}

export interface LearningPathGeneratorInput {
  userId: string;
  targetRole: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  timeCommitmentHoursPerWeek: number;
  preferredLearningStyle?: 'video' | 'article' | 'interactive' | 'project';
}

export interface GeneratedLearningPath {
  pathId?: string;
  title: string;
  description: string;
  totalWeeks: number;
  steps: Array<{
    stepOrder: number;
    title: string;
    description: string;
    skills: string[];
    estimatedHours: number;
    resources: Array<{
      type: string;
      title: string;
      url?: string;
    }>;
  }>;
  weeklyPlan: Record<number, string[]>; // week number -> tasks
}

/**
 * 调用 Grok AI 完成接口
 */
async function callGrokCompletion(
  messages: GrokMessage[],
  options: GrokCompletionOptions = {}
): Promise<string> {
  const {
    model = 'grok-beta',
    temperature = 0.7,
    max_tokens = 2000,
    top_p = 1,
    stream = false,
  } = options;

  try {
    const response = await fetch(`${GROK_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(`Grok API 错误: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Grok API 返回格式错误');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API 调用失败:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`AI 服务暂时不可用: ${errorMessage}`);
  }
}

/**
 * AI 职业规划测评
 */
export async function performCareerAssessment(
  input: CareerAssessmentInput
): Promise<CareerAssessmentResult> {
  const systemPrompt = `你是一位专业的职业规划顾问，拥有丰富的行业经验和数据洞察。
你的任务是根据用户的背景、兴趣和技能，提供个性化的职业规划建议。

要求：
1. 推荐3-5个最匹配的职位
2. 为每个职位提供匹配度评分（0-1）和详细理由
3. 识别用户当前技能与目标职位之间的差距
4. 推荐学习路径
5. 所有输出必须是有效的 JSON 格式`;

  const userPrompt = `请为以下用户进行职业规划分析：

**用户类型**: ${input.userType === 'student' ? '学生' : '职场人士'}
**兴趣方向**: ${input.interests.join(', ')}
**当前技能**: ${input.currentSkills.join(', ')}
${input.careerGoals ? `**职业目标**: ${input.careerGoals}` : ''}
${input.educationLevel ? `**教育水平**: ${input.educationLevel}` : ''}
${input.graduationYear ? `**毕业年份**: ${input.graduationYear}` : ''}
${input.workExperience ? `**工作经验**: ${input.workExperience}年` : ''}

请以 JSON 格式返回分析结果，格式如下：
{
  "recommendedRoles": [
    {
      "role": "职位名称",
      "matchScore": 0.92,
      "reasons": ["理由1", "理由2"],
      "salaryRange": "15k-30k",
      "growthPotential": "high"
    }
  ],
  "skillGaps": [
    {
      "skill": "技能名称",
      "importance": "high",
      "learningTime": 40
    }
  ],
  "learningPathRecommendations": ["路径1", "路径2"],
  "summary": "综合分析总结"
}`;

  const response = await callGrokCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    temperature: 0.7,
    max_tokens: 2000,
  });

  // 解析 JSON
  try {
    // 清理可能的 markdown 代码块标记
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('解析 AI 响应失败:', error, response);
    throw new Error('AI 返回格式错误，请重试');
  }
}

/**
 * AI 技能推荐
 */
export async function recommendSkills(
  input: SkillRecommendationInput
): Promise<SkillRecommendation[]> {
  const systemPrompt = `你是一位技能发展专家，熟悉各行业的技能需求和学习路径。
你的任务是根据用户的当前技能、目标职位和可用时间，推荐最有价值的学习技能。

要求：
1. 推荐3-5项技能
2. 按优先级排序
3. 说明推荐理由和市场需求
4. 评估学习难度和时间
5. 返回有效的 JSON 格式`;

  const userPrompt = `请为以下用户推荐技能：

**当前技能**: ${input.currentSkills.join(', ')}
${input.targetRole ? `**目标职位**: ${input.targetRole}` : ''}
${input.timeAvailableHours ? `**每周可用时间**: ${input.timeAvailableHours}小时` : ''}
${input.learningStyle ? `**学习偏好**: ${input.learningStyle}` : ''}

返回 JSON 数组格式：
[
  {
    "skillName": "技能名称",
    "priority": "high",
    "reason": "推荐理由",
    "estimatedTime": 40,
    "difficulty": 3,
    "marketDemand": 95,
    "resources": [
      {
        "type": "video",
        "title": "资源标题",
        "url": "https://..."
      }
    ]
  }
]`;

  const response = await callGrokCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    throw new Error('AI 返回格式错误，请重试');
  }
}

/**
 * 生成个性化学习路径
 */
export async function generateLearningPath(
  input: LearningPathGeneratorInput
): Promise<GeneratedLearningPath> {
  const systemPrompt = `你是一位学习路径设计专家，擅长为不同背景的学习者设计循序渐进的学习计划。
你的任务是根据用户的目标、当前水平和时间安排，设计一条完整的学习路径。

要求：
1. 设计完整的学习路径，包含10-20个学习步骤
2. 每个步骤包含明确的目标、技能和资源
3. 考虑前置依赖关系
4. 制定周计划
5. 返回有效的 JSON 格式`;

  const userPrompt = `请为以下用户生成学习路径：

**目标职位**: ${input.targetRole}
**当前水平**: ${input.currentLevel}
**每周投入时间**: ${input.timeCommitmentHoursPerWeek}小时
${input.preferredLearningStyle ? `**学习偏好**: ${input.preferredLearningStyle}` : ''}

返回 JSON 格式：
{
  "title": "学习路径标题",
  "description": "路径描述",
  "totalWeeks": 24,
  "steps": [
    {
      "stepOrder": 1,
      "title": "步骤标题",
      "description": "步骤描述",
      "skills": ["技能1", "技能2"],
      "estimatedHours": 20,
      "resources": [
        {
          "type": "video",
          "title": "资源标题",
          "url": "https://..."
        }
      ]
    }
  ],
  "weeklyPlan": {
    "1": ["Week 1 任务1", "Week 1 任务2"],
    "2": ["Week 2 任务1"]
  }
}`;

  const response = await callGrokCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], {
    temperature: 0.7,
    max_tokens: 3000,
  });

  try {
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    throw new Error('AI 返回格式错误，请重试');
  }
}

/**
 * AI 学习助手对话
 */
export async function chatWithAI(
  message: string,
  context?: {
    userId?: string;
    currentPage?: string;
    currentSkill?: string;
  }
): Promise<string> {
  const systemPrompt = `你是 Evolv Platform 的 AI 学习助手，一位友好、专业的技能学习顾问。
你的目标是帮助用户解决学习中遇到的问题，提供建议和指导。

要求：
1. 语气友好、鼓励
2. 回答简洁、实用
3. 提供具体的行动建议
4. 可以适当使用 emoji
${context?.currentSkill ? `5. 用户当前正在学习：${context.currentSkill}` : ''}`;

  const response = await callGrokCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ], {
    temperature: 0.8,
    max_tokens: 500,
  });

  return response;
}

/**
 * 健康检查
 */
export async function checkGrokAPIHealth(): Promise<boolean> {
  try {
    await callGrokCompletion([
      { role: 'user', content: 'Hello' },
    ], {
      max_tokens: 10,
    });
    return true;
  } catch (error) {
    console.error('Grok API 健康检查失败:', error);
    return false;
  }
}

export default {
  performCareerAssessment,
  recommendSkills,
  generateLearningPath,
  chatWithAI,
  checkGrokAPIHealth,
};
