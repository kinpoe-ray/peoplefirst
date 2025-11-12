import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  School, 
  Trophy, 
  Star, 
  Edit3, 
  Upload, 
  Download, 
  Calendar,
  GraduationCap,
  Briefcase,
  Award
} from 'lucide-react'
import { MobileCard } from '../components/MobileOptimized'
import { useIsMobile } from '../hooks/use-mobile'

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher'
  school: string
  major: string
  year: number
  bio: string
  avatar_url?: string
  created_at: string
}

interface UserSkill {
  id: string
  skill_name: string
  category: string
  proficiency_level: number
  is_verified: boolean
}

interface UserBadge {
  id: string
  badge_name: string
  badge_type: string
  rarity: string
  description: string
  earned_at: string
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    full_name: '',
    school: '',
    major: '',
    year: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchUserSkills()
      fetchUserBadges()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setProfile(data)
        setEditForm({
          full_name: data.full_name || '',
          school: data.school || '',
          major: data.major || '',
          year: data.year?.toString() || '',
          bio: data.bio || ''
        })
      }
    } catch (error) {
      console.error('获取用户档案失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          id,
          proficiency_level,
          is_verified,
          skills (
            id,
            name,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('proficiency_level', { ascending: false })

      if (error) throw error
      
      const formattedSkills = data?.map((item: any) => ({
        id: item.id,
        skill_name: item.skills.name,
        category: item.skills.category,
        proficiency_level: item.proficiency_level,
        is_verified: item.is_verified
      })) || []
      
      setSkills(formattedSkills)
    } catch (error) {
      console.error('获取用户技能失败:', error)
    }
  }

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          badges (
            id,
            name,
            badge_type,
            rarity,
            description
          )
        `)
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false })

      if (error) throw error
      
      const formattedBadges = data?.map((item: any) => ({
        id: item.id,
        badge_name: item.badges.name,
        badge_type: item.badges.badge_type,
        rarity: item.badges.rarity,
        description: item.badges.description,
        earned_at: item.earned_at
      })) || []
      
      setBadges(formattedBadges)
    } catch (error) {
      console.error('获取用户徽章失败:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          school: editForm.school,
          major: editForm.major,
          year: parseInt(editForm.year) || null,
          bio: editForm.bio
        })
        .eq('id', user?.id)

      if (error) throw error
      
      await fetchProfile()
      setIsEditing(false)
    } catch (error) {
      console.error('更新档案失败:', error)
      alert('更新档案失败，请重试')
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 bg-yellow-50'
      case 'epic': return 'text-purple-500 bg-purple-50'
      case 'rare': return 'text-blue-500 bg-blue-50'
      case 'common': return 'text-gray-500 bg-gray-50'
      default: return 'text-gray-500 bg-gray-50'
    }
  }

  const getProficiencyText = (level: number) => {
    if (level >= 80) return '专家'
    if (level >= 60) return '熟练'
    if (level >= 40) return '进阶'
    if (level >= 20) return '入门'
    return '初学'
  }

  const getProficiencyColor = (level: number) => {
    if (level >= 80) return 'bg-green-500'
    if (level >= 60) return 'bg-blue-500'
    if (level >= 40) return 'bg-yellow-500'
    if (level >= 20) return 'bg-orange-500'
    return 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* 个人信息卡片 */}
      <MobileCard>
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between'} mb-4 md:mb-6`}>
          <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 flex items-center`}>
            <User className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-6 h-6 mr-2'}`} />
            个人档案
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center ${isMobile ? 'px-4 py-3 min-h-[44px] w-full justify-center' : 'px-4 py-2'} text-blue-600 hover:bg-blue-50 rounded-lg transition-colors`}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {isEditing ? '取消编辑' : '编辑档案'}
            </span>
          </button>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
          {/* 头像和基本信息 */}
          <div className={isMobile ? '' : 'lg:col-span-1'}>
            <div className="text-center">
              <div className={`${isMobile ? 'w-20 h-20 text-2xl' : 'w-32 h-32 text-4xl'} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mx-auto mb-4`}>
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>{profile?.full_name || '未设置姓名'}</h3>
              <p className={`${isMobile ? 'text-sm' : 'text-gray-600'} ${isMobile ? 'truncate' : ''}`}>{profile?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                profile?.role === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {profile?.role === 'student' ? '学生' : '老师'}
              </span>
            </div>
          </div>

          {/* 详细信息 */}
          <div className={isMobile ? '' : 'lg:col-span-2'}>
            {isEditing ? (
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-2`}>姓名</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-2`}>学校</label>
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) => setEditForm(prev => ({ ...prev, school: e.target.value }))}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-2`}>专业</label>
                  <input
                    type="text"
                    value={editForm.major}
                    onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-2`}>年级</label>
                  <input
                    type="number"
                    value={editForm.year}
                    onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-2`}>个人简介</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className={`w-full ${isMobile ? 'min-h-[100px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="介绍一下你自己..."
                  />
                </div>
                <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex space-x-3'}`}>
                  <button
                    onClick={handleSaveProfile}
                    className={`${isMobile ? 'min-h-[44px] w-full' : ''} px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                  >
                    保存更改
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`${isMobile ? 'min-h-[44px] w-full' : ''} px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="flex items-center">
                  <School className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 ${isMobile ? 'mr-2' : 'mr-3'}`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-gray-900'} ${isMobile ? 'truncate' : ''}`}>{profile?.school || '未设置学校'}</span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 ${isMobile ? 'mr-2' : 'mr-3'}`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-gray-900'} ${isMobile ? 'truncate' : ''}`}>{profile?.major || '未设置专业'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 ${isMobile ? 'mr-2' : 'mr-3'}`} />
                  <span className={`${isMobile ? 'text-sm' : 'text-gray-900'}`}>{profile?.year ? `${profile.year}年级` : '未设置年级'}</span>
                </div>
                <div className={isMobile ? 'mt-3' : 'mt-4'}>
                  <p className={`${isMobile ? 'text-sm' : 'text-gray-600'} ${isMobile ? 'leading-relaxed' : ''}`}>{profile?.bio || '这个人很懒，什么都没有写...'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileCard>

      {/* 技能展示 */}
      <MobileCard>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4 flex items-center`}>
          <Star className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-2'}`} />
          我的技能
        </h3>
        {skills.length > 0 ? (
          <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {skills.map((skill) => (
              <div key={skill.id} className={`border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`${isMobile ? 'text-sm' : 'font-semibold text-gray-900'} ${isMobile ? 'truncate' : ''}`}>{skill.skill_name}</h4>
                  {skill.is_verified && (
                    <Award className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 ${isMobile ? 'mb-2' : 'mb-3'}`}>{skill.category}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>熟练度</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>{getProficiencyText(skill.proficiency_level)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProficiencyColor(skill.proficiency_level)}`}
                      style={{ width: `${skill.proficiency_level}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-gray-500 text-center ${isMobile ? 'py-6' : 'py-8'}`}>还没有技能记录，快去技能健身房提升自己吧！</p>
        )}
      </MobileCard>

      {/* 徽章展示 */}
      <MobileCard>
        <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-4 flex items-center`}>
          <Trophy className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-2'}`} />
          我的徽章
        </h3>
        {badges.length > 0 ? (
          <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {badges.map((badge) => (
              <div key={badge.id} className={`border rounded-lg ${isMobile ? 'p-3' : 'p-4'} ${getRarityColor(badge.rarity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`${isMobile ? 'text-sm' : 'font-semibold'} ${isMobile ? 'truncate' : ''}`}>{badge.badge_name}</h4>
                  <Trophy className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                </div>
                <p className={`${isMobile ? 'text-xs mb-2' : 'text-sm mb-2'}`}>{badge.description}</p>
                <p className="text-xs opacity-75">
                  获得时间: {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-gray-500 text-center ${isMobile ? 'py-6' : 'py-8'}`}>还没有获得徽章，完成技能测评来赢取你的第一个徽章！</p>
        )}
      </MobileCard>
    </div>
  )
}

export default Profile