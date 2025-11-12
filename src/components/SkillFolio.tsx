import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  User,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  Eye,
  Search,
  Filter,
  Star,
  Calendar,
  Target,
  BookOpen,
  Zap,
  Shield,
  CheckCircle,
  Clock,
  ExternalLink,
  Download,
  Share2,
  Heart,
  MessageCircle,
  ChevronDown,
  X,
  Trophy,
  Medal,
  Crown,
  Gem
} from 'lucide-react'

interface SkillAssessment {
  id: string
  user_id: string
  assessment_type: string
  title: string
  description: string
  assessment_data: any
  overall_score: number
  skill_breakdown: any
  recommendations: string[]
  assessment_date: string
  is_public: boolean
  verification_level: string
  certificate_url?: string
  expires_at?: string
  created_at: string
  user_name?: string
  user_avatar?: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon_url?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'learning' | 'social' | 'achievement' | 'skill' | 'milestone'
  requirement_type: string
  requirement_value: number
  points: number
  created_at: string
  earned_at?: string
}

interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  school?: string
  major?: string
  graduation_year?: number
  bio?: string
  is_public: boolean
  user_type: string
  created_at: string
}

const SkillFolio: React.FC = () => {
  const { user } = useAuth()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'browse' | 'myfolio' | 'public'>('browse')
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('all')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showProfileDetail, setShowProfileDetail] = useState(false)

  // 筛选选项
  const categories = [
    { value: 'all', label: '全部类型' },
    { value: 'skill', label: '技能类' },
    { value: 'achievement', label: '成就类' },
    { value: 'learning', label: '学习类' },
    { value: 'social', label: '社交类' },
    { value: 'milestone', label: '里程碑' }
  ]

  const rarities = [
    { value: 'all', label: '全部稀有度' },
    { value: 'common', label: '普通' },
    { value: 'rare', label: '稀有' },
    { value: 'epic', label: '史诗' },
    { value: 'legendary', label: '传说' }
  ]

  const assessmentTypes = [
    { value: 'all', label: '全部评估' },
    { value: 'comprehensive', label: '综合评估' },
    { value: 'skill_specific', label: '专业技能' },
    { value: 'project_based', label: '项目实践' }
  ]

  // 初始化数据加载
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'browse') {
        await loadPublicProfiles()
        await loadPublicAssessments()
      } else if (activeTab === 'myfolio') {
        await loadMyAssessments()
        await loadMyBadges()
      } else if (activeTab === 'public') {
        await loadAllPublicData()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载公开档案
  const loadPublicProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('加载公开档案失败:', error)
    }
  }

  // 加载公开技能评估
  const loadPublicAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_assessments_public')
        .select(`
          *,
          profiles!skill_assessments_public_user_id_fkey (full_name, avatar_url)
        `)
        .eq('is_public', true)
        .order('assessment_date', { ascending: false })

      if (error) throw error

      const enrichedAssessments = data?.map(assessment => ({
        ...assessment,
        user_name: assessment.profiles?.full_name || '匿名用户',
        user_avatar: assessment.profiles?.avatar_url
      })) || []

      setSkillAssessments(enrichedAssessments)
    } catch (error) {
      console.error('加载技能评估失败:', error)
    }
  }

  // 加载我的技能评估
  const loadMyAssessments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('skill_assessments_public')
        .select('*')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: false })

      if (error) throw error
      setSkillAssessments(data || [])
    } catch (error) {
      console.error('加载我的技能评估失败:', error)
    }
  }

  // 加载我的徽章
  const loadMyBadges = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges!user_badges_badge_id_fkey (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })

      if (error) throw error

      const enrichedBadges = data?.map(userBadge => ({
        ...userBadge.badges,
        earned_at: userBadge.earned_at
      })) || []

      setBadges(enrichedBadges)
    } catch (error) {
      console.error('加载我的徽章失败:', error)
    }
  }

  // 加载所有公开数据
  const loadAllPublicData = async () => {
    await Promise.all([
      loadPublicProfiles(),
      loadPublicAssessments(),
      loadAllBadges()
    ])
  }

  // 加载所有徽章
  const loadAllBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('points', { ascending: false })

      if (error) throw error
      setBadges(data || [])
    } catch (error) {
      console.error('加载徽章失败:', error)
    }
  }

  // 获取稀有度样式
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: Award }
      case 'rare':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Star }
      case 'epic':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', icon: Trophy }
      case 'legendary':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: Crown }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: Award }
    }
  }

  // 获取验证等级样式
  const getVerificationStyle = (level: string) => {
    switch (level) {
      case 'certified':
        return { text: '已认证', color: 'text-green-600', icon: CheckCircle }
      case 'instructor_verified':
        return { text: '教师验证', color: 'text-blue-600', icon: Shield }
      case 'peer_verified':
        return { text: '同行验证', color: 'text-purple-600', icon: Users }
      case 'self_assessed':
        return { text: '自评', color: 'text-gray-600', icon: User }
      default:
        return { text: '未知', color: 'text-gray-600', icon: Clock }
    }
  }

  // 获取评估类型显示名称
  const getAssessmentTypeName = (type: string) => {
    switch (type) {
      case 'comprehensive':
        return '综合评估'
      case 'skill_specific':
        return '专业技能'
      case 'project_based':
        return '项目实践'
      default:
        return type
    }
  }

  // 筛选逻辑
  const filteredAssessments = skillAssessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedAssessmentType === 'all' || assessment.assessment_type === selectedAssessmentType
    return matchesSearch && matchesType
  })

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory
    const matchesRarity = selectedRarity === 'all' || badge.rarity === selectedRarity
    return matchesSearch && matchesCategory && matchesRarity
  })

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.school?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // 统计计算
  const totalBadges = badges.length
  const totalPoints = badges.reduce((sum, badge) => sum + badge.points, 0)
  const averageScore = skillAssessments.length > 0 
    ? Math.round(skillAssessments.reduce((sum, assessment) => sum + assessment.overall_score, 0) / skillAssessments.length)
    : 0

  const rarityStats = badges.reduce((stats, badge) => {
    stats[badge.rarity] = (stats[badge.rarity] || 0) + 1
    return stats
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="w-8 h-8 mr-3 text-blue-600" />
              公开技能档案
            </h1>
            <p className="text-gray-600 mt-2">展示和发现个人技能成就，构建职业发展档案</p>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'myfolio' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                <div className="text-sm text-gray-500">总积分</div>
              </div>
            )}
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'browse' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            浏览档案
          </button>
          <button
            onClick={() => setActiveTab('myfolio')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'myfolio' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            我的档案
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'public' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            公共统计
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === 'browse' 
                  ? "搜索用户档案、技能评估..." 
                  : activeTab === 'myfolio'
                  ? "搜索我的技能和徽章..."
                  : "搜索徽章..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {(activeTab === 'browse' || activeTab === 'myfolio') && (
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedAssessmentType}
                  onChange={(e) => setSelectedAssessmentType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {assessmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'public' && (
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {rarities.map(rarity => (
                    <option key={rarity.value} value={rarity.value}>
                      {rarity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 浏览档案标签页 */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* 公开档案列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => {
                     setSelectedProfile(profile)
                     setShowProfileDetail(true)
                   }}>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {profile.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{profile.full_name}</h3>
                    <p className="text-gray-600">{profile.major}</p>
                    {profile.school && (
                      <p className="text-sm text-gray-500">{profile.school}</p>
                    )}
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{profile.bio}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {profile.graduation_year}届
                  </span>
                  <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {profile.user_type}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 技能评估展示 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              公开技能评估
            </h2>
            
            {filteredAssessments.map((assessment) => {
              const verificationStyle = getVerificationStyle(assessment.verification_level)
              const VerificationIcon = verificationStyle.icon

              return (
                <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">{assessment.title}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {getAssessmentTypeName(assessment.assessment_type)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{assessment.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {assessment.user_name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center ${verificationStyle.color}`}>
                          <VerificationIcon className="w-4 h-4 mr-1" />
                          {verificationStyle.text}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{assessment.overall_score}</div>
                      <div className="text-sm text-gray-500">总分</div>
                    </div>
                  </div>

                  {/* 技能分解 */}
                  {assessment.skill_breakdown && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">技能分解</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(assessment.skill_breakdown).map(([skill, score]) => (
                          <div key={skill} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">{skill}</span>
                            <span className="text-sm font-bold text-blue-600">{Number(score)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 建议 */}
                  {assessment.recommendations && assessment.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        改进建议
                      </h4>
                      <ul className="space-y-1">
                        {assessment.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>点赞</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>评论</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>分享</span>
                      </button>
                    </div>
                    {assessment.certificate_url && (
                      <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span>查看证书</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 空状态 */}
          {filteredProfiles.length === 0 && filteredAssessments.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无公开档案</h3>
              <p className="text-gray-600">还没有用户设置公开技能档案</p>
            </div>
          )}
        </div>
      )}

      {/* 我的档案标签页 */}
      {activeTab === 'myfolio' && (
        <div className="space-y-6">
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">获得徽章</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBadges}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总积分</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均分数</p>
                  <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">技能评估</p>
                  <p className="text-2xl font-bold text-gray-900">{skillAssessments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 我的徽章 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2" />
              我的徽章
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => {
                const rarityStyle = getRarityStyle(badge.rarity)
                const RarityIcon = rarityStyle.icon

                return (
                  <div key={badge.id} className={`bg-white rounded-xl shadow-sm border-2 ${rarityStyle.border} p-4 hover:shadow-md transition-shadow`}>
                    <div className="flex items-center mb-3">
                      <div className={`p-3 ${rarityStyle.bg} rounded-lg mr-3`}>
                        <RarityIcon className={`w-6 h-6 ${rarityStyle.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${rarityStyle.text}`}>{badge.name}</h3>
                        <p className="text-sm text-gray-600">{badge.points} 积分</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{badge.description}</p>
                    {badge.earned_at && (
                      <div className="text-xs text-gray-500">
                        获得时间: {new Date(badge.earned_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 我的技能评估 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              我的技能评估
            </h2>
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => {
                const verificationStyle = getVerificationStyle(assessment.verification_level)
                const VerificationIcon = verificationStyle.icon

                return (
                  <div key={assessment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 mr-3">{assessment.title}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {getAssessmentTypeName(assessment.assessment_type)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{assessment.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(assessment.assessment_date).toLocaleDateString()}
                          </span>
                          <span className={`flex items-center ${verificationStyle.color}`}>
                            <VerificationIcon className="w-4 h-4 mr-1" />
                            {verificationStyle.text}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{assessment.overall_score}</div>
                        <div className="text-sm text-gray-500">总分</div>
                      </div>
                    </div>

                    {/* 技能分解 */}
                    {assessment.skill_breakdown && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">技能分解</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(assessment.skill_breakdown).map(([skill, score]) => (
                            <div key={skill} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">{skill}</span>
                              <span className="text-sm font-bold text-blue-600">{Number(score)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 建议 */}
                    {assessment.recommendations && assessment.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          改进建议
                        </h4>
                        <ul className="space-y-1">
                          {assessment.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Download className="w-4 h-4 mr-1" />
                          导出报告
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Share2 className="w-4 h-4 mr-1" />
                          分享
                        </button>
                      </div>
                      {assessment.certificate_url && (
                        <button className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          查看证书
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 空状态 */}
          {filteredBadges.length === 0 && filteredAssessments.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无个人档案</h3>
              <p className="text-gray-600 mb-4">开始构建你的技能档案，展示你的成就</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                进行技能评估
              </button>
            </div>
          )}
        </div>
      )}

      {/* 公共统计标签页 */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          {/* 徽章统计 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Gem className="w-6 h-6 mr-2" />
              徽章图鉴
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => {
                const rarityStyle = getRarityStyle(badge.rarity)
                const RarityIcon = rarityStyle.icon

                return (
                  <div key={badge.id} className={`bg-white rounded-xl shadow-sm border-2 ${rarityStyle.border} p-4 hover:shadow-md transition-shadow`}>
                    <div className="flex items-center mb-3">
                      <div className={`p-3 ${rarityStyle.bg} rounded-lg mr-3`}>
                        <RarityIcon className={`w-6 h-6 ${rarityStyle.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${rarityStyle.text}`}>{badge.name}</h3>
                        <p className="text-sm text-gray-600">{badge.points} 积分</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{badge.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${rarityStyle.bg} ${rarityStyle.text}`}>
                        {categories.find(c => c.value === badge.category)?.label || badge.category}
                      </span>
                      <span className="capitalize">{badge.rarity}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 稀有度统计 */}
          {Object.keys(rarityStats).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2" />
                稀有度分布
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(rarityStats).map(([rarity, count]) => {
                  const rarityStyle = getRarityStyle(rarity)
                  const RarityIcon = rarityStyle.icon

                  return (
                    <div key={rarity} className={`bg-white rounded-xl shadow-sm border-2 ${rarityStyle.border} p-6 text-center`}>
                      <RarityIcon className={`w-8 h-8 ${rarityStyle.text} mx-auto mb-2`} />
                      <div className={`text-2xl font-bold ${rarityStyle.text}`}>{count}</div>
                      <div className="text-sm text-gray-600 capitalize">{rarity}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 用户档案详情弹窗 */}
      {showProfileDetail && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">用户档案</h2>
              <button
                onClick={() => setShowProfileDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                {selectedProfile.full_name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProfile.full_name}</h3>
                <p className="text-gray-600 text-lg">{selectedProfile.major}</p>
                {selectedProfile.school && (
                  <p className="text-gray-500">{selectedProfile.school}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {selectedProfile.graduation_year}届
                  </span>
                  <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {selectedProfile.user_type}
                  </span>
                </div>
              </div>
            </div>

            {selectedProfile.bio && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">个人简介</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfileDetail(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看技能档案
              </button>
              <button
                onClick={() => setShowProfileDetail(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                发送消息
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillFolio