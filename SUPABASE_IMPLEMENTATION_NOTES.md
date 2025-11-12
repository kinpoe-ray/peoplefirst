# Supabase Implementation Notes for Evolv Platform API

## Overview

This document provides detailed implementation guidance for building the Evolv Platform API using Supabase (PostgreSQL) as the backend database with Supabase Edge Functions for serverless API endpoints.

## Architecture

```
┌─────────────────┐
│  React Client   │
│  (TypeScript)   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Supabase Edge  │
│   Functions     │
│  (Deno/TS)      │
└────────┬────────┘
         │
         │ PostgREST
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

## Table of Contents

1. [Database Schema](#database-schema)
2. [Row-Level Security (RLS) Policies](#row-level-security)
3. [Edge Functions Implementation](#edge-functions)
4. [Caching Strategy](#caching-strategy)
5. [Rate Limiting](#rate-limiting)
6. [AI Integration (Grok API)](#ai-integration)
7. [Real-time Features](#real-time-features)
8. [Migration Scripts](#migration-scripts)

---

## Database Schema

### 1. User Growth System Tables

```sql
-- User levels and XP tracking
CREATE TABLE user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1 NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- XP transactions log
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL CHECK (source IN (
        'course_completion', 'skill_mastery', 'social_interaction',
        'quiz_completion', 'project_submission', 'daily_login',
        'achievement_unlock'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at);

-- Achievements/Badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'achievement', 'skill', 'milestone')),
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    requirement_score INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0 NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_rarity ON badges(rarity);

-- User badges (earned achievements)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

-- Leaderboard materialized view for performance
CREATE MATERIALIZED VIEW leaderboard_all_time AS
SELECT
    u.id as user_id,
    p.full_name,
    p.avatar_url,
    p.user_type,
    ul.current_level,
    ul.total_xp,
    COUNT(DISTINCT ub.badge_id) as badge_count,
    COUNT(DISTINCT us.skill_id) as skill_count,
    ROW_NUMBER() OVER (ORDER BY ul.total_xp DESC, ul.current_level DESC) as rank
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_levels ul ON u.id = ul.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
LEFT JOIN user_skills us ON u.id = us.user_id AND us.verified = true
WHERE p.is_guest = false
GROUP BY u.id, p.full_name, p.avatar_url, p.user_type, ul.current_level, ul.total_xp;

CREATE INDEX idx_leaderboard_rank ON leaderboard_all_time(rank);

-- Refresh leaderboard every hour
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_all_time;
END;
$$ LANGUAGE plpgsql;
```

### 2. Social Features Tables

```sql
-- Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 5000),
    attachments JSONB DEFAULT '[]'::jsonb,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    shares_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);

-- Post likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 1000),
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

-- User follows
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Activity feed (optimized for social feed queries)
CREATE TABLE feed_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'post', 'achievement', 'skill_update', 'course_completion', 'certification'
    )),
    content JSONB NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feed_items_user_id ON feed_items(user_id);
CREATE INDEX idx_feed_items_created_at ON feed_items(created_at DESC);
CREATE INDEX idx_feed_items_type ON feed_items(activity_type);
```

### 3. Learning Paths Tables

```sql
-- Learning paths
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    duration_hours INTEGER,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    skills_covered TEXT[] DEFAULT '{}',
    total_steps INTEGER DEFAULT 0 NOT NULL,
    enrollment_count INTEGER DEFAULT 0 NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_difficulty ON learning_paths(difficulty_level);
CREATE INDEX idx_learning_paths_rating ON learning_paths(rating DESC);

-- Learning path steps
CREATE TABLE learning_path_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    order_num INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    step_type TEXT NOT NULL CHECK (step_type IN ('lesson', 'quiz', 'project', 'assessment', 'reading')),
    estimated_minutes INTEGER,
    resources JSONB DEFAULT '[]'::jsonb,
    prerequisites TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(path_id, order_num)
);

CREATE INDEX idx_learning_path_steps_path_id ON learning_path_steps(path_id);

-- User enrollments
CREATE TABLE learning_path_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    estimated_completion_date DATE,
    completed_at TIMESTAMPTZ,
    goals JSONB DEFAULT '[]'::jsonb,
    notifications_enabled BOOLEAN DEFAULT true,
    UNIQUE(user_id, path_id)
);

CREATE INDEX idx_enrollments_user_id ON learning_path_enrollments(user_id);
CREATE INDEX idx_enrollments_path_id ON learning_path_enrollments(path_id);

-- Step progress tracking
CREATE TABLE learning_path_step_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES learning_path_enrollments(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES learning_path_steps(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    last_accessed TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(enrollment_id, step_id)
);

CREATE INDEX idx_step_progress_enrollment ON learning_path_step_progress(enrollment_id);
```

### 4. Certification Tables

```sql
-- Certification requests
CREATE TABLE certification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    requested_level TEXT NOT NULL CHECK (requested_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    evidence_type TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cert_requests_user_id ON certification_requests(user_id);
CREATE INDEX idx_cert_requests_status ON certification_requests(status);

-- Certifications (approved)
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES certification_requests(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    certificate_number TEXT NOT NULL UNIQUE,
    verification_url TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT
);

CREATE INDEX idx_certifications_user_id ON certifications(user_id);
CREATE INDEX idx_certifications_skill_id ON certifications(skill_id);
CREATE INDEX idx_certifications_number ON certifications(certificate_number);
CREATE INDEX idx_certifications_issued_at ON certifications(issued_at DESC);

-- Generate unique certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        new_number := 'EVOLV-' || UPPER(substr(md5(random()::text), 1, 12));
        SELECT EXISTS(SELECT 1 FROM certifications WHERE certificate_number = new_number) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

### 5. AI Integration Tables

```sql
-- AI career assessments
CREATE TABLE career_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_profile JSONB NOT NULL,
    analysis_depth TEXT NOT NULL CHECK (analysis_depth IN ('quick', 'standard', 'comprehensive')),
    career_paths JSONB NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    areas_for_improvement TEXT[] DEFAULT '{}',
    recommended_next_steps JSONB DEFAULT '[]'::jsonb,
    market_insights JSONB DEFAULT '{}'::jsonb,
    ai_provider TEXT DEFAULT 'grok',
    ai_model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_career_assessments_user_id ON career_assessments(user_id);
CREATE INDEX idx_career_assessments_created_at ON career_assessments(created_at DESC);

-- AI skill recommendations
CREATE TABLE skill_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_skills JSONB NOT NULL,
    target_role TEXT,
    recommendations JSONB NOT NULL,
    learning_roadmap JSONB,
    confidence_score DECIMAL(4,3),
    ai_provider TEXT DEFAULT 'grok',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_recommendations_user_id ON skill_recommendations(user_id);

-- AI generated learning paths
CREATE TABLE ai_generated_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    current_level TEXT NOT NULL,
    path_data JSONB NOT NULL,
    linked_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
    ai_provider TEXT DEFAULT 'grok',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_paths_user_id ON ai_generated_paths(user_id);
```

---

## Row-Level Security (RLS) Policies

### 1. User Levels RLS

```sql
-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- Users can view their own level
CREATE POLICY "Users can view own level"
    ON user_levels FOR SELECT
    USING (auth.uid() = user_id);

-- Public can view levels (for leaderboard)
CREATE POLICY "Public can view user levels"
    ON user_levels FOR SELECT
    USING (true);

-- Only system can insert/update XP
CREATE POLICY "System can manage XP"
    ON user_levels FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
```

### 2. Posts RLS

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public posts visible to all
CREATE POLICY "Public posts visible to all"
    ON posts FOR SELECT
    USING (visibility = 'public');

-- Followers-only posts visible to followers
CREATE POLICY "Followers posts visible to followers"
    ON posts FOR SELECT
    USING (
        visibility = 'followers' AND (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM user_follows
                WHERE follower_id = auth.uid() AND following_id = posts.user_id
            )
        )
    );

-- Private posts only visible to owner
CREATE POLICY "Private posts visible to owner"
    ON posts FOR SELECT
    USING (visibility = 'private' AND auth.uid() = user_id);

-- Users can create their own posts
CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    USING (auth.uid() = user_id);
```

### 3. Learning Paths RLS

```sql
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- All users can view active learning paths
CREATE POLICY "Users can view active paths"
    ON learning_paths FOR SELECT
    USING (is_active = true);

-- Teachers and admins can create paths
CREATE POLICY "Teachers can create paths"
    ON learning_paths FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type IN ('teacher', 'alumni')
        )
    );

-- Instructors can update their own paths
CREATE POLICY "Instructors can update own paths"
    ON learning_paths FOR UPDATE
    USING (auth.uid() = instructor_id);
```

### 4. Certifications RLS

```sql
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Public certifications are publicly verifiable
CREATE POLICY "Public can view certifications"
    ON certifications FOR SELECT
    USING (is_revoked = false);

-- Users can view their own certification requests
ALTER TABLE certification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cert requests"
    ON certification_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create cert requests"
    ON certification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Teachers can review certification requests
CREATE POLICY "Teachers can review certifications"
    ON certification_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND user_type = 'teacher'
        )
    );
```

---

## Edge Functions Implementation

### 1. XP Management Function

```typescript
// supabase/functions/add-xp/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const XP_PER_LEVEL = 200; // Base XP, increases per level
const XP_MULTIPLIER = 1.5; // Exponential growth

interface XPRequest {
  user_id: string;
  amount: number;
  source: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, amount, source, metadata = {} }: XPRequest = await req.json()

    // Validate input
    if (!user_id || !amount || !source) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Log XP transaction
    await supabase
      .from('xp_transactions')
      .insert({ user_id, amount, source, metadata })

    // Get current level
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!levelData) {
      // Create initial level record
      await supabase
        .from('user_levels')
        .insert({ user_id, total_xp: amount })

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            xp_added: amount,
            total_xp: amount,
            current_level: 1,
            level_up: false
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate new XP and level
    const new_total_xp = levelData.total_xp + amount
    let current_level = levelData.current_level
    let level_up = false
    let new_level = null

    // Calculate level from XP
    function calculateLevel(xp: number): number {
      let level = 1
      let xp_needed = XP_PER_LEVEL
      let accumulated_xp = 0

      while (accumulated_xp + xp_needed <= xp) {
        accumulated_xp += xp_needed
        level++
        xp_needed = Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1))
      }

      return level
    }

    const calculated_level = calculateLevel(new_total_xp)

    if (calculated_level > current_level) {
      level_up = true
      new_level = calculated_level
      current_level = calculated_level
    }

    // Update user level
    await supabase
      .from('user_levels')
      .update({
        total_xp: new_total_xp,
        current_level: current_level,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)

    // Check for achievements
    const rewards = []
    if (level_up) {
      // Award level-up achievements
      const { data: levelBadges } = await supabase
        .from('badges')
        .select('*')
        .eq('requirement_type', 'level')
        .lte('requirement_value', new_level)

      for (const badge of levelBadges || []) {
        const { error } = await supabase
          .from('user_badges')
          .insert({ user_id, badge_id: badge.id })
          .onConflict('user_id, badge_id')
          .ignore()

        if (!error) {
          rewards.push({
            type: 'achievement',
            id: badge.id,
            name: badge.name
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          xp_added: amount,
          total_xp: new_total_xp,
          current_level: current_level,
          level_up: level_up,
          new_level: new_level,
          rewards: rewards
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 2. Feed Generation Function

```typescript
// supabase/functions/get-feed/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get auth user from request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const url = new URL(req.url)
    const filter = url.searchParams.get('filter') || 'all'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('feed_items')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          avatar_url,
          user_type
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filter === 'following') {
      // Get posts from followed users
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = following?.map(f => f.following_id) || []
      query = query.in('user_id', followingIds)
    } else if (filter === 'guilds') {
      // Get posts from user's guilds
      const { data: guilds } = await supabase
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', user.id)

      const guildIds = guilds?.map(g => g.guild_id) || []
      // Add guild filter logic here
    }

    const { data: feedItems, error } = await query

    if (error) throw error

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          feed: feedItems,
          pagination: {
            page,
            limit,
            has_next: feedItems.length === limit
          }
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    )
  }
})
```

### 3. Grok AI Integration Function

```typescript
// supabase/functions/ai-career-assessment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const { user_profile, analysis_depth = 'standard', include_salary_insights = true } = await req.json()

    // Build Grok prompt
    const prompt = `
You are a career counselor AI. Analyze this user profile and provide comprehensive career guidance.

User Profile:
- Education: ${user_profile.education_level}
- Major: ${user_profile.major || 'Not specified'}
- Interests: ${user_profile.interests.join(', ')}
- Experience: ${user_profile.experience_years} years
- Current Skills: ${user_profile.current_skills.join(', ')}
- Career Goals: ${user_profile.career_goals}

Please provide:
1. Top 5 career paths with match scores (0-100)
2. Required skills for each path
3. Skill gaps to address
4. Salary ranges (if requested)
5. Time to readiness estimates
6. Growth outlook for each path
7. User's key strengths
8. Areas for improvement
9. Recommended next steps with priorities
10. Market insights (trending skills, emerging tech)

Format your response as JSON with this structure:
{
  "career_paths": [...],
  "strengths": [...],
  "areas_for_improvement": [...],
  "recommended_next_steps": [...],
  "market_insights": {...}
}
`

    // Call Grok API
    const grokResponse = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are a helpful career counselor AI.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!grokResponse.ok) {
      throw new Error(`Grok API error: ${grokResponse.statusText}`)
    }

    const grokData = await grokResponse.json()
    const aiResponse = JSON.parse(grokData.choices[0].message.content)

    // Save assessment to database
    const { data: assessment, error: insertError } = await supabase
      .from('career_assessments')
      .insert({
        user_id: user.id,
        user_profile,
        analysis_depth,
        career_paths: aiResponse.career_paths,
        strengths: aiResponse.strengths,
        areas_for_improvement: aiResponse.areas_for_improvement,
        recommended_next_steps: aiResponse.recommended_next_steps,
        market_insights: aiResponse.market_insights,
        ai_provider: 'grok',
        ai_model_version: 'grok-beta'
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          assessment_id: assessment.id,
          ...aiResponse,
          generated_at: assessment.created_at
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    )
  }
})
```

---

## Caching Strategy

### Redis Cache Integration

```typescript
// lib/cache.ts
import { Redis } from "https://esm.sh/@upstash/redis@1.20.1"

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL'),
  token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
})

export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached as T | null
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = 300
): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value))
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Cache key generators
export const cacheKeys = {
  userLevel: (userId: string) => `user:${userId}:level`,
  leaderboard: (type: string, metric: string) => `leaderboard:${type}:${metric}`,
  learningPath: (pathId: string) => `path:${pathId}`,
  userFeed: (userId: string, page: number) => `feed:${userId}:${page}`,
  skillsList: (category?: string) => `skills:list:${category || 'all'}`,
}
```

### Cache TTL Strategy

- User Level Data: 60 seconds
- Leaderboards: 5 minutes (300 seconds)
- Learning Paths: 10 minutes (600 seconds)
- User Feed: 1 minute (60 seconds)
- Skills List: 1 hour (3600 seconds)
- AI Assessments: 24 hours (for same parameters)

---

## Rate Limiting

### Supabase Edge Function Rate Limiting

```typescript
// lib/rate-limiter.ts
import { Redis } from "https://esm.sh/@upstash/redis@1.20.1"

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL'),
  token: Deno.env.get('UPSTASH_REDIS_TOKEN'),
})

interface RateLimitConfig {
  requests: number
  window: number // seconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  anonymous: { requests: 10, window: 60 },
  authenticated: { requests: 60, window: 60 },
  premium: { requests: 120, window: 60 },
  ai_endpoints: { requests: 5, window: 60 },
}

export async function checkRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const config = RATE_LIMITS[tier]
  const key = `ratelimit:${tier}:${identifier}`

  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, config.window)
  }

  const ttl = await redis.ttl(key)
  const allowed = current <= config.requests
  const remaining = Math.max(0, config.requests - current)

  return {
    allowed,
    remaining,
    reset: Date.now() + (ttl * 1000)
  }
}

export function rateLimitResponse(remaining: number, reset: number) {
  return {
    headers: {
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }
  }
}
```

---

## Database Triggers & Functions

### Auto-update Counters

```sql
-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_likes_counter
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_comments_counter
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    progress DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_steps
    FROM learning_path_steps lps
    JOIN learning_path_enrollments lpe ON lps.path_id = lpe.path_id
    WHERE lpe.id = NEW.enrollment_id;

    SELECT COUNT(*) INTO completed_steps
    FROM learning_path_step_progress
    WHERE enrollment_id = NEW.enrollment_id AND status = 'completed';

    progress := (completed_steps::DECIMAL / total_steps) * 100;

    UPDATE learning_path_enrollments
    SET
        completion_percentage = progress,
        last_accessed = NOW(),
        completed_at = CASE WHEN progress >= 100 THEN NOW() ELSE NULL END
    WHERE id = NEW.enrollment_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_progress_updater
AFTER INSERT OR UPDATE ON learning_path_step_progress
FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();
```

---

## Real-time Subscriptions

### Supabase Realtime Configuration

```typescript
// Client-side real-time subscriptions
import { supabase } from './lib/supabase'

// Subscribe to new posts in feed
export function subscribeToFeed(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('feed-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feed_items',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Subscribe to new achievements
export function subscribeToAchievements(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('achievement-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// Subscribe to level changes
export function subscribeToLevelChanges(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('level-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_levels',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}
```

---

## Migration Scripts

### Initial Migration

```sql
-- migrations/001_initial_schema.sql
-- Run all the CREATE TABLE statements from the schema section above

-- Initial seed data
INSERT INTO badges (name, description, rarity, category, requirement_type, requirement_value, points) VALUES
('First Steps', 'Complete your first skill assessment', 'common', 'milestone', 'skill_mastery', 1, 50),
('Social Butterfly', 'Get 10 followers', 'common', 'social', 'social', 10, 50),
('Knowledge Seeker', 'Enroll in your first learning path', 'common', 'learning', 'course_complete', 1, 50),
('Skill Master', 'Master 5 skills', 'rare', 'skill', 'skill_mastery', 5, 200),
('Dedicated Learner', '30-day login streak', 'rare', 'achievement', 'streak', 30, 300),
('Community Leader', 'Get 100 post likes', 'epic', 'social', 'social', 100, 500),
('Expert', 'Master 20 skills', 'legendary', 'skill', 'skill_mastery', 20, 1000);
```

---

## Performance Optimization Tips

1. **Use Prepared Statements**: Edge Functions automatically use prepared statements
2. **Batch Operations**: Group multiple inserts/updates when possible
3. **Materialized Views**: Refresh leaderboards periodically instead of real-time calculation
4. **Index Strategy**: Add indexes on frequently queried columns (user_id, created_at, etc.)
5. **Connection Pooling**: Supabase handles this automatically
6. **Query Optimization**: Use `select` to only fetch needed columns
7. **Pagination**: Always paginate large datasets
8. **Cache Aggressively**: Cache public, rarely-changing data (skills, badges)

---

## Testing Strategy

### Integration Tests

```typescript
// tests/api/achievements.test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.test("Award achievement to user", async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const testUserId = 'test-user-id'
  const testBadgeId = 'test-badge-id'

  const { data, error } = await supabase
    .from('user_badges')
    .insert({ user_id: testUserId, badge_id: testBadgeId })
    .select()

  assertEquals(error, null)
  assertEquals(data[0].user_id, testUserId)
})
```

---

## Deployment Checklist

- [ ] Set up Supabase project
- [ ] Run migration scripts
- [ ] Configure RLS policies
- [ ] Deploy Edge Functions
- [ ] Set up Redis/Upstash for caching
- [ ] Configure rate limiting
- [ ] Set up Grok API key
- [ ] Enable real-time subscriptions
- [ ] Configure CORS policies
- [ ] Set up monitoring and logging
- [ ] Create database backups schedule
- [ ] Load test API endpoints
- [ ] Document API for frontend team

---

## Security Considerations

1. **JWT Validation**: All Edge Functions validate JWT tokens
2. **RLS Enforcement**: Database-level security with RLS policies
3. **Input Sanitization**: Validate and sanitize all user inputs
4. **SQL Injection Prevention**: Use parameterized queries only
5. **Rate Limiting**: Prevent abuse with rate limits
6. **API Key Rotation**: Rotate service role keys regularly
7. **Audit Logging**: Log all sensitive operations
8. **HTTPS Only**: Enforce HTTPS in production
9. **CORS Configuration**: Restrict origins in production

---

## Monitoring & Observability

### Key Metrics to Track

1. **API Performance**
   - Response times (p50, p95, p99)
   - Error rates
   - Throughput (requests/second)

2. **Database Performance**
   - Query execution times
   - Connection pool utilization
   - Cache hit rates

3. **Business Metrics**
   - User engagement (posts, comments, likes)
   - Learning path completions
   - Certification requests
   - AI API usage and costs

4. **Error Tracking**
   - Edge Function errors
   - Database errors
   - Third-party API failures (Grok)

### Supabase Dashboard Monitoring

Use Supabase's built-in monitoring for:
- Database queries performance
- Edge Functions logs
- API usage statistics
- Real-time connections

---

## Cost Optimization

1. **Caching**: Reduce database queries with Redis
2. **Materialized Views**: Pre-compute expensive queries
3. **Pagination**: Limit data transfer
4. **Indexes**: Speed up queries, reduce CPU usage
5. **AI API Caching**: Cache AI responses for identical requests
6. **Connection Pooling**: Reuse database connections
7. **Compression**: Enable gzip compression for API responses

---

## Support & Resources

- Supabase Documentation: https://supabase.com/docs
- Grok API Documentation: https://docs.x.ai
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Deno Documentation: https://deno.land/manual
