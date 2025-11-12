import { Question } from '../components/Assessment';

// IT技能题目库
export const itQuestions: Question[] = [
  // 前端开发
  {
    id: 'it-frontend-1',
    skill_id: '11111111-1111-1111-1111-111111111111',
    question_text: '以下哪个HTML标签用于创建无序列表？',
    question_type: 'single_choice',
    options: {
      A: '<ol>',
      B: '<ul>',
      C: '<li>',
      D: '<dl>'
    },
    correct_answer: 'B',
    difficulty: 1,
    skill_points: 10,
    explanation: '<ul>标签用于创建无序列表，<ol>用于有序列表，<li>是列表项，<dl>是定义列表。'
  },
  {
    id: 'it-frontend-2',
    skill_id: 'frontend-dev',
    question_text: 'CSS中用于设置元素边距的属性是？',
    question_type: 'single_choice',
    options: {
      A: 'padding',
      B: 'margin',
      C: 'border',
      D: 'spacing'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: 'margin用于设置外边距，padding用于设置内边距。'
  },
  {
    id: 'it-frontend-3',
    skill_id: 'frontend-dev',
    question_text: 'JavaScript中，以下哪些是数组方法？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: 'push()',
      B: 'pop()',
      C: 'map()',
      D: 'length',
      E: 'forEach()'
    },
    correct_answer: ['A', 'B', 'C', 'E'],
    difficulty: 3,
    skill_points: 20,
    explanation: 'push()、pop()、map()、forEach()都是数组方法，length是数组属性。'
  },
  {
    id: 'it-frontend-4',
    skill_id: 'frontend-dev',
    question_text: '请填写React组件中用于处理状态更新的Hook名称：use_____',
    question_type: 'fill_blank',
    correct_answer: 'State',
    difficulty: 2,
    skill_points: 15,
    explanation: 'React中使用useState Hook来管理组件状态。'
  },

  // 后端开发
  {
    id: 'it-backend-1',
    skill_id: 'backend-dev',
    question_text: 'RESTful API中，GET请求通常用于什么操作？',
    question_type: 'single_choice',
    options: {
      A: '创建资源',
      B: '获取资源',
      C: '更新资源',
      D: '删除资源'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: 'GET请求用于获取资源，POST用于创建，PUT用于更新，DELETE用于删除。'
  },
  {
    id: 'it-backend-2',
    skill_id: 'backend-dev',
    question_text: '以下哪个不是数据库事务的ACID特性？',
    question_type: 'single_choice',
    options: {
      A: 'Atomicity（原子性）',
      B: 'Consistency（一致性）',
      C: 'Isolation（隔离性）',
      D: 'Availability（可用性）'
    },
    correct_answer: 'D',
    difficulty: 4,
    skill_points: 25,
    explanation: 'ACID包括Atomicity、Consistency、Isolation、Durability，没有Availability。'
  },
  {
    id: 'it-backend-3',
    skill_id: 'backend-dev',
    question_text: '请简述什么是API Gateway及其主要作用',
    question_type: 'fill_blank',
    correct_answer: '统一入口|请求路由|流量控制',
    difficulty: 4,
    skill_points: 30,
    explanation: 'API Gateway是系统统一入口，提供请求路由、认证、限流等功能。'
  },

  // 数据库管理
  {
    id: 'it-db-1',
    skill_id: 'database-admin',
    question_text: 'SQL语句中用于查询数据的关键词是？',
    question_type: 'single_choice',
    options: {
      A: 'INSERT',
      B: 'SELECT',
      C: 'UPDATE',
      D: 'DELETE'
    },
    correct_answer: 'B',
    difficulty: 1,
    skill_points: 10,
    explanation: 'SELECT语句用于查询数据，INSERT用于插入，UPDATE用于更新，DELETE用于删除。'
  },
  {
    id: 'it-db-2',
    skill_id: 'database-admin',
    question_text: '数据库索引的主要作用是什么？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '提高查询速度',
      B: '保证数据唯一性',
      C: '减少存储空间',
      D: '加快排序操作',
      E: '提高写入速度'
    },
    correct_answer: ['A', 'B', 'D'],
    difficulty: 3,
    skill_points: 20,
    explanation: '索引可以提高查询速度、保证唯一性、加快排序，但会增加存储空间且可能降低写入速度。'
  },
  {
    id: 'it-db-3',
    skill_id: 'database-admin',
    question_text: '请写出MySQL中创建数据库的SQL语句：_____ DATABASE mydb;',
    question_type: 'fill_blank',
    correct_answer: 'CREATE',
    difficulty: 2,
    skill_points: 15,
    explanation: '使用CREATE DATABASE语句创建新数据库。'
  },

  // DevOps
  {
    id: 'it-devops-1',
    skill_id: 'devops',
    question_text: 'Docker容器与虚拟机的主要区别是什么？',
    question_type: 'single_choice',
    options: {
      A: 'Docker更轻量，共享主机内核',
      B: 'Docker更重，需要更多资源',
      C: 'Docker只能运行Linux应用',
      D: 'Docker不需要操作系统'
    },
    correct_answer: 'A',
    difficulty: 3,
    skill_points: 20,
    explanation: 'Docker容器更轻量，共享主机内核，而虚拟机需要完整的Guest OS。'
  },
  {
    id: 'it-devops-2',
    skill_id: 'devops',
    question_text: 'CI/CD流程中的主要环节包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '代码提交',
      B: '自动测试',
      C: '构建打包',
      D: '自动部署',
      E: '监控告警'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: 'CI/CD包括代码提交、自动测试、构建、部署和监控等完整流程。'
  },
  {
    id: 'it-devops-3',
    skill_id: 'devops',
    question_text: 'Git中用于创建新分支并切换到该分支的命令是：git _____ branch-name',
    question_type: 'fill_blank',
    correct_answer: 'checkout -b',
    difficulty: 3,
    skill_points: 20,
    explanation: 'git checkout -b 创建并切换到新分支，也可用git switch -c（新版本）。'
  },

  // 网络安全
  {
    id: 'it-security-1',
    skill_id: 'cybersecurity',
    question_text: '以下哪个是常见的Web应用安全漏洞？',
    question_type: 'single_choice',
    options: {
      A: 'SQL注入',
      B: 'XSS攻击',
      C: 'CSRF攻击',
      D: '以上都是'
    },
    correct_answer: 'D',
    difficulty: 3,
    skill_points: 20,
    explanation: 'SQL注入、XSS、CSRF都是常见的Web应用安全漏洞。'
  },
  {
    id: 'it-security-2',
    skill_id: 'cybersecurity',
    question_text: 'HTTPS协议比HTTP协议更安全的主要原因是什么？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '使用SSL/TLS加密',
      B: '验证服务器身份',
      C: '防止数据篡改',
      D: '提高传输速度',
      E: '支持更多端口'
    },
    correct_answer: ['A', 'B', 'C'],
    difficulty: 4,
    skill_points: 25,
    explanation: 'HTTPS通过SSL/TLS提供加密、身份验证和数据完整性保护。'
  },
  {
    id: 'it-security-3',
    skill_id: 'cybersecurity',
    question_text: '请解释什么是零信任安全模型',
    question_type: 'fill_blank',
    correct_answer: '永不信任|始终验证|最小权限',
    difficulty: 5,
    skill_points: 35,
    explanation: '零信任模型的核心原则是"永不信任，始终验证"，实施最小权限原则。'
  }
];

// 运营技能题目库
export const operationsQuestions: Question[] = [
  // 内容运营
  {
    id: 'ops-content-1',
    skill_id: 'content-ops',
    question_text: '内容运营的核心目标是什么？',
    question_type: 'single_choice',
    options: {
      A: '提高用户活跃度',
      B: '增加内容产量',
      C: '降低运营成本',
      D: '扩大团队规模'
    },
    correct_answer: 'A',
    difficulty: 2,
    skill_points: 15,
    explanation: '内容运营的核心目标是通过优质内容提高用户活跃度和粘性。'
  },
  {
    id: 'ops-content-2',
    skill_id: 'content-ops',
    question_text: '以下哪些是内容运营的关键指标？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '阅读量/播放量',
      B: '点赞/评论/分享',
      C: '用户停留时间',
      D: '转化率',
      E: '内容生产成本'
    },
    correct_answer: ['A', 'B', 'C', 'D'],
    difficulty: 3,
    skill_points: 20,
    explanation: '内容运营关注用户参与度和转化效果，生产成本是运营考虑因素之一。'
  },
  {
    id: 'ops-content-3',
    skill_id: 'content-ops',
    question_text: '请简述内容运营中的用户画像分析作用',
    question_type: 'fill_blank',
    correct_answer: '精准定位|内容定制|提升效果',
    difficulty: 3,
    skill_points: 25,
    explanation: '用户画像帮助精准定位目标用户，定制化内容，提升运营效果。'
  },

  // 数据运营
  {
    id: 'ops-data-1',
    skill_id: 'data-ops',
    question_text: '数据分析中，PV和UV分别代表什么？',
    question_type: 'single_choice',
    options: {
      A: 'PV=页面访问量，UV=独立访客数',
      B: 'PV=产品销量，UV=用户评价',
      C: 'PV=利润值，UV=用户价值',
      D: 'PV=推广效果，UV=用户增长率'
    },
    correct_answer: 'A',
    difficulty: 2,
    skill_points: 15,
    explanation: 'PV(Page View)指页面浏览量，UV(Unique Visitor)指独立访客数。'
  },
  {
    id: 'ops-data-2',
    skill_id: 'data-ops',
    question_text: 'A/B测试的主要步骤包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '确定测试目标',
      B: '设计对照组和实验组',
      C: '实施测试方案',
      D: '收集和分析数据',
      E: '得出结论并应用'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: 'A/B测试需要完整的实验设计、执行、分析和应用的闭环流程。'
  },
  {
    id: 'ops-data-3',
    skill_id: 'data-ops',
    question_text: '数据分析中，什么是漏斗分析？',
    question_type: 'fill_blank',
    correct_answer: '转化路径|环节流失|优化流程',
    difficulty: 3,
    skill_points: 20,
    explanation: '漏斗分析用于分析用户转化路径，识别各环节的流失情况。'
  },

  // 用户运营
  {
    id: 'ops-user-1',
    skill_id: 'user-ops',
    question_text: '用户生命周期通常包括哪些阶段？',
    question_type: 'single_choice',
    options: {
      A: '新用户-活跃用户-沉默用户-流失用户',
      B: '新用户-付费用户-VIP用户-流失用户',
      C: '访客-注册用户-活跃用户-忠实用户',
      D: '潜在用户-目标用户-现有用户-流失用户'
    },
    correct_answer: 'A',
    difficulty: 2,
    skill_points: 15,
    explanation: '用户生命周期包括新用户、活跃用户、沉默用户和流失用户四个阶段。'
  },
  {
    id: 'ops-user-2',
    skill_id: 'user-ops',
    question_text: '用户留存率常用的计算方式是？',
    question_type: 'single_choice',
    options: {
      A: '留存用户数 / 总用户数',
      B: '流失用户数 / 总用户数',
      C: '新增用户数 / 活跃用户数',
      D: '付费用户数 / 注册用户数'
    },
    correct_answer: 'A',
    difficulty: 3,
    skill_points: 20,
    explanation: '留存率 = 留存用户数 / 总用户数，反映产品保持用户的能力。'
  },
  {
    id: 'ops-user-3',
    skill_id: 'user-ops',
    question_text: '提升用户留存率的有效策略有哪些？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '优化产品体验',
      B: '建立用户激励体系',
      C: '个性化内容推荐',
      D: '社区运营和互动',
      E: '持续的产品迭代'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 4,
    skill_points: 30,
    explanation: '提升留存需要从产品、内容、运营等多个维度综合施策。'
  },

  // 社群运营
  {
    id: 'ops-community-1',
    skill_id: 'community-ops',
    question_text: '社群运营的主要目标是什么？',
    question_type: 'single_choice',
    options: {
      A: '扩大社群规模',
      B: '提升用户活跃度',
      C: '增强用户粘性',
      D: '实现商业转化'
    },
    correct_answer: 'D',
    difficulty: 3,
    skill_points: 20,
    explanation: '社群运营的最终目标是实现商业转化，如销售、获客等。'
  },
  {
    id: 'ops-community-2',
    skill_id: 'community-ops',
    question_text: '以下哪些是有效的社群活跃策略？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '定期话题讨论',
      B: '专家分享活动',
      C: '用户UGC激励',
      D: '福利和抽奖',
      E: '社群打卡活动'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: '社群活跃需要多样化的运营手段，激发用户参与和贡献。'
  },
  {
    id: 'ops-community-3',
    skill_id: 'community-ops',
    question_text: '请说明KOL在社群运营中的作用',
    question_type: 'fill_blank',
    correct_answer: '引领话题|增加权威性|扩大影响力',
    difficulty: 3,
    skill_points: 20,
    explanation: 'KOL可以引领话题讨论，增加内容权威性，扩大社群影响力。'
  }
];

// 产品技能题目库
export const productQuestions: Question[] = [
  // 产品设计
  {
    id: 'prod-design-1',
    skill_id: 'product-design',
    question_text: '用户体验（UX）设计的核心原则是什么？',
    question_type: 'single_choice',
    options: {
      A: '美观优先',
      B: '功能优先',
      C: '以用户为中心',
      D: '技术优先'
    },
    correct_answer: 'C',
    difficulty: 2,
    skill_points: 15,
    explanation: 'UX设计以用户为中心，关注用户需求和使用体验。'
  },
  {
    id: 'prod-design-2',
    skill_id: 'product-design',
    question_text: '产品原型设计的主要类型包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '线框图',
      B: '流程图',
      C: '交互原型',
      D: '视觉设计稿',
      E: '技术架构图'
    },
    correct_answer: ['A', 'B', 'C', 'D'],
    difficulty: 3,
    skill_points: 20,
    explanation: '产品原型包括线框图、流程图、交互原型和视觉设计稿。'
  },
  {
    id: 'prod-design-3',
    skill_id: 'product-design',
    question_text: '请简述什么是用户旅程地图（User Journey Map）',
    question_type: 'fill_blank',
    correct_answer: '用户路径|体验流程|痛点识别',
    difficulty: 4,
    skill_points: 25,
    explanation: '用户旅程地图展示用户完整体验流程，帮助识别痛点和机会点。'
  },

  // 产品分析
  {
    id: 'prod-analysis-1',
    skill_id: 'product-analysis',
    question_text: '产品分析中，什么是MVP（最小可行产品）？',
    question_type: 'single_choice',
    options: {
      A: '功能最少的产品',
      B: '能验证核心假设的最小功能集合',
      C: '成本最低的产品',
      D: '开发周期最短的产品'
    },
    correct_answer: 'B',
    difficulty: 3,
    skill_points: 20,
    explanation: 'MVP是能验证核心商业假设的最小功能集合，用于快速验证产品价值。'
  },
  {
    id: 'prod-analysis-2',
    skill_id: 'product-analysis',
    question_text: '产品功能优先级评估可以使用哪些方法？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: 'Kano模型',
      B: 'RICE评分法',
      C: 'MoSCoW法则',
      D: '四象限法则',
      E: 'SWOT分析'
    },
    correct_answer: ['A', 'B', 'C', 'D'],
    difficulty: 4,
    skill_points: 30,
    explanation: '功能优先级评估可用多种方法，SWOT主要分析企业战略环境。'
  },
  {
    id: 'prod-analysis-3',
    skill_id: 'product-analysis',
    question_text: '产品分析中，如何进行竞品分析？',
    question_type: 'fill_blank',
    correct_answer: '功能对比|优劣势|市场定位',
    difficulty: 3,
    skill_points: 20,
    explanation: '竞品分析包括功能对比、优劣势分析和市场定位研究。'
  },

  // 产品运营
  {
    id: 'prod-ops-1',
    skill_id: 'product-ops',
    question_text: '产品迭代周期通常由什么因素决定？',
    question_type: 'single_choice',
    options: {
      A: '技术开发难度',
      B: '用户反馈和市场变化',
      C: '团队规模大小',
      D: '投资方要求'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: '产品迭代周期主要根据用户反馈和市场变化来确定。'
  },
  {
    id: 'prod-ops-2',
    skill_id: 'product-ops',
    question_text: '产品上线后的关键监控指标包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '日活跃用户数（DAU）',
      B: '用户留存率',
      C: '功能使用率',
      D: '用户反馈评分',
      E: '技术错误率'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: '产品监控需要关注用户行为、留存、使用体验和技术稳定性。'
  },
  {
    id: 'prod-ops-3',
    skill_id: 'product-ops',
    question_text: '请说明产品运营中的A/B测试设计要点',
    question_type: 'fill_blank',
    correct_answer: '变量控制|样本分组|统计显著性',
    difficulty: 4,
    skill_points: 25,
    explanation: 'A/B测试需要严格控制变量、合理分组样本、确保统计显著性。'
  },

  // 商业模式
  {
    id: 'prod-business-1',
    skill_id: 'product-business',
    question_text: '商业模式画布包含几个核心模块？',
    question_type: 'single_choice',
    options: {
      A: '7个',
      B: '8个',
      C: '9个',
      D: '10个'
    },
    correct_answer: 'C',
    difficulty: 2,
    skill_points: 15,
    explanation: '商业模式画布包含9个核心模块：客户细分、价值主张、渠道通路等。'
  },
  {
    id: 'prod-business-2',
    skill_id: 'product-business',
    question_text: '常见的商业模式类型包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '免费增值模式',
      B: '订阅制模式',
      C: '平台模式',
      D: '直销模式',
      E: '硬件+软件模式'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 20,
    explanation: '多种商业模式并存，企业可根据产品特点选择合适的模式。'
  },
  {
    id: 'prod-business-3',
    skill_id: 'product-business',
    question_text: '请简述平台模式的核心特点',
    question_type: 'fill_blank',
    correct_answer: '双边市场|网络效应|价值创造',
    difficulty: 4,
    skill_points: 25,
    explanation: '平台模式连接多边用户，通过网络效应创造价值。'
  }
];

// 数据分析技能题目库
export const dataAnalysisQuestions: Question[] = [
  // 数据收集与清洗
  {
    id: 'data-collect-1',
    skill_id: 'data-analysis',
    question_text: '数据清洗的主要目的是什么？',
    question_type: 'single_choice',
    options: {
      A: '增加数据量',
      B: '提高数据质量',
      C: '降低数据成本',
      D: '加快处理速度'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: '数据清洗的目的是发现并纠正数据中的错误和不一致，提高数据质量。'
  },
  {
    id: 'data-collect-2',
    skill_id: 'data-analysis',
    question_text: '数据异常值检测的方法包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '3σ原则',
      B: '箱型图分析',
      C: '聚类分析',
      D: '业务规则判断',
      E: '统计学检验'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 4,
    skill_points: 30,
    explanation: '异常值检测有多种方法，需要根据数据特点选择合适的方法。'
  },
  {
    id: 'data-collect-3',
    skill_id: 'data-analysis',
    question_text: '请说明ETL在数据处理中的作用',
    question_type: 'fill_blank',
    correct_answer: '数据抽取|数据转换|数据加载',
    difficulty: 3,
    skill_points: 20,
    explanation: 'ETL包括Extract（抽取）、Transform（转换）、Load（加载）三个环节。'
  },

  // 数据分析方法
  {
    id: 'data-method-1',
    skill_id: 'data-analysis',
    question_text: '描述性统计和推断性统计的主要区别是什么？',
    question_type: 'single_choice',
    options: {
      A: '处理数据类型不同',
      B: '描述已发生vs预测未来',
      C: '使用工具不同',
      D: '数据来源不同'
    },
    correct_answer: 'B',
    difficulty: 3,
    skill_points: 20,
    explanation: '描述性统计总结已发生数据的特征，推断性统计用于从样本推断总体。'
  },
  {
    id: 'data-method-2',
    skill_id: 'data-analysis',
    question_text: '相关性分析中，皮尔逊相关系数的取值范围是？',
    question_type: 'single_choice',
    options: {
      A: '0到1',
      B: '-1到1',
      C: '负无穷到正无穷',
      D: '0到正无穷'
    },
    correct_answer: 'B',
    difficulty: 3,
    skill_points: 20,
    explanation: '皮尔逊相关系数取值范围是-1到1，-1为完全负相关，1为完全正相关。'
  },
  {
    id: 'data-method-3',
    skill_id: 'data-analysis',
    question_text: '请简述回归分析的基本原理',
    question_type: 'fill_blank',
    correct_answer: '变量关系|函数拟合|预测建模',
    difficulty: 4,
    skill_points: 25,
    explanation: '回归分析通过建立变量间的数学关系来拟合函数并进行预测。'
  },

  // 数据可视化
  {
    id: 'data-viz-1',
    skill_id: 'data-analysis',
    question_text: '以下哪种图表最适合展示趋势变化？',
    question_type: 'single_choice',
    options: {
      A: '柱状图',
      B: '折线图',
      C: '饼图',
      D: '散点图'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: '折线图最适合展示数据随时间变化的趋势。'
  },
  {
    id: 'data-viz-2',
    skill_id: 'data-analysis',
    question_text: '数据可视化设计应遵循哪些原则？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '简洁明了',
      B: '准确传达',
      C: '美观吸引',
      D: '适合受众',
      E: '交互友好'
    },
    correct_answer: ['A', 'B', 'D'],
    difficulty: 3,
    skill_points: 20,
    explanation: '数据可视化重在准确传达信息，美观和交互是加分项。'
  },
  {
    id: 'data-viz-3',
    skill_id: 'data-analysis',
    question_text: '请说明热力图在数据分析中的应用场景',
    question_type: 'fill_blank',
    correct_answer: '密集数据|关联矩阵|热点分布',
    difficulty: 3,
    skill_points: 20,
    explanation: '热力图适合展示密集数据、关联矩阵和区域热点分布。'
  }
];

// 数字营销技能题目库
export const digitalMarketingQuestions: Question[] = [
  // SEO优化
  {
    id: 'seo-1',
    skill_id: 'digital-marketing',
    question_text: 'SEO优化中，关键词密度控制在多少比较合适？',
    question_type: 'single_choice',
    options: {
      A: '1-3%',
      B: '3-5%',
      C: '5-10%',
      D: '10%以上'
    },
    correct_answer: 'A',
    difficulty: 2,
    skill_points: 15,
    explanation: '关键词密度应控制在1-3%，过高可能被判定为关键词堆砌。'
  },
  {
    id: 'seo-2',
    skill_id: 'digital-marketing',
    question_text: '影响网站排名的主要因素包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '内容质量',
      B: '页面加载速度',
      C: '外链质量',
      D: '用户体验',
      E: '服务器稳定性'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: '网站排名受内容、技术、外链、用户体验等多重因素影响。'
  },
  {
    id: 'seo-3',
    skill_id: 'digital-marketing',
    question_text: '请简述什么是长尾关键词及其优势',
    question_type: 'fill_blank',
    correct_answer: '低竞争|高精准|转化率高',
    difficulty: 3,
    skill_points: 20,
    explanation: '长尾关键词竞争小、搜索意图明确、转化率相对较高。'
  },

  // 广告投放
  {
    id: 'ads-1',
    skill_id: 'digital-marketing',
    question_text: 'CTR在广告投放中代表什么指标？',
    question_type: 'single_choice',
    options: {
      A: '点击转化率',
      B: '点击率',
      C: '展示转化率',
      D: '广告投资回报率'
    },
    correct_answer: 'B',
    difficulty: 2,
    skill_points: 15,
    explanation: 'CTR(Click-Through Rate)是点击率，表示广告被点击的次数除以展示次数。'
  },
  {
    id: 'ads-2',
    skill_id: 'digital-marketing',
    question_text: '程序化广告的核心特征包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '自动化投放',
      B: '精准定向',
      C: '实时竞价',
      D: '效果可衡量',
      E: '跨媒体覆盖'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 4,
    skill_points: 30,
    explanation: '程序化广告具有自动化、精准性、实时性、可测量和跨媒体等特征。'
  },
  {
    id: 'ads-3',
    skill_id: 'digital-marketing',
    question_text: '请说明CPC和CPM两种计费方式的区别',
    question_type: 'fill_blank',
    correct_answer: '按点击付费|按展示付费',
    difficulty: 3,
    skill_points: 20,
    explanation: 'CPC按点击付费，CPM按千次展示付费，适用不同营销目标。'
  },

  // 社交媒体营销
  {
    id: 'social-1',
    skill_id: 'digital-marketing',
    question_text: '社交媒体营销中，UGC指的是什么？',
    question_type: 'single_choice',
    options: {
      A: '用户生成内容',
      B: '品牌官方内容',
      C: '付费推广内容',
      D: '网红推荐内容'
    },
    correct_answer: 'A',
    difficulty: 2,
    skill_points: 15,
    explanation: 'UGC(User Generated Content)指用户自发产生的内容。'
  },
  {
    id: 'social-2',
    skill_id: 'digital-marketing',
    question_text: '有效的社交媒体内容策略包括？（多选）',
    question_type: 'multiple_choice',
    options: {
      A: '保持品牌调性',
      B: '定期更新内容',
      C: '互动式内容',
      D: '数据驱动优化',
      E: '跨平台一致性'
    },
    correct_answer: ['A', 'B', 'C', 'D', 'E'],
    difficulty: 3,
    skill_points: 25,
    explanation: '社交媒体内容需要系统性策略，包括调性、频率、互动和数据优化。'
  },
  {
    id: 'social-3',
    skill_id: 'digital-marketing',
    question_text: '请简述社交媒体监测的重要指标',
    question_type: 'fill_blank',
    correct_answer: '提及量|情感分析|传播范围',
    difficulty: 3,
    skill_points: 20,
    explanation: '社交媒体监测关注品牌提及量、情感倾向和传播影响范围。'
  }
];

// 合并所有题目库
export const allQuestions: Question[] = [
  ...itQuestions,
  ...operationsQuestions,
  ...productQuestions,
  ...dataAnalysisQuestions,
  ...digitalMarketingQuestions
];

// 按技能分类的题目映射
export const questionBankBySkill = {
  '11111111-1111-1111-1111-111111111111': itQuestions.filter(q => q.skill_id === '11111111-1111-1111-1111-111111111111'),
  '22222222-2222-2222-2222-222222222222': itQuestions.filter(q => q.skill_id === '22222222-2222-2222-2222-222222222222'),
  '33333333-3333-3333-3333-333333333333': itQuestions.filter(q => q.skill_id === '33333333-3333-3333-3333-333333333333'),
  '44444444-4444-4444-4444-444444444444': itQuestions.filter(q => q.skill_id === '44444444-4444-4444-4444-444444444444'),
  '55555555-5555-5555-5555-555555555555': itQuestions.filter(q => q.skill_id === '55555555-5555-5555-5555-555555555555'),
  'content-ops': operationsQuestions.filter(q => q.skill_id === 'content-ops'),
  'data-ops': operationsQuestions.filter(q => q.skill_id === 'data-ops'),
  'user-ops': operationsQuestions.filter(q => q.skill_id === 'user-ops'),
  'community-ops': operationsQuestions.filter(q => q.skill_id === 'community-ops'),
  'product-design': productQuestions.filter(q => q.skill_id === 'product-design'),
  'product-analysis': productQuestions.filter(q => q.skill_id === 'product-analysis'),
  'product-ops': productQuestions.filter(q => q.skill_id === 'product-ops'),
  'product-business': productQuestions.filter(q => q.skill_id === 'product-business'),
  'data-analysis': dataAnalysisQuestions,
  'digital-marketing': digitalMarketingQuestions
};

// 技能等级评估算法
export class SkillAssessmentAlgorithm {
  static calculateScore(answers: UserAnswer[], questions: Question[]): {
    totalScore: number;
    levelScore: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  } {
    const totalQuestions = questions.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const baseScore = Math.round((correctAnswers / totalQuestions) * 100);

    // 计算加权得分（考虑难度和技能点）
    let weightedScore = 0;
    let totalSkillPoints = 0;
    let earnedSkillPoints = 0;

    questions.forEach((question, index) => {
      totalSkillPoints += question.skill_points;
      if (answers[index]?.isCorrect) {
        earnedSkillPoints += question.skill_points;
      }
    });

    const skillPointsRatio = earnedSkillPoints / totalSkillPoints;
    weightedScore = Math.round((baseScore * 0.7 + skillPointsRatio * 100 * 0.3));

    // 确定技能等级
    let skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    if (weightedScore >= 85) {
      skillLevel = 'expert';
    } else if (weightedScore >= 70) {
      skillLevel = 'advanced';
    } else if (weightedScore >= 50) {
      skillLevel = 'intermediate';
    } else {
      skillLevel = 'beginner';
    }

    // 分析强项和改进点
    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    // 按题型分析
    const questionTypes = {
      single_choice: answers.filter((a, i) => questions[i].question_type === 'single_choice'),
      multiple_choice: answers.filter((a, i) => questions[i].question_type === 'multiple_choice'),
      fill_blank: answers.filter((a, i) => questions[i].question_type === 'fill_blank'),
      code: answers.filter((a, i) => questions[i].question_type === 'code')
    };

    Object.entries(questionTypes).forEach(([type, typeAnswers]) => {
      if (typeAnswers.length > 0) {
        const typeScore = typeAnswers.filter(a => a.isCorrect).length / typeAnswers.length * 100;
        const typeName = {
          single_choice: '单选题',
          multiple_choice: '多选题',
          fill_blank: '填空题',
          code: '编程题'
        }[type];

        if (typeScore >= 80) {
          strengths.push(`${typeName}掌握优秀`);
        } else if (typeScore < 60) {
          improvements.push(`${typeName}需要加强`);
          recommendations.push(`建议重点练习${typeName}相关知识点`);
        }
      }
    });

    // 按难度分析
    const difficultyLevels = {
      1: answers.filter((a, i) => questions[i].difficulty === 1),
      2: answers.filter((a, i) => questions[i].difficulty === 2),
      3: answers.filter((a, i) => questions[i].difficulty === 3),
      4: answers.filter((a, i) => questions[i].difficulty === 4),
      5: answers.filter((a, i) => questions[i].difficulty === 5)
    };

    Object.entries(difficultyLevels).forEach(([level, levelAnswers]) => {
      if (levelAnswers.length > 0) {
        const levelScore = levelAnswers.filter(a => a.isCorrect).length / levelAnswers.length * 100;
        if (parseInt(level) >= 4 && levelScore < 60) {
          improvements.push(`高级难度题目表现需要提升`);
          recommendations.push('建议系统学习高级概念和实践项目');
        }
      }
    });

    return {
      totalScore: weightedScore,
      levelScore: baseScore,
      skillLevel,
      strengths,
      improvements,
      recommendations
    };
  }
}

// 导出用户答案接口
export interface UserAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
  isCorrect: boolean;
}