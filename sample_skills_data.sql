-- 插入示例技能数据
INSERT INTO skills (name, category, description, level_required, market_demand, prerequisites, difficulty_level, estimated_learning_time) VALUES
-- 编程技能
('JavaScript', '编程语言', 'Web前端开发的核心编程语言，用于创建交互式网页', 1, 95, '{}', 2, 80),
('Python', '编程语言', '通用编程语言，适用于数据分析、人工智能、Web开发等领域', 1, 90, '{}', 2, 100),
('Java', '编程语言', '企业级应用开发的主流语言，Android开发基础', 1, 85, '{}', 3, 120),
('TypeScript', '编程语言', 'JavaScript的超集，添加了静态类型支持', 2, 85, '{"JavaScript"}', 3, 60),
('React', '前端框架', '流行的前端UI库，用于构建用户界面', 2, 90, '{"JavaScript", "HTML", "CSS"}', 3, 80),
('Vue.js', '前端框架', '渐进式JavaScript框架，易于学习和使用', 2, 80, '{"JavaScript", "HTML", "CSS"}', 3, 70),
('Node.js', '后端技术', 'JavaScript运行时环境，用于服务器端开发', 3, 85, '{"JavaScript"}', 4, 100),
('Express.js', '后端框架', 'Node.js的Web应用框架', 3, 80, '{"Node.js"}', 4, 60),

-- 数据技能
('SQL', '数据库', '结构化查询语言，用于数据库操作', 1, 85, '{}', 2, 40),
('MongoDB', '数据库', 'NoSQL文档数据库', 2, 75, '{"SQL"}', 3, 60),
('PostgreSQL', '数据库', '开源关系型数据库管理系统', 2, 70, '{"SQL"}', 3, 50),
('MySQL', '数据库', '流行的开源关系型数据库', 2, 80, '{"SQL"}', 2, 40),

-- 数据分析和机器学习
('数据分析', '数据科学', '使用统计方法和工具分析数据', 2, 85, '{"Python", "SQL"}', 3, 100),
('机器学习', '人工智能', '让计算机从数据中学习的技术', 3, 90, '{"Python", "数据分析", "统计学"}', 4, 200),
('深度学习', '人工智能', '基于神经网络的机器学习方法', 4, 85, '{"机器学习", "Python"}', 5, 300),
('自然语言处理', '人工智能', '使计算机理解和生成人类语言', 4, 80, '{"机器学习", "深度学习"}', 5, 250),
('计算机视觉', '人工智能', '使计算机理解和分析视觉信息', 4, 85, '{"机器学习", "深度学习"}', 5, 250),

-- 设计技能
('UI设计', '设计', '用户界面设计，关注视觉效果和用户体验', 1, 75, '{}', 2, 120),
('UX设计', '设计', '用户体验设计，关注产品的易用性和用户满意度', 2, 80, '{"UI设计"}', 3, 150),
('Figma', '设计工具', '专业的UI/UX设计工具', 1, 70, '{"UI设计"}', 2, 40),
('Adobe Photoshop', '设计工具', '图像处理和设计软件', 1, 85, '{}', 2, 60),
('Adobe Illustrator', '设计工具', '矢量图形设计软件', 2, 80, '{"Adobe Photoshop"}', 3, 80),

-- 产品和项目管理
('产品管理', '管理', '负责产品的规划、开发、发布和优化', 3, 75, '{}', 3, 100),
('敏捷开发', '项目管理', '现代软件开发方法论', 2, 70, '{}', 2, 40),
('Scrum', '项目管理', '敏捷开发的框架之一', 2, 70, '{"敏捷开发"}', 3, 50),
('需求分析', '产品', '分析用户需求并转化为产品功能', 2, 80, '{}', 3, 80),

-- 软技能
('沟通能力', '软技能', '有效表达和理解信息的能力', 1, 90, '{}', 1, 0),
('团队协作', '软技能', '与他人有效合作完成目标的能力', 1, 85, '{"沟通能力"}', 2, 0),
('时间管理', '软技能', '合理安排和使用时间的能力', 1, 80, '{}', 2, 0),
('领导力', '软技能', '影响和指导他人实现目标的能力', 3, 75, '{"团队协作", "沟通能力"}', 4, 0),
('项目管理', '管理', '规划、组织和协调项目资源的能力', 3, 80, '{"团队协作", "时间管理"}', 4, 120),

-- 云技术和DevOps
('AWS', '云计算', '亚马逊云服务平台', 3, 85, '{"Linux", "网络基础"}', 4, 150),
('Docker', '容器技术', '应用程序容器化平台', 3, 80, '{"Linux", "命令行"}', 3, 60),
('Kubernetes', '容器编排', '容器编排和管理平台', 4, 75, '{"Docker", "Linux"}', 4, 100),
('CI/CD', 'DevOps', '持续集成和持续部署', 3, 80, '{"Docker", "版本控制"}', 4, 80),

-- 移动开发
('React Native', '移动开发', '跨平台移动应用开发框架', 3, 80, '{"React", "JavaScript"}', 4, 120),
('Flutter', '移动开发', 'Google的跨平台移动应用开发框架', 3, 75, '{"Dart"}', 4, 120),
('Android开发', '移动开发', 'Android平台原生应用开发', 3, 85, '{"Java", "Kotlin"}', 4, 150),
('iOS开发', '移动开发', 'iOS平台原生应用开发', 3, 80, '{"Swift"}', 4, 150);

-- 插入示例问题数据
INSERT INTO questions (skill_id, question_text, options, correct_answer, difficulty, is_approved, created_by) 
SELECT 
  s.id,
  CASE 
    WHEN s.name = 'JavaScript' THEN 'JavaScript中，以下哪个是正确的变量声明方式？'
    WHEN s.name = 'Python' THEN 'Python中，以下哪个是正确的列表定义方式？'
    WHEN s.name = 'SQL' THEN 'SQL中，用于从表中选择数据的语句是？'
    WHEN s.name = 'React' THEN 'React中，用于渲染列表数据的函数是？'
    WHEN s.name = '数据分析' THEN '数据分析过程中，数据的清理通常包括以下哪些步骤？'
    ELSE CONCAT(s.name, '相关的基础知识问题')
  END as question_text,
  CASE 
    WHEN s.name = 'JavaScript' THEN '{"a": "var x = 5;", "b": "variable x = 5;", "c": "x := 5;", "d": "define x = 5;"}'
    WHEN s.name = 'Python' THEN '{"a": "list = [1, 2, 3]", "b": "list = (1, 2, 3)", "c": "list = {1, 2, 3}", "d": "list = 1, 2, 3"}'
    WHEN s.name = 'SQL' THEN '{"a": "GET", "b": "SELECT", "c": "FETCH", "d": "READ"}'
    WHEN s.name = 'React' THEN '{"a": "map()", "b": "forEach()", "c": "filter()", "d": "reduce()"}'
    WHEN s.name = '数据分析' THEN '{"a": "删除空值和重复值", "b": "格式化日期", "c": "数据转换", "d": "以上都是"}'
    ELSE '{"a": "选项A", "b": "选项B", "c": "选项C", "d": "选项D"}'
  END as options,
  CASE 
    WHEN s.name = 'JavaScript' THEN 'a'
    WHEN s.name = 'Python' THEN 'a'
    WHEN s.name = 'SQL' THEN 'b'
    WHEN s.name = 'React' THEN 'a'
    WHEN s.name = '数据分析' THEN 'd'
    ELSE 'a'
  END as correct_answer,
  CASE 
    WHEN s.difficulty_level <= 2 THEN 1
    WHEN s.difficulty_level <= 3 THEN 2
    ELSE 3
  END as difficulty,
  true as is_approved,
  (SELECT id FROM auth.users LIMIT 1) as created_by
FROM skills s
WHERE s.name IN ('JavaScript', 'Python', 'SQL', 'React', '数据分析');