import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Trophy,
  Target,
  Users,
  Clock,
  Star,
  Calendar,
  Award,
  TrendingUp,
  Search,
  Filter,
  Play,
  CheckCircle,
  AlertCircle,
  Eye,
  Share2,
  Heart,
  MessageCircle,
  ChevronRight,
  Zap,
  Crown,
  Medal,
  Code,
  Palette,
  Presentation,
  Brain,
  Building,
  UserPlus,
  ExternalLink,
  BarChart3,
  User,
  PlusCircle,
  X
} from 'lucide-react'

interface SkillChallenge {
  id: string
  title: string
  description: string
  challenge_type: string
  difficulty_level: string
  skills_required: string[]
  max_participants: number
  current_participants: number
  start_time: string
  end_time: string
  registration_deadline: string
  prize_description?: string
  prize_amount: number
  rules: string
  resources?: string[]
  created_by: string
  status: string
  is_public: boolean
  created_at: string
  updated_at: string
  creator_name?: string
  registration_status?: 'not_registered' | 'registered' | 'submitted' | 'completed'
}

interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  team_name?: string
  registration_time: string
  submission_time?: string
  score?: number
  max_score: number
  ranking?: number
  status: string
  submission_link?: string
  notes?: string
  user_name?: string
  user_avatar?: string
  challenge_title?: string
}

const SkillArena: React.FC = () => {
  const { user } = useAuth()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'browse' | 'participate' | 'leaderboard' | 'my-challenges'>('browse')
  const [challenges, setChallenges] = useState<SkillChallenge[]>([])
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [myParticipations, setMyParticipations] = useState<ChallengeParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedChallenge, setSelectedChallenge] = useState<SkillChallenge | null>(null)
  const [showChallengeDetail, setShowChallengeDetail] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  // 筛选选项
  const challengeTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'coding', label: '编程挑战' },
    { value: 'design', label: '设计竞赛' },
    { value: 'presentation', label: '演讲比赛' },
    { value: 'problem_solving', label: '问题解决' },
    { value: 'team_competition', label: '团队竞赛' },
    { value: 'individual', label: '个人挑战' }
  ]

  const difficultyLevels = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
    { value: 'expert', label: '专家级' }
  ]

  const challengeStatuses = [
    { value: 'all', label: '全部状态' },
    { value: 'open', label: '报名中' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已结束' },
    { value: 'draft', label: '草稿' },
    { value: 'cancelled', label: '已取消' }
  ]

  // 初始化数据加载
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'browse') {
        await loadChallenges()
      } else if (activeTab === 'participate') {
        await loadChallenges()
        await loadMyParticipations()
      } else if (activeTab === 'leaderboard') {
        await loadLeaderboard()
      } else if (activeTab === 'my-challenges') {
        await loadMyParticipations()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载挑战列表
  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_challenges')
        .select(`
          *,
          profiles!skill_challenges_created_by_fkey (full_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedChallenges = data?.map(challenge => ({
        ...challenge,
        creator_name: challenge.profiles?.full_name || '系统',
        skills_required: challenge.skills_required || [],
        resources: challenge.resources || []
      })) || []

      setChallenges(enrichedChallenges)
    } catch (error) {
      console.error('加载挑战列表失败:', error)
    }
  }

  // 加载排行榜
  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          skill_challenges!challenge_participants_challenge_id_fkey (title),
          profiles!challenge_participants_user_id_fkey (full_name)
        `)
        .not('score', 'is', null)
        .order('score', { ascending: false })
        .order('ranking', { ascending: true })

      if (error) throw error

      const enrichedParticipants = data?.map(participant => ({
        ...participant,
        user_name: participant.profiles?.full_name || '匿名用户',
        user_avatar: participant.profiles?.avatar_url,
        challenge_title: participant.skill_challenges?.title || '未知挑战'
      })) || []

      setParticipants(enrichedParticipants)
    } catch (error) {
      console.error('加载排行榜失败:', error)
    }
  }

  // 加载我的参赛记录
  const loadMyParticipations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          skill_challenges!challenge_participants_challenge_id_fkey (*)
        `)
        .eq('user_id', user.id)
        .order('registration_time', { ascending: false })

      if (error) throw error

      const enrichedParticipations = data?.map(participation => ({
        ...participation,
        challenge_title: participation.skill_challenges?.title || '未知挑战',
        skills_required: participation.skill_challenges?.skills_required || [],
        resources: participation.skill_challenges?.resources || []
      })) || []

      setMyParticipations(enrichedParticipations)
    } catch (error) {
      console.error('加载参赛记录失败:', error)
    }
  }

  // 报名挑战
  const handleRegisterChallenge = async () => {
    if (!selectedChallenge || !user) return

    try {
      setLoadingAction(true)

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: selectedChallenge.id,
          user_id: user.id,
          team_name: selectedChallenge.challenge_type === 'team_competition' ? `Team_${user.email?.split('@')[0]}` : null,
          status: 'registered',
          max_score: 100
        })

      if (error) throw error

      // 更新挑战的当前参与人数
      await supabase
        .from('skill_challenges')
        .update({ current_participants: selectedChallenge.current_participants + 1 })
        .eq('id', selectedChallenge.id)

      setShowRegistrationModal(false)
      setSelectedChallenge(null)
      setRegistrationMessage('')
      await loadChallenges()
      await loadMyParticipations()
    } catch (error) {
      console.error('报名失败:', error)
      alert('报名失败，请重试')
    } finally {
      setLoadingAction(false)
    }
  }

  // 获取挑战类型图标
  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return Code
      case 'design':
        return Palette
      case 'presentation':
        return Presentation
      case 'problem_solving':
        return Brain
      case 'team_competition':
        return Users
      case 'individual':
        return User
      default:
        return Target
    }
  }

  // 获取难度等级样式
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
      case 'intermediate':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }
      case 'advanced':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' }
      case 'expert':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Play }
      case 'completed':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Trophy }
      case 'draft':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle }
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: X }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock }
    }
  }

  // 获取参与状态样式
  const getParticipationStatusStyle = (status: string) => {
    switch (status) {
      case 'registered':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: UserPlus }
      case 'submitted':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: CheckCircle }
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: Trophy }
      case 'disqualified':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: X }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock }
    }
  }

  // 获取排名图标
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{ranking}</span>
    }
  }

  // 筛选逻辑
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.skills_required.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'all' || challenge.challenge_type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty_level === selectedDifficulty
    const matchesStatus = selectedStatus === 'all' || challenge.status === selectedStatus
    return matchesSearch && matchesType && matchesDifficulty && matchesStatus
  })

  // 检查时间状态
  const getTimeStatus = (challenge: SkillChallenge) => {
    const now = new Date()
    const startTime = new Date(challenge.start_time)
    const endTime = new Date(challenge.end_time)
    const deadline = new Date(challenge.registration_deadline)

    if (now < deadline) return 'registration_open'
    if (now >= deadline && now < startTime) return 'registration_closed'
    if (now >= startTime && now <= endTime) return 'in_progress'
    if (now > endTime) return 'ended'
    return 'unknown'
  }

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
              <Trophy className="w-8 h-8 mr-3 text-blue-600" />
              技能竞技场
            </h1>
            <p className="text-gray-600 mt-2">参与技能挑战，展示才华，与同龄人竞技成长</p>
          </div>
          {activeTab === 'participate' && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{myParticipations.length}</div>
                <div className="text-sm text-gray-500">参赛次数</div>
              </div>
            </div>
          )}
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
            浏览挑战
          </button>
          <button
            onClick={() => setActiveTab('participate')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'participate' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            参加挑战
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'leaderboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            排行榜
          </button>
          <button
            onClick={() => setActiveTab('my-challenges')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'my-challenges' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            我的参赛
          </button>
        </div>

        {/* 搜索和筛选 */}
        {(activeTab === 'browse' || activeTab === 'participate') && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索挑战名称、描述或技能要求..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {challengeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficultyLevels.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {challengeStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 浏览挑战标签页 */}
      {(activeTab === 'browse' || activeTab === 'participate') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => {
            const TypeIcon = getChallengeTypeIcon(challenge.challenge_type)
            const difficultyStyle = getDifficultyStyle(challenge.difficulty_level)
            const statusStyle = getStatusStyle(challenge.status)
            const StatusIcon = statusStyle.icon
            const timeStatus = getTimeStatus(challenge)
            
            const isRegistrationOpen = timeStatus === 'registration_open'
            const isFull = challenge.current_participants >= challenge.max_participants

            return (
              <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* 挑战头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start flex-1">
                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                      <TypeIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{challenge.description}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {challenge.creator_name}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {challenge.current_participants}/{challenge.max_participants}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(challenge.start_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} mb-2`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {challengeStatuses.find(s => s.value === challenge.status)?.label || challenge.status}
                    </div>
                    {challenge.prize_amount > 0 && (
                      <div className="text-sm font-semibold text-green-600">
                        ¥{challenge.prize_amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* 技能要求 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">技能要求</h4>
                  <div className="flex flex-wrap gap-2">
                    {challenge.skills_required.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 难度标签 */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text} border ${difficultyStyle.border}`}>
                    {difficultyLevels.find(d => d.value === challenge.difficulty_level)?.label || challenge.difficulty_level}
                  </span>
                </div>

                {/* 时间信息 */}
                <div className="mb-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      报名截止: {new Date(challenge.registration_deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      开始时间: {new Date(challenge.start_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => {
                        setSelectedChallenge(challenge)
                        setShowChallengeDetail(true)
                      }}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看详情</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>收藏</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>分享</span>
                    </button>
                  </div>
                  
                  {(activeTab === 'participate') && (
                    <button
                      onClick={() => {
                        setSelectedChallenge(challenge)
                        setShowRegistrationModal(true)
                      }}
                      disabled={!isRegistrationOpen || isFull}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                        isRegistrationOpen && !isFull
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {!isRegistrationOpen 
                        ? '报名已结束' 
                        : isFull 
                        ? '名额已满' 
                        : '立即报名'
                      }
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 排行榜标签页 */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              挑战排行榜
            </h2>
            
            <div className="space-y-4">
              {participants.slice(0, 20).map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center mr-4">
                      {getRankingIcon(participant.ranking || index + 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{participant.user_name}</h3>
                      <p className="text-sm text-gray-600">{participant.challenge_title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{participant.score}</div>
                    <div className="text-sm text-gray-500">分数</div>
                  </div>
                </div>
              ))}
            </div>

            {participants.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无排行榜数据</h3>
                <p className="text-gray-600">完成挑战后即可参与排名</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 我的参赛标签页 */}
      {activeTab === 'my-challenges' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myParticipations.map((participation) => {
              const participationStyle = getParticipationStatusStyle(participation.status)
              const ParticipationIcon = participationStyle.icon

              return (
                <div key={participation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{participation.challenge_title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${participationStyle.bg} ${participationStyle.text}`}>
                      <ParticipationIcon className="w-3 h-3 mr-1" />
                      {participation.status === 'registered' ? '已报名' :
                       participation.status === 'submitted' ? '已提交' :
                       participation.status === 'completed' ? '已完成' : '已取消'}
                    </span>
                  </div>

                  {participation.team_name && (
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">团队: </span>
                      <span className="font-medium text-gray-900">{participation.team_name}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      报名时间: {new Date(participation.registration_time).toLocaleDateString()}
                    </div>
                    {participation.submission_time && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        提交时间: {new Date(participation.submission_time).toLocaleDateString()}
                      </div>
                    )}
                    {participation.score !== null && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        得分: {participation.score}/{participation.max_score}
                      </div>
                    )}
                    {participation.ranking && (
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        排名: #{participation.ranking}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        const challenge = challenges.find(c => c.id === participation.challenge_id)
                        if (challenge) {
                          setSelectedChallenge(challenge)
                          setShowChallengeDetail(true)
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      查看挑战
                    </button>
                    {participation.submission_link && (
                      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        查看作品
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {myParticipations.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有参赛记录</h3>
              <p className="text-gray-600 mb-4">选择一个挑战开始你的竞技之旅</p>
              <button 
                onClick={() => setActiveTab('participate')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                去报名
              </button>
            </div>
          )}
        </div>
      )}

      {/* 空状态 */}
      {(activeTab === 'browse' || activeTab === 'participate') && filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无挑战</h3>
          <p className="text-gray-600">请尝试调整搜索条件或稍后再来查看</p>
        </div>
      )}

      {/* 挑战详情弹窗 */}
      {showChallengeDetail && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedChallenge.title}</h2>
              <button
                onClick={() => setShowChallengeDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 挑战信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">挑战描述</h3>
                <p className="text-gray-700 leading-relaxed">{selectedChallenge.description}</p>
              </div>

              {/* 技能要求 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">技能要求</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedChallenge.skills_required.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* 奖励信息 */}
              {selectedChallenge.prize_amount > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">奖励设置</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ¥{selectedChallenge.prize_amount.toLocaleString()}
                    </div>
                    <p className="text-green-800">{selectedChallenge.prize_description}</p>
                  </div>
                </div>
              )}

              {/* 挑战规则 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">挑战规则</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-gray-700 whitespace-pre-wrap">{selectedChallenge.rules}</pre>
                </div>
              </div>

              {/* 学习资源 */}
              {selectedChallenge.resources && selectedChallenge.resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">学习资源</h3>
                  <ul className="space-y-2">
                    {selectedChallenge.resources.map((resource, index) => (
                      <li key={index} className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-blue-600 mr-2" />
                        <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                          {resource}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 时间安排 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">时间安排</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">报名截止</div>
                    <div className="text-blue-900">{new Date(selectedChallenge.registration_deadline).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm text-purple-600 font-medium">挑战开始</div>
                    <div className="text-purple-900">{new Date(selectedChallenge.start_time).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-600 font-medium">挑战结束</div>
                    <div className="text-red-900">{new Date(selectedChallenge.end_time).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-4">
                {activeTab === 'participate' && (
                  <button
                    onClick={() => {
                      setShowChallengeDetail(false)
                      setShowRegistrationModal(true)
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    立即报名
                  </button>
                )}
                <button
                  onClick={() => setShowChallengeDetail(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 报名弹窗 */}
      {showRegistrationModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">报名挑战</h3>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedChallenge.title}</h4>
              <p className="text-gray-600 text-sm">{selectedChallenge.description}</p>
            </div>

            {selectedChallenge.challenge_type === 'team_competition' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">团队名称</label>
                <input
                  type="text"
                  value={registrationMessage}
                  onChange={(e) => setRegistrationMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入你的团队名称"
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-blue-900 mb-2">报名须知</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请确保你有足够的时间完成挑战</li>
                <li>• 报名后请积极参与，不要中途退出</li>
                <li>• 严格按照规则和要求提交作品</li>
                <li>• 诚信参赛，杜绝抄袭行为</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRegisterChallenge}
                disabled={loadingAction || (selectedChallenge.challenge_type === 'team_competition' && !registrationMessage.trim())}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loadingAction ? '报名中...' : '确认报名'}
              </button>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillArena