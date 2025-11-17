#!/usr/bin/env python3
"""
通过Supabase REST API修复数据库
"""
import os
import json
import requests
from typing import Dict, Any

# 从环境变量获取Supabase配置
SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL', 'https://qpgefcjcuhcqojiawpit.supabase.co')
SUPABASE_ANON_KEY = os.environ.get('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZ2VmY2pjdWhjcW9qaWF3cGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5OTk5MjgsImV4cCI6MjA3NzU3NTkyOH0.CJJCNIYH2FjA83lJ1UhJbTZeDD41_nvEEq2gsz9sqLg')

def execute_sql(sql: str) -> Dict[str, Any]:
    """执行SQL语句"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    data = {'query': sql}
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return {'status': 'success', 'result': response.json()}
        else:
            return {'status': 'error', 'error': f"HTTP {response.status_code}: {response.text}"}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}

def fix_guest_mode_database():
    """修复游客模式数据库问题"""
    print("开始修复游客模式数据库...")
    
    # 数据库修复SQL命令
    sql_commands = [
        # 创建guest_profiles表
        """
        CREATE TABLE IF NOT EXISTS guest_profiles (
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
        );
        """,
        
        # 创建索引
        "CREATE INDEX IF NOT EXISTS idx_guest_profiles_token ON guest_profiles(guest_token);",
        "CREATE INDEX IF NOT EXISTS idx_guest_profiles_converted ON guest_profiles(converted_to_user_id);",
        
        # 更新profiles表结构
        """
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS guest_token TEXT,
        ADD COLUMN IF NOT EXISTS converted_to_user_id UUID,
        ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;
        """,
        
        # 创建skills表
        """
        CREATE TABLE IF NOT EXISTS skills (
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
        );
        """,
        
        # 创建user_skills表
        """
        CREATE TABLE IF NOT EXISTS user_skills (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            skill_id UUID,
            level INTEGER DEFAULT 1,
            score INTEGER DEFAULT 0,
            verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # 创建questions表
        """
        CREATE TABLE IF NOT EXISTS questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            skill_id UUID,
            question_text TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            difficulty INTEGER DEFAULT 1,
            is_approved BOOLEAN DEFAULT false,
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # 创建badges表
        """
        CREATE TABLE IF NOT EXISTS badges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            icon_url TEXT,
            skill_id UUID,
            rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
            requirement_score INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # 创建user_badges表
        """
        CREATE TABLE IF NOT EXISTS user_badges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            badge_id UUID,
            earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, badge_id)
        );
        """,
        
        # 插入基础技能数据
        """
        INSERT INTO skills (name, category, description, level_required, market_demand, difficulty_level) 
        VALUES 
        ('JavaScript', '编程语言', 'Web前端开发的核心编程语言', 1, 95, 2),
        ('React', '前端框架', '流行的前端UI库', 2, 90, 3),
        ('Python', '编程语言', '通用编程语言', 1, 90, 2),
        ('UI设计', '设计', '用户界面设计', 1, 75, 2)
        ON CONFLICT (name) DO NOTHING;
        """,
        
        # 插入基础测评题目
        """
        INSERT INTO questions (skill_id, question_text, options, correct_answer, difficulty, is_approved)
        SELECT 
            s.id,
            '关于' || s.name || '的基础知识测试题',
            '{"A": "选项A", "B": "选项B", "C": "选项C", "D": "选项D"}',
            'A',
            1,
            true
        FROM skills s
        WHERE s.name IN ('JavaScript', 'React', 'Python', 'UI设计')
        AND NOT EXISTS (
            SELECT 1 FROM questions q 
            JOIN skills s2 ON q.skill_id = s2.id 
            WHERE s2.name = s.name
        );
        """,
        
        # 插入基础徽章
        """
        INSERT INTO badges (name, description, rarity, requirement_score) VALUES
        ('初来乍到', '完成首次登录', 'common', 10),
        ('勇敢尝试', '完成第一次技能测评', 'common', 20),
        ('技能达人', '通过任意技能测评', 'rare', 50),
        ('快速学习者', '在5分钟内完成测评', 'rare', 30)
        ON CONFLICT (name) DO NOTHING;
        """
    ]
    
    results = []
    success_count = 0
    error_count = 0
    
    print(f"执行 {len(sql_commands)} 个SQL命令...")
    
    for i, sql in enumerate(sql_commands, 1):
        print(f"执行第 {i} 个命令...")
        result = execute_sql(sql.strip())
        results.append({
            'command': i,
            'sql': sql.strip()[:100] + '...' if len(sql.strip()) > 100 else sql.strip(),
            'status': result['status'],
            'result': result.get('result'),
            'error': result.get('error')
        })
        
        if result['status'] == 'success':
            success_count += 1
            print(f"✅ 第 {i} 个命令执行成功")
        else:
            error_count += 1
            print(f"❌ 第 {i} 个命令执行失败: {result.get('error')}")
    
    print(f"\n数据库修复完成!")
    print(f"✅ 成功: {success_count}")
    print(f"❌ 失败: {error_count}")
    
    return {
        'success_count': success_count,
        'error_count': error_count,
        'results': results
    }

if __name__ == "__main__":
    result = fix_guest_mode_database()
    print(json.dumps(result, ensure_ascii=False, indent=2))