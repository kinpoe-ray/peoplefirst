import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useIsMobile } from '../hooks/use-mobile'
import { 
  GraduationCap, 
  Briefcase, 
  Building,
  Users,
  MessageCircle, 
  Heart,
  Share2,
  Search,
  Filter,
  PlusCircle,
  UserPlus,
  FileText,
  Download,
  TrendingUp,
  Clock,
  MapPin,
  Award,
  Star,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Linkedin,
  BookOpen,
  ChevronDown,
  X,
  Edit
} from 'lucide-react'
import { MobileCard, MobileGrid, MobileModal, MobileTabs } from './MobileOptimized'

interface AlumniPost {
  id: string
  title: string
  content: string
  industry: string
  company: string
  position: string
  tags: string[]
  created_at: string
  likes_count: number
  views_count: number
  author_name: string
  user_id: string
  is_liked?: boolean
  // 计算字段（不存储在数据库中）
  experience_years?: number
  graduation_year?: number
  major?: number
  comments_count?: number
}

interface AlumniComment {
  id: string
  content: string
  created_at: string
  author_name: string
  author_id: string
}

interface AlumniMentor {
  id: string
  mentor_id: string
  industry: string
  company: string
  position: string
  experience_years: number
  specializations: string[]
  availability: 'available' | 'busy' | 'unavailable'
  mentoring_fee: number
  bio: string
  linkedin_url?: string
  portfolio_url?: string
  is_verified: boolean
  current_mentees: number
  max_mentees: number
  created_at: string
  mentor_name: string
  mentor_avatar?: string
}

interface CareerResource {
  id: string
  title: string
  description: string
  resource_type: string
  file_url?: string
  file_type?: string
  file_size?: number
  target_audience: string
  industry_focus: string
  experience_level: string
  download_count: number
  likes_count: number
  is_featured: boolean
  tags: string[]
  created_by: string
  created_at: string
  author_name: string
}

interface MentorRequest {
  id: string
  mentor_id: string
  mentee_id: string
  request_message: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  requested_at: string
  responded_at?: string
  mentor_name?: string
}

// 卡片组件定义
interface AlumniPostCardProps {
  post: AlumniPost;
  isMobile: boolean;
}

const AlumniPostCard: React.FC<AlumniPostCardProps> = ({ post, isMobile }) => {
  const { user } = useAuth()
  const { loadingAction } = { loadingAction: false } // 这里需要从父组件传入
  const { selectedPost, setSelectedPost, comments, setComments, loadComments, newComment, setNewComment, handleAddComment, handleLikePost } = {
    selectedPost: null,
    setSelectedPost: () => {},
    comments: {},
    setComments: () => {},
    loadComments: () => {},
    newComment: '',
    setNewComment: () => {},
    handleAddComment: () => {},
    handleLikePost: () => {}
  } as any // 这里需要从父组件传入

  const getExperienceLevel = (years: number) => {
    if (years <= 1) return { text: '新人', color: 'bg-green-100 text-green-800' }
    if (years <= 3) return { text: '初级', color: 'bg-blue-100 text-blue-800' }
    if (years <= 5) return { text: '中级', color: 'bg-purple-100 text-purple-800' }
    if (years <= 8) return { text: '高级', color: 'bg-orange-100 text-orange-800' }
    return { text: '专家', color: 'bg-red-100 text-red-800' }
  }

  return (
    <MobileCard>
      {/* 帖子头部 */}
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Building className="w-4 h-4 mr-1" />
              <span>{post.company}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1" />
              <span>{post.position}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevel(post.experience_years).color}`}>
              {getExperienceLevel(post.experience_years).text} • {post.experience_years}年
            </span>
          </div>
          <div className="text-right">
            <div className="font-medium">{post.author_name}</div>
            <div className="flex items-center">
              <GraduationCap className="w-3 h-3 mr-1" />
              <span>{post.graduation_year}届 • {post.major}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
          {post.industry}
        </span>
        {post.tags.map((tag, index) => (
          <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* 内容 */}
      <div className="text-gray-700 mb-4 leading-relaxed">
        {post.content}
      </div>

      {/* 互动区域 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleLikePost(post.id)}
            disabled={loadingAction}
            className={`flex items-center space-x-2 transition-colors min-h-[44px] px-2 rounded-lg ${
              post.is_liked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{post.likes_count}</span>
          </button>
          <button
            onClick={() => {
              if (selectedPost === post.id) {
                setSelectedPost(null)
              } else {
                setSelectedPost(post.id)
                if (!comments[post.id]) {
                  loadComments(post.id)
                }
              }
            }}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors min-h-[44px] px-2 rounded-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments[post.id]?.length || 0}</span>
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-500 space-x-4">
          <span>浏览 {post.views_count}</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 评论区域 */}
      {selectedPost === post.id && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* 评论列表 */}
          <div className="space-y-3 mb-4">
            {comments[post.id]?.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.author_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* 添加评论 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的想法..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddComment(post.id)
                }
              }}
            />
            <button
              onClick={() => handleAddComment(post.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              评论
            </button>
          </div>
        </div>
      )}
    </MobileCard>
  )
}

interface AlumniMentorCardProps {
  mentor: AlumniMentor;
  isMobile: boolean;
}

const AlumniMentorCard: React.FC<AlumniMentorCardProps> = ({ mentor, isMobile }) => {
  const { user } = useAuth()
  const { showApplyMentor, setShowApplyMentor, selectedMentor, setSelectedMentor } = {
    showApplyMentor: false,
    setShowApplyMentor: () => {},
    selectedMentor: null,
    setSelectedMentor: () => {}
  } as any

  const getAvailabilityStatus = (mentor: AlumniMentor) => {
    switch (mentor.availability) {
      case 'available':
        return { text: '可接收', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'busy':
        return { text: '忙碌', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'unavailable':
        return { text: '不可用', color: 'bg-red-100 text-red-800', icon: AlertCircle }
      default:
        return { text: '未知', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  const availability = getAvailabilityStatus(mentor)
  const StatusIcon = availability.icon

  return (
    <MobileCard>
      <div className="mb-4">
        <div className="flex items-start mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shrink-0">
            {mentor.mentor_name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{mentor.mentor_name}</h3>
            <p className="text-gray-600">{mentor.position} @ {mentor.company}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {mentor.industry}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {mentor.experience_years}年经验
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${availability.color} shrink-0`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {availability.text}
              </span>
              {mentor.is_verified && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium shrink-0">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已认证
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 专长领域 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">专业领域</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.specializations.map((spec, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* 个人简介 */}
        {mentor.bio && (
          <p className="text-gray-700 mb-4 leading-relaxed">{mentor.bio}</p>
        )}

        {/* 联系方式 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 mb-4">
          <span className="text-gray-500">
            已指导 {mentor.current_mentees}/{mentor.max_mentees} 人
          </span>
        </div>

        {/* 费用信息 */}
        {mentor.mentoring_fee > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                指导费用：¥{mentor.mentoring_fee}/小时
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <button
        onClick={() => {
          setSelectedMentor(mentor)
          setShowApplyMentor(true)
        }}
        disabled={mentor.availability !== 'available' || mentor.current_mentees >= mentor.max_mentees}
        className="w-full min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        申请指导
      </button>
    </MobileCard>
  )
}

interface AlumniResourceCardProps {
  resource: CareerResource;
  isMobile: boolean;
  resourceTypes: Array<{ value: string; label: string }>;
}

const AlumniResourceCard: React.FC<AlumniResourceCardProps> = ({ resource, isMobile, resourceTypes }) => {
  const { handleDownloadResource } = { handleDownloadResource: () => {} } as any
  const { user } = useAuth()

  return (
    <MobileCard>
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-xs font-medium text-blue-600 uppercase">
                {resourceTypes.find(rt => rt.value === resource.resource_type)?.label || resource.resource_type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">{resource.description}</p>
          </div>
          {resource.is_featured && (
            <Star className="w-5 h-5 text-yellow-500 fill-current shrink-0" />
          )}
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {resource.industry_focus}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {resource.experience_level}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {resource.target_audience}
          </span>
        </div>

        {/* 文件信息 */}
        {resource.file_size && (
          <div className="text-xs text-gray-500 mb-3">
            文件大小: {(resource.file_size / 1024 / 1024).toFixed(1)} MB
            {resource.file_type && ` • ${resource.file_type.toUpperCase()}`}
          </div>
        )}

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              {resource.download_count}
            </span>
            <span className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {resource.likes_count}
            </span>
          </div>
          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>

        {/* 作者信息 */}
        <div className="text-xs text-gray-500 mb-4">
          贡献者: {resource.author_name}
        </div>
      </div>

      {/* 操作按钮 */}
      {resource.file_url ? (
        <button
          onClick={() => handleDownloadResource(resource)}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Download className="w-4 h-4 mr-2" />
          下载
        </button>
      ) : (
        <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed min-h-[44px]">
          <ExternalLink className="w-4 h-4 mr-2" />
          查看详情
        </button>
      )}
    </MobileCard>
  )
}

const AlumniHub: React.FC = () => {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'posts' | 'mentors' | 'resources'>('posts')
  const [posts, setPosts] = useState<AlumniPost[]>([])
  const [mentors, setMentors] = useState<AlumniMentor[]>([])
  const [resources, setResources] = useState<CareerResource[]>([])
  const [comments, setComments] = useState<{ [postId: string]: AlumniComment[] }>({})
  const [myMentorRequests, setMyMentorRequests] = useState<MentorRequest[]>([])
  
  // UI状态
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showApplyMentor, setShowApplyMentor] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<AlumniMentor | null>(null)
  const [applyMessage, setApplyMessage] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  // 表单状态
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    industry: '',
    company: '',
    position: '',
    experience_years: 0,
    graduation_year: new Date().getFullYear(),
    major: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')

  // 行业选项
  const industries = [
    { value: 'all', label: '全部行业' },
    { value: '互联网/软件', label: '互联网/软件' },
    { value: '金融/投资', label: '金融/投资' },
    { value: '咨询/战略', label: '咨询/战略' },
    { value: '制造/工程', label: '制造/工程' },
    { value: '教育/培训', label: '教育/培训' },
    { value: '医疗/健康', label: '医疗/健康' },
    { value: '传媒/广告', label: '传媒/广告' },
    { value: '房地产/建筑', label: '房地产/建筑' },
    { value: '零售/电商', label: '零售/电商' },
    { value: '其他', label: '其他' }
  ]

  const resourceTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'resume_template', label: '简历模板' },
    { value: 'interview_guide', label: '面试指南' },
    { value: 'portfolio_example', label: '作品集示例' },
    { value: 'job_search_tips', label: '求职技巧' },
    { value: 'industry_analysis', label: '行业分析' },
    { value: 'salary_guide', label: '薪资指南' }
  ]

  // 初始化数据加载
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'posts') {
        await loadPosts()
      } else if (activeTab === 'mentors') {
        await loadMentors()
        await loadMyMentorRequests()
      } else if (activeTab === 'resources') {
        await loadResources()
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载校友分享
  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_posts')
        .select(`
          *,
          profiles!alumni_posts_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 获取用户点赞状态
      const postIds = data?.map(post => post.id) || []
      const { data: likesData } = await supabase
        .from('social_interactions')
        .select('target_id')
        .eq('user_id', user?.id)
        .eq('interaction_type', 'like')
        .in('target_id', postIds)

      const likedPostIds = new Set(likesData?.map(like => like.target_id) || [])

      const enrichedPosts = data?.map(post => ({
        ...post,
        author_name: post.profiles?.full_name || '匿名校友',
        tags: post.tags || [],
        is_liked: likedPostIds.has(post.id)
      })) || []

      setPosts(enrichedPosts)
    } catch (error) {
      console.error('加载校友分享失败:', error)
    }
  }

  // 加载导师列表
  const loadMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_mentors')
        .select(`
          *,
          profiles!alumni_mentors_mentor_id_fkey (full_name)
        `)
        .eq('is_verified', true)
        .eq('availability', 'available')
        .order('experience_years', { ascending: false })

      if (error) throw error

      const enrichedMentors = data?.map(mentor => ({
        ...mentor,
        mentor_name: mentor.profiles?.full_name || '校友导师',
        mentor_avatar: mentor.profiles?.avatar_url
      })) || []

      setMentors(enrichedMentors)
    } catch (error) {
      console.error('加载导师列表失败:', error)
    }
  }

  // 加载求职资源
  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('career_resources')
        .select(`
          *,
          profiles!career_resources_created_by_fkey (full_name)
        `)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedResources = data?.map(resource => ({
        ...resource,
        author_name: resource.profiles?.full_name || '资源贡献者',
        tags: resource.tags || []
      })) || []

      setResources(enrichedResources)
    } catch (error) {
      console.error('加载求职资源失败:', error)
    }
  }

  // 加载我的导师申请
  const loadMyMentorRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('mentor_requests')
        .select(`
          *,
          alumni_mentors!mentor_requests_mentor_id_fkey (
            *,
            profiles!alumni_mentors_mentor_id_fkey (full_name)
          )
        `)
        .eq('mentee_id', user.id)
        .order('requested_at', { ascending: false })

      if (error) throw error

      const formattedRequests = data?.map(request => ({
        ...request,
        mentor_name: request.alumni_mentors?.profiles?.full_name || '校友导师'
      })) || []

      setMyMentorRequests(formattedRequests)
    } catch (error) {
      console.error('加载导师申请失败:', error)
    }
  }

  // 加载评论
  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('alumni_comments')
        .select(`
          *,
          profiles!alumni_comments_user_id_fkey (full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedComments = data?.map(comment => ({
        ...comment,
        author_name: comment.profiles?.full_name || '匿名用户'
      })) || []

      setComments(prev => ({
        ...prev,
        [postId]: formattedComments
      }))
    } catch (error) {
      console.error('加载评论失败:', error)
    }
  }

  // 点赞帖子
  const handleLikePost = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId)
      if (!post || loadingAction) return

      setLoadingAction(true)

      if (post.is_liked) {
        await supabase
          .from('social_interactions')
          .delete()
          .eq('user_id', user?.id)
          .eq('target_id', postId)
          .eq('interaction_type', 'like')

        await supabase
          .from('alumni_posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId)
      } else {
        await supabase
          .from('social_interactions')
          .insert({
            user_id: user?.id,
            target_user_id: post.user_id,
            target_id: postId,
            interaction_type: 'like'
          })

        await supabase
          .from('alumni_posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId)
      }

      await loadPosts()
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setLoadingAction(false)
    }
  }

  // 创建帖子
  const handleCreatePost = async () => {
    try {
      if (!newPost.title.trim() || !newPost.content.trim()) {
        alert('请填写标题和内容')
        return
      }

      const { error } = await supabase
        .from('alumni_posts')
        .insert({
          ...newPost,
          user_id: user?.id,
          likes_count: 0,
          views_count: 0,
          tags: newPost.tags
        })

      if (error) throw error

      setShowCreatePost(false)
      setNewPost({
        title: '',
        content: '',
        industry: '',
        company: '',
        position: '',
        experience_years: 0,
        graduation_year: new Date().getFullYear(),
        major: '',
        tags: []
      })
      await loadPosts()
    } catch (error) {
      console.error('发布分享失败:', error)
      alert('发布失败，请重试')
    }
  }

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 申请导师
  const handleApplyMentor = async () => {
    if (!selectedMentor || !applyMessage.trim()) return

    try {
      setLoadingAction(true)

      const { error } = await supabase
        .from('mentor_requests')
        .insert({
          mentor_id: selectedMentor.id,
          mentee_id: user?.id,
          request_message: applyMessage.trim(),
          status: 'pending'
        })

      if (error) throw error

      setShowApplyMentor(false)
      setSelectedMentor(null)
      setApplyMessage('')
      await loadMyMentorRequests()
    } catch (error) {
      console.error('申请导师失败:', error)
      alert('申请失败，请重试')
    } finally {
      setLoadingAction(false)
    }
  }

  // 下载资源
  const handleDownloadResource = async (resource: CareerResource) => {
    if (!resource.file_url) return

    try {
      // 更新下载计数
      await supabase
        .from('career_resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id)

      // 打开下载链接
      window.open(resource.file_url, '_blank')
      
      // 刷新资源列表
      await loadResources()
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  // 添加评论
  const handleAddComment = async (postId: string) => {
    try {
      if (!newComment.trim()) return

      const { error } = await supabase
        .from('alumni_comments')
        .insert({
          post_id: postId,
          user_id: user?.id,
          content: newComment.trim()
        })

      if (error) throw error

      // 更新帖子浏览数（这里不更新评论数，因为表结构没有这个字段）

      setNewComment('')
      await loadComments(postId)
      await loadPosts()
    } catch (error) {
      console.error('添加评论失败:', error)
    }
  }

  // 筛选逻辑
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesIndustry = selectedIndustry === 'all' || post.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.mentor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesIndustry = selectedIndustry === 'all' || mentor.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesIndustry = selectedIndustry === 'all' || resource.industry_focus === selectedIndustry
    const matchesType = activeTab === 'resources' && resourceTypes.find(rt => rt.value === selectedIndustry)?.value !== 'all' 
      ? resource.resource_type === selectedIndustry 
      : true
    return matchesSearch && matchesIndustry && matchesType
  })

  // 获取经验等级
  const getExperienceLevel = (years: number) => {
    if (years <= 1) return { text: '新人', color: 'bg-green-100 text-green-800' }
    if (years <= 3) return { text: '初级', color: 'bg-blue-100 text-blue-800' }
    if (years <= 5) return { text: '中级', color: 'bg-purple-100 text-purple-800' }
    if (years <= 8) return { text: '高级', color: 'bg-orange-100 text-orange-800' }
    return { text: '专家', color: 'bg-red-100 text-red-800' }
  }

  // 获取导师可用性状态
  const getAvailabilityStatus = (mentor: AlumniMentor) => {
    switch (mentor.availability) {
      case 'available':
        return { text: '可接收', color: 'bg-green-100 text-green-800', icon: CheckCircle }
      case 'busy':
        return { text: '忙碌', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
      case 'unavailable':
        return { text: '不可用', color: 'bg-red-100 text-red-800', icon: AlertCircle }
      default:
        return { text: '未知', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  // 渲染加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 页面头部 */}
      <MobileCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-600" />
              校友会
            </h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">连接校友网络，分享职场经验，寻找导师指导，获取求职资源</p>
          </div>
          {activeTab === 'posts' && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              分享经验
            </button>
          )}
        </div>

        {/* 搜索和筛选 */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={
                activeTab === 'posts' 
                  ? "搜索分享内容、公司或职位..." 
                  : activeTab === 'mentors'
                  ? "搜索导师、公司或专业领域..."
                  : "搜索求职资源..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              {activeTab === 'resources' ? resourceTypes.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              )) : industries.map(industry => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </MobileCard>

      {/* 标签页 */}
      <MobileTabs 
        tabs={[
          {
            id: 'posts',
            label: '经验分享',
            icon: <MessageCircle className="w-4 h-4" />,
            content: (
              <>
                {/* 经验分享标签页 */}
                <MobileGrid cols={1} gap={4}>
                  {filteredPosts.map((post) => (
                    <AlumniPostCard key={post.id} post={post} isMobile={isMobile} />
                  ))}
                </MobileGrid>
                
                {/* 空状态 */}
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">还没有经验分享</h3>
                    <p className="text-gray-600">成为第一个分享职场经验的校友吧！</p>
                  </div>
                )}
              </>
            )
          },
          {
            id: 'mentors',
            label: '导师匹配',
            icon: <Users className="w-4 h-4" />,
            content: (
              <>
                {/* 导师匹配标签页 */}
                {/* 我的申请状态 */}
                {myMentorRequests.length > 0 && (
                  <MobileCard className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      我的导师申请
                    </h3>
                    <div className="space-y-2">
                      {myMentorRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <span className="font-medium text-gray-900">{request.mentor_name}</span>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {request.status === 'pending' ? '待审核' :
                               request.status === 'accepted' ? '已接受' :
                               request.status === 'rejected' ? '已拒绝' : '已完成'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </MobileCard>
                )}
                
                <MobileGrid cols={1} gap={4}>
                  {filteredMentors.map((mentor) => (
                    <AlumniMentorCard key={mentor.id} mentor={mentor} isMobile={isMobile} />
                  ))}
                </MobileGrid>
                
                {/* 空状态 */}
                {filteredMentors.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无导师</h3>
                    <p className="text-gray-600">请尝试调整搜索条件或稍后再来查看</p>
                  </div>
                )}
              </>
            )
          },
          {
            id: 'resources',
            label: '求职资源',
            icon: <FileText className="w-4 h-4" />,
            content: (
              <>
                {/* 求职资源标签页 */}
                <MobileGrid cols={1} gap={4}>
                  {filteredResources.map((resource) => (
                    <AlumniResourceCard key={resource.id} resource={resource} isMobile={isMobile} resourceTypes={resourceTypes} />
                  ))}
                </MobileGrid>
                
                {/* 空状态 */}
                {filteredResources.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无求职资源</h3>
                    <p className="text-gray-600">请尝试调整搜索条件或联系校友会添加资源</p>
                  </div>
                )}
              </>
            )
          }
        ]}
        defaultTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'posts' | 'mentors' | 'resources')}
      />

      {/* 发布分享弹窗 */}
      <MobileModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        title="分享职场经验"
        size={isMobile ? 'full' : 'lg'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              placeholder="给你的分享起个吸引人的标题"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司</label>
              <input
                type="text"
                value={newPost.company}
                onChange={(e) => setNewPost(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                placeholder="目前就职的公司"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
              <input
                type="text"
                value={newPost.position}
                onChange={(e) => setNewPost(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                placeholder="你的职位"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">行业</label>
              <select
                value={newPost.industry}
                onChange={(e) => setNewPost(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                <option value="">选择行业</option>
                {industries.slice(1).map(industry => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">工作年限</label>
              <input
                type="number"
                value={newPost.experience_years}
                onChange={(e) => setNewPost(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                min={0}
                max={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">毕业年份</label>
              <input
                type="number"
                value={newPost.graduation_year}
                onChange={(e) => setNewPost(prev => ({ ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                min={1980}
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">专业</label>
            <input
              type="text"
              value={newPost.major}
              onChange={(e) => setNewPost(prev => ({ ...prev, major: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              placeholder="你的专业"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
                placeholder="输入标签名称"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newPost.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分享内容</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="分享你的职场经验、成长心得、求职建议等..."
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCreatePost}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            发布分享
          </button>
          <button
            onClick={() => setShowCreatePost(false)}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            取消
          </button>
        </div>
      </MobileModal>

      {/* 申请导师弹窗 */}
      <MobileModal
        isOpen={showApplyMentor}
        onClose={() => setShowApplyMentor(false)}
        title="申请导师指导"
        size={isMobile ? 'full' : 'md'}
      >
        {selectedMentor && (
          <>
            {/* 导师信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {selectedMentor.mentor_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{selectedMentor.mentor_name}</h4>
                  <p className="text-gray-600">{selectedMentor.position} @ {selectedMentor.company}</p>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedMentor.industry} • {selectedMentor.experience_years}年经验
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMentor.specializations.map((spec, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">申请理由</label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请简要说明你希望从这位导师那里学习什么，以及你的学习目标和背景..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleApplyMentor}
                disabled={!applyMessage.trim() || loadingAction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
              >
                {loadingAction ? '提交中...' : '提交申请'}
              </button>
              <button
                onClick={() => setShowApplyMentor(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                取消
              </button>
            </div>
          </>
        )}
      </MobileModal>
    </div>
  )
}

export default AlumniHub