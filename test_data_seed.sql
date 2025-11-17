-- 基础技能测试数据
INSERT INTO skills (id, name, description, category, level, prerequisites) VALUES 
('skill-js-001', 'JavaScript基础', 'JavaScript编程语言基础知识', '前端开发', 1, null),
('skill-react-001', 'React框架', 'React前端框架开发技能', '前端开发', 2, '["skill-js-001"]'),
('skill-node-001', 'Node.js后端', 'Node.js后端开发技能', '后端开发', 2, '["skill-js-001"]'),
('skill-db-001', '数据库设计', '关系型和非关系型数据库设计', '数据存储', 1, null),
('skill-ai-001', '人工智能基础', 'AI和机器学习基础概念', '人工智能', 1, null),
('skill-python-001', 'Python编程', 'Python编程语言技能', '编程语言', 1, null),
('skill-ux-001', '用户体验设计', 'UI/UX设计原理和实践', '设计', 1, null),
('skill-devops-001', 'DevOps实践', '持续集成和部署实践', '工程化', 2, '["skill-node-001"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  prerequisites = EXCLUDED.prerequisites;

-- 基础测评题目
INSERT INTO questions (id, skill_id, question_text, options, correct_answer, difficulty, is_approved) VALUES 
('q-js-001', 'skill-js-001', 'JavaScript中typeof null的结果是什么？', 
 '{"A": "null", "B": "object", "C": "undefined", "D": "number"}', 'B', 2, true),
('q-js-002', 'skill-js-001', '以下哪个不是JavaScript的数据类型？', 
 '{"A": "String", "B": "Boolean", "C": "Character", "D": "Number"}', 'C', 1, true),
('q-react-001', 'skill-react-001', 'React中的虚拟DOM是什么？', 
 '{"A": "一个真实的DOM", "B": "DOM的内存表示", "C": "CSS样式表", "D": "HTML文件"}', 'B', 3, true),
('q-react-002', 'skill-react-001', 'useState Hook的作用是什么？', 
 '{"A": "创建状态变量", "B": "创建路由", "C": "创建样式", "D": "创建组件"}', 'A', 2, true),
('q-python-001', 'skill-python-001', 'Python中如何定义函数？', 
 '{"A": "func", "B": "function", "C": "def", "D": "define"}', 'C', 1, true),
('q-db-001', 'skill-db-001', 'SQL中用于查询数据的语句是？', 
 '{"A": "INSERT", "B": "UPDATE", "C": "SELECT", "D": "DELETE"}', 'C', 1, true),
('q-ai-001', 'skill-ai-001', '机器学习的三个主要类型是？', 
 '{"A": "监督、无监督、半监督", "B": "训练、测试、验证", "C": "分类、回归、聚类", "D": "线性、非线性、混合"}', 'A', 3, true),
('q-ux-001', 'skill-ux-001', '用户体验设计的核心原则是？', 
 '{"A": "美观第一", "B": "功能完整", "C": "以用户为中心", "D": "快速开发"}', 'C', 2, true)
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  difficulty = EXCLUDED.difficulty,
  is_approved = EXCLUDED.is_approved;

-- 基础徽章数据（如果不存在）
INSERT INTO badges (id, name, description, rarity, category, icon_url, points, criteria) VALUES 
('badge-first-login', '初来乍到', '完成首次登录', 'common', 'milestone', null, 10, '{"action": "first_login"}'),
('badge-first-assessment', '勇敢尝试', '完成第一次技能测评', 'common', 'skill', null, 20, '{"action": "first_assessment"}'),
('badge-skill-master', '技能达人', '通过任意技能测评', 'rare', 'skill', null, 50, '{"action": "skill_pass"}'),
('badge-fast-learner', '快速学习者', '在5分钟内完成测评', 'rare', 'learning', null, 30, '{"action": "fast_completion"}'),
('badge-perfectionist', '完美主义者', '测评获得满分', 'epic', 'achievement', null, 100, '{"action": "perfect_score"}'),
('badge-explorer', '探索者', '尝试5种不同技能测评', 'rare', 'learning', null, 75, '{"action": "skill_variety"}')
ON CONFLICT (id) DO NOTHING;