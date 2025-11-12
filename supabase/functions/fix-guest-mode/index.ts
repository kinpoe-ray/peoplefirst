// 临时Edge Function用于修复游客模式数据库问题
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!supabaseServiceKey || !supabaseUrl) {
      throw new Error('Missing Supabase configuration');
    }

    // 数据库修复SQL
    const sqlCommands = [
      // 创建guest_profiles表
      `CREATE TABLE IF NOT EXISTS guest_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        guest_token TEXT UNIQUE NOT NULL,
        user_type TEXT DEFAULT 'guest' CHECK (user_type IN ('student', 'teacher', 'alumni', 'guest')),
        full_name TEXT,
        avatar_url TEXT,
        school TEXT,
        major TEXT,
        graduation_year INTEGER,
        bio TEXT,
        is_public BOOLEAN DEFAULT true,
        is_guest BOOLEAN DEFAULT true,
        converted_to_user_id UUID,
        converted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // 创建索引
      `CREATE INDEX IF NOT EXISTS idx_guest_profiles_token ON guest_profiles(guest_token);`,
      `CREATE INDEX IF NOT EXISTS idx_guest_profiles_converted ON guest_profiles(converted_to_user_id);`,
      
      // 确保profiles表有正确结构
      `ALTER TABLE profiles 
       ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
       ADD COLUMN IF NOT EXISTS guest_token TEXT,
       ADD COLUMN IF NOT EXISTS converted_to_user_id UUID,
       ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;`,
      
      // 创建skills表
      `CREATE TABLE IF NOT EXISTS skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        level_required INTEGER DEFAULT 1,
        market_demand INTEGER DEFAULT 0,
        prerequisites TEXT[] DEFAULT '{}',
        difficulty_level INTEGER DEFAULT 1,
        learning_resources TEXT[] DEFAULT '{}',
        estimated_learning_time INTEGER DEFAULT 0,
        icon TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // 创建user_skills表
      `CREATE TABLE IF NOT EXISTS user_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        skill_id UUID,
        level INTEGER DEFAULT 1,
        score INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // 创建questions表
      `CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        skill_id UUID,
        question_text TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        difficulty INTEGER DEFAULT 1,
        is_approved BOOLEAN DEFAULT false,
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // 创建badges表
      `CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        skill_id UUID,
        rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
        requirement_score INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
      
      // 创建user_badges表
      `CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        badge_id UUID,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, badge_id)
      );`,
      
      // 插入基础技能数据
      `INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
       VALUES 
       ('JavaScript', '编程语言', 'Web前端开发的核心编程语言', 1, 95, 2),
       ('React', '前端框架', '流行的前端UI库', 2, 90, 3),
       ('Python', '编程语言', '通用编程语言', 1, 90, 2),
       ('UI设计', '设计', '用户界面设计', 1, 75, 2)
       ON CONFLICT (name) DO NOTHING;`
    ];

    // 执行SQL命令
    const results = [];
    for (const sql of sqlCommands) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.push({ sql, status: 'error', error: errorText });
        } else {
          results.push({ sql, status: 'success' });
        }
      } catch (err) {
        results.push({ sql, status: 'error', error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database fix executed',
        results: results 
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }
});