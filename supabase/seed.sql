-- Sample data for PathFinder

-- Insert sample user
INSERT INTO users (id, email, username, avatar_url, bio, current_career, career_confusion_level, interested_categories)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'demo@pathfinder.com', 'demo_user', null, '正在探索职业方向的迷茫者', '产品经理', 7, ARRAY['产品', '设计', '运营']);

-- Insert sample contents
INSERT INTO contents (title, category, truth_sentence, daily_timeline, highlight_moments, collapse_moments, skill_radar, tags, author_id)
VALUES
  (
    '产品经理的真实一天',
    '产品',
    '不是每天都在开会，但确实经常在协调各方需求',
    '[{"time":"09:00","activity":"查看数据报表，分析用户行为","mood":"neutral"},{"time":"10:30","activity":"需求评审会议","mood":"negative"},{"time":"14:00","activity":"与设计师讨论交互方案","mood":"positive"},{"time":"16:00","activity":"撰写PRD文档","mood":"neutral"},{"time":"18:30","activity":"临时处理线上问题","mood":"negative"}]'::jsonb,
    '[{"title":"用户反馈被采纳","description":"提出的新功能获得团队认可"},{"title":"数据增长","description":"新版本上线后DAU提升15%"}]'::jsonb,
    '[{"title":"需求被技术否决","description":"因技术难度过高，精心设计的功能被迫砍掉"},{"title":"加班到深夜","description":"为了赶项目进度，连续一周加班到凌晨"}]'::jsonb,
    '{"creativity":7,"logic":8,"communication":9,"stress_resistance":6,"learning_ability":8}'::jsonb,
    ARRAY['产品经理', 'B端', '数据分析'],
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'UI设计师的日常工作',
    '设计',
    '设计不只是画图，更多时间在理解需求和沟通妥协',
    '[{"time":"09:30","activity":"浏览设计网站找灵感","mood":"positive"},{"time":"11:00","activity":"设计新功能界面","mood":"positive"},{"time":"14:00","activity":"与产品讨论改稿","mood":"negative"},{"time":"16:30","activity":"切图标注","mood":"neutral"},{"time":"17:30","activity":"参与设计评审","mood":"neutral"}]'::jsonb,
    '[{"title":"作品被表扬","description":"设计方案得到CEO认可"},{"title":"Dribbble点赞破千","description":"个人作品在社区获得好评"}]'::jsonb,
    '[{"title":"反复改稿","description":"一个按钮颜色改了20次"},{"title":"设计被质疑","description":"辛苦设计的方案被说不够''高级''"}]'::jsonb,
    '{"creativity":9,"logic":6,"communication":7,"stress_resistance":5,"learning_ability":8}'::jsonb,
    ARRAY['UI设计', '视觉设计', 'Figma'],
    '11111111-1111-1111-1111-111111111111'
  );

-- Insert sample tasks
INSERT INTO tasks (title, category, difficulty, duration_minutes, description, steps, skill_dimensions, tags)
VALUES
  (
    '体验产品经理：设计一个To-Do应用',
    '产品',
    'easy',
    30,
    '通过设计一个简单的待办事项应用，体验产品经理的需求分析和功能设计流程',
    '[{"step_number":1,"title":"了解用户需求","content":"阅读用户调研报告，理解用户痛点","type":"info"},{"step_number":2,"title":"竞品分析","content":"分析3款主流To-Do应用的功能特点","type":"info"},{"step_number":3,"title":"功能设计","content":"设计核心功能列表和优先级","type":"action"},{"step_number":4,"title":"撰写PRD","content":"完成产品需求文档","type":"submit"},{"step_number":5,"title":"AI评估","content":"获得AI反馈和能力评分","type":"feedback"}]'::jsonb,
    '["需求分析","逻辑思维","文档撰写"]'::jsonb,
    ARRAY['产品经理', '需求分析', 'PRD']
  ),
  (
    '体验UI设计师：设计登录页面',
    '设计',
    'medium',
    45,
    '设计一个现代化的登录页面，学习UI设计的基本原则和工具使用',
    '[{"step_number":1,"title":"了解设计规范","content":"学习Material Design和iOS设计规范","type":"info"},{"step_number":2,"title":"工具介绍","content":"了解Figma基础操作","type":"tool"},{"step_number":3,"title":"设计登录页","content":"在Figma中设计登录界面","type":"action"},{"step_number":4,"title":"提交设计稿","content":"导出设计稿并提交","type":"submit"},{"step_number":5,"title":"设计评审","content":"获得AI设计反馈","type":"feedback"}]'::jsonb,
    '["视觉设计","工具使用","设计规范"]'::jsonb,
    ARRAY['UI设计', 'Figma', '界面设计']
  );

-- Insert sample story
INSERT INTO stories (user_id, title, category, attempts, failures, discoveries, tags)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '从运营转产品的120天',
    '产品',
    '我尝试了3个月的产品实习，每天观察产品经理的工作方式，主动承担需求文档撰写，参加了所有产品会议。周末还自学了Axure和数据分析。',
    '第一次写PRD被技术吐槽逻辑不清；提出的功能被老板否决了5次；数据分析总是得出错误结论，被数据分析师纠正。',
    '发现产品经理需要超强的沟通能力，不只是画原型图；学会了用数据说话，而不是凭感觉；明白了产品思维和运营思维的本质区别：一个关注"做什么"，一个关注"怎么做"。',
    ARRAY['转行', '产品经理', '运营']
  );
