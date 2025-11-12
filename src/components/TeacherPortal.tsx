import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
  PieChart,
  Activity,
  User,
  BookMarked,
  GraduationCap,
  ClipboardList,
  X,
  ChevronDown,
  ExternalLink,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

interface Question {
  id: string
  title: string
  question_text: string
  question_type: string
  subject_area: string
  difficulty_level: string
  options?: any
  correct_answer: string
  explanation?: string
  points: number
  time_limit?: number
  tags: string[]
  created_by: string
  usage_count: number
  accuracy_rate: number
  is_public: boolean
  is_verified: boolean
  verified_by?: string
  verified_at?: string
  created_at: string
  updated_at: string
  creator_name?: string
}

interface QuestionStats {
  total_questions: number
  verified_questions: number
  public_questions: number
  average_accuracy: number
  subject_distribution: { [key: string]: number }
  difficulty_distribution: { [key: string]: number }
}

interface StudentProgress {
  student_id: string
  student_name: string
  completed_assignments: number
  average_score: number
  last_activity: string
  badges_earned: number
}

const TeacherPortal: React.FC = () => {
  const { user } = useAuth()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'question-bank' | 'courses' | 'analytics' | 'resources' | 'assignments'>('question-bank')
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<QuestionStats | null>(null)
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  // 筛选选项
  const subjectAreas = [
    { value: 'all', label: '全部学科' },
    { value: '编程基础', label: '编程基础' },
    { value: '前端开发', label: '前端开发' },
    { value: '算法与数据结构', label: '算法与数据结构' },
    { value: '高等数学', label: '高等数学' },
    { value: '线性代数', label: '线性代数' },
    { value: 'UI设计', label: 'UI设计' },
    { value: '英语语法', label: '英语语法' },
    { value: '数据库', label: '数据库' }
  ]

  const difficultyLevels = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
    { value: 'expert', label: '专家级' }
  ]

  const questionTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'multiple_choice', label: '选择题' },
    { value: 'short_answer', label: '简答题' },
    { value: 'essay', label: '论述题' },
    { value: 'true_false', label: '判断题' },
    { value: 'coding', label: '编程题' }
  ]

  // 初始化数据加载
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'question-bank') {
        await loadQuestions()
        await loadStats()
      } else if (activeTab === 'analytics') {
        await loadStudentProgress()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载题目列表
  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select(`
          *,
          profiles!question_bank_created_by_fkey (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedQuestions = data?.map(question => ({
        ...question,
        creator_name: question.profiles?.full_name || '未知用户',
        tags: question.tags || []
      })) || []

      setQuestions(enrichedQuestions)
    } catch (error) {
      console.error('加载题目列表失败:', error)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('subject_area, difficulty_level, accuracy_rate, is_verified, is_public')

      if (error) throw error

      const total = data?.length || 0
      const verified = data?.filter(q => q.is_verified).length || 0
      const publicQuestions = data?.filter(q => q.is_public).length || 0
      const averageAccuracy = total > 0 
        ? data.reduce((sum, q) => sum + (q.accuracy_rate || 0), 0) / total 
        : 0

      const subjectDistribution = data?.reduce((dist, q) => {
        dist[q.subject_area] = (dist[q.subject_area] || 0) + 1
        return dist
      }, {} as Record<string, number>) || {}

      const difficultyDistribution = data?.reduce((dist, q) => {
        dist[q.difficulty_level] = (dist[q.difficulty_level] || 0) + 1
        return dist
      }, {} as Record<string, number>) || {}

      setStats({
        total_questions: total,
        verified_questions: verified,
        public_questions: publicQuestions,
        average_accuracy: Math.round(averageAccuracy * 100) / 100,
        subject_distribution: subjectDistribution,
        difficulty_distribution: difficultyDistribution
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 加载学生进度
  const loadStudentProgress = async () => {
    try {
      // 模拟学生进度数据
      const mockProgress: StudentProgress[] = [
        {
          student_id: '1',
          student_name: '张三',
          completed_assignments: 15,
          average_score: 85.6,
          last_activity: '2024-11-01',
          badges_earned: 8
        },
        {
          student_id: '2',
          student_name: '李四',
          completed_assignments: 22,
          average_score: 92.3,
          last_activity: '2024-11-02',
          badges_earned: 12
        },
        {
          student_id: '3',
          student_name: '王五',
          completed_assignments: 18,
          average_score: 78.9,
          last_activity: '2024-10-30',
          badges_earned: 6
        },
        {
          student_id: '4',
          student_name: '赵六',
          completed_assignments: 25,
          average_score: 94.7,
          last_activity: '2024-11-03',
          badges_earned: 15
        }
      ]

      setStudentProgress(mockProgress)
    } catch (error) {
      console.error('加载学生进度失败:', error)
    }
  }

  // 创建题目
  const handleCreateQuestion = async (questionData: Partial<Question>) => {
    try {
      setLoadingAction(true)

      const { error } = await supabase
        .from('question_bank')
        .insert({
          ...questionData,
          created_by: user?.id,
          usage_count: 0,
          accuracy_rate: 0,
          is_public: true,
          is_verified: false
        })

      if (error) throw error

      setShowCreateModal(false)
      await loadQuestions()
      await loadStats()
    } catch (error) {
      console.error('创建题目失败:', error)
      alert('创建失败，请重试')
    } finally {
      setLoadingAction(false)
    }
  }

  // 删除题目
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('确定要删除这道题目吗？')) return

    try {
      const { error } = await supabase
        .from('question_bank')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      await loadQuestions()
      await loadStats()
    } catch (error) {
      console.error('删除题目失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 验证题目
  const handleVerifyQuestion = async (questionId: string) => {
    try {
      setLoadingAction(true)

      const { error } = await supabase
        .from('question_bank')
        .update({
          is_verified: true,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', questionId)

      if (error) throw error

      await loadQuestions()
    } catch (error) {
      console.error('验证题目失败:', error)
      alert('验证失败，请重试')
    } finally {
      setLoadingAction(false)
    }
  }

  // 获取题目类型显示名称
  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '选择题'
      case 'short_answer':
        return '简答题'
      case 'essay':
        return '论述题'
      case 'true_false':
        return '判断题'
      case 'coding':
        return '编程题'
      default:
        return type
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

  // 获取验证状态样式
  const getVerificationStyle = (isVerified: boolean) => {
    if (isVerified) {
      return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: '已验证' }
    } else {
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: '未验证' }
    }
  }

  // 筛选逻辑
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = selectedSubject === 'all' || question.subject_area === selectedSubject
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty_level === selectedDifficulty
    const matchesType = selectedType === 'all' || question.question_type === selectedType
    return matchesSearch && matchesSubject && matchesDifficulty && matchesType
  })

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
              <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
              教师协作平台
            </h1>
            <p className="text-gray-600 mt-2">管理题库课程，分析学生表现，提升教学质量</p>
          </div>
          {activeTab === 'question-bank' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建题目
            </button>
          )}
        </div>

        {/* 标签页导航 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('question-bank')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'question-bank' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            题库管理
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'courses' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookMarked className="w-4 h-4 inline mr-2" />
            课程管理
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            学生分析
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'resources' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            教学资源
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'assignments' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-2" />
            作业管理
          </button>
        </div>

        {/* 搜索和筛选 */}
        {activeTab === 'question-bank' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索题目标题、内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subjectAreas.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 题库管理标签页 */}
      {activeTab === 'question-bank' && (
        <div className="space-y-6">
          {/* 统计概览 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">总题目数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_questions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">已验证</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verified_questions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">公开题目</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.public_questions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">平均准确率</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.average_accuracy}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 题目列表 */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const difficultyStyle = getDifficultyStyle(question.difficulty_level)
              const verificationStyle = getVerificationStyle(question.is_verified)
              const VerificationIcon = verificationStyle.icon

              return (
                <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">{question.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${verificationStyle.bg} ${verificationStyle.text}`}>
                          <VerificationIcon className="w-3 h-3 mr-1" />
                          {verificationStyle.label}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{question.question_text}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {question.creator_name}
                        </span>
                        <span>{getQuestionTypeName(question.question_type)}</span>
                        <span>{question.subject_area}</span>
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {question.points}分
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {question.time_limit}分钟
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text} border ${difficultyStyle.border}`}>
                        {difficultyLevels.find(d => d.value === question.difficulty_level)?.label || question.difficulty_level}
                      </span>
                    </div>
                  </div>

                  {/* 标签 */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        使用次数: {question.usage_count}
                      </span>
                      <span className="flex items-center">
                        <Target className="w-4 h-4 mr-1" />
                        准确率: {question.accuracy_rate}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!question.is_verified && (
                        <button
                          onClick={() => handleVerifyQuestion(question.id)}
                          disabled={loadingAction}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          验证
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedQuestion(question)
                          setShowEditModal(true)
                        }}
                        className="flex items-center px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 空状态 */}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无题目</h3>
              <p className="text-gray-600 mb-4">创建你的第一道题目来丰富题库</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建题目
              </button>
            </div>
          )}
        </div>
      )}

      {/* 学生分析标签页 */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              学生表现分析
            </h2>
            
            <div className="space-y-4">
              {studentProgress.map((student) => (
                <div key={student.student_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {student.student_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{student.student_name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <ClipboardList className="w-4 h-4 mr-1" />
                          完成作业: {student.completed_assignments}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          获得徽章: {student.badges_earned}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          最后活动: {student.last_activity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{student.average_score}</div>
                    <div className="text-sm text-gray-500">平均分数</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 其他标签页的占位符 */}
      {(activeTab === 'courses' || activeTab === 'resources' || activeTab === 'assignments') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'courses' && '课程管理功能'}
            {activeTab === 'resources' && '教学资源功能'}
            {activeTab === 'assignments' && '作业管理功能'}
          </h3>
          <p className="text-gray-600">该功能正在开发中，敬请期待...</p>
        </div>
      )}

      {/* 创建题目弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">创建新题目</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <CreateQuestionForm
              onSubmit={handleCreateQuestion}
              onCancel={() => setShowCreateModal(false)}
              loading={loadingAction}
            />
          </div>
        </div>
      )}

      {/* 编辑题目弹窗 */}
      {showEditModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑题目</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <EditQuestionForm
              question={selectedQuestion}
              onSubmit={(data) => {
                // 处理编辑逻辑
                setShowEditModal(false)
              }}
              onCancel={() => setShowEditModal(false)}
              loading={loadingAction}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// 创建题目表单组件
const CreateQuestionForm: React.FC<{
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
}> = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    question_text: '',
    question_type: 'multiple_choice',
    subject_area: '编程基础',
    difficulty_level: 'beginner',
    correct_answer: '',
    explanation: '',
    points: 1,
    time_limit: 5,
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="输入题目标题"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
          <select
            value={formData.question_type}
            onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="multiple_choice">选择题</option>
            <option value="short_answer">简答题</option>
            <option value="essay">论述题</option>
            <option value="true_false">判断题</option>
            <option value="coding">编程题</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">题目内容</label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入题目内容..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">学科领域</label>
          <select
            value={formData.subject_area}
            onChange={(e) => setFormData(prev => ({ ...prev, subject_area: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="编程基础">编程基础</option>
            <option value="前端开发">前端开发</option>
            <option value="算法与数据结构">算法与数据结构</option>
            <option value="高等数学">高等数学</option>
            <option value="线性代数">线性代数</option>
            <option value="UI设计">UI设计</option>
            <option value="英语语法">英语语法</option>
            <option value="数据库">数据库</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
            <option value="expert">专家级</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分值</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">正确答案</label>
        <input
          type="text"
          value={formData.correct_answer}
          onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入正确答案"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">解析说明</label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入题目解析..."
        />
      </div>

      {/* 标签管理 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="输入标签名称"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '创建中...' : '创建题目'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}

// 编辑题目表单组件
const EditQuestionForm: React.FC<{
  question: Question
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
}> = ({ question, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: question.title,
    question_text: question.question_text,
    question_type: question.question_type,
    subject_area: question.subject_area,
    difficulty_level: question.difficulty_level,
    correct_answer: question.correct_answer,
    explanation: question.explanation || '',
    points: question.points,
    time_limit: question.time_limit || 5,
    tags: question.tags || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目标题</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">题目类型</label>
          <select
            value={formData.question_type}
            onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="multiple_choice">选择题</option>
            <option value="short_answer">简答题</option>
            <option value="essay">论述题</option>
            <option value="true_false">判断题</option>
            <option value="coding">编程题</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">题目内容</label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">学科领域</label>
          <select
            value={formData.subject_area}
            onChange={(e) => setFormData(prev => ({ ...prev, subject_area: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="编程基础">编程基础</option>
            <option value="前端开发">前端开发</option>
            <option value="算法与数据结构">算法与数据结构</option>
            <option value="高等数学">高等数学</option>
            <option value="线性代数">线性代数</option>
            <option value="UI设计">UI设计</option>
            <option value="英语语法">英语语法</option>
            <option value="数据库">数据库</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">难度等级</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
            <option value="expert">专家级</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分值</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">正确答案</label>
        <input
          type="text"
          value={formData.correct_answer}
          onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">解析说明</label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '保存中...' : '保存修改'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  )
}

export default TeacherPortal