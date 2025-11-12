import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Crown, 
  Search, 
  Filter, 
  Star, 
  UserPlus, 
  MessageCircle,
  Activity,
  TrendingUp,
  Award,
  Shield
} from 'lucide-react'
import GuildChat from '../components/GuildChat'
import { MobileCard, MobileGrid, MobileModal, MobileTabs } from '../components/MobileOptimized'
import { useIsMobile } from '../hooks/use-mobile'

interface Guild {
  id: string
  name: string
  description: string
  category: string
  member_count: number
  max_members: number
  guild_level: number
  created_at: string
  creator_name?: string
  is_member?: boolean
  role?: 'leader' | 'moderator' | 'member'
  profiles?: {
    full_name: string
  }
}

interface GuildMember {
  id: string
  user_id: string
  guild_id: string
  role: 'leader' | 'moderator' | 'member'
  joined_at: string
  full_name: string
}

const Guilds: React.FC = () => {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [myGuilds, setMyGuilds] = useState<Guild[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'discover' | 'my-guilds'>('discover')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    category: '',
    max_members: 50
  })

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'IT技术', label: 'IT技术' },
    { value: '产品运营', label: '产品运营' },
    { value: '设计创意', label: '设计创意' },
    { value: '市场营销', label: '市场营销' },
    { value: '金融财务', label: '金融财务' },
    { value: '数据分析', label: '数据分析' },
    { value: '项目管理', label: '项目管理' },
    { value: '人力资源', label: '人力资源' }
  ]

// 公会卡片组件
interface GuildCardProps {
  guild: Guild;
  activeTab: 'discover' | 'my-guilds';
  isMobile: boolean;
}

const GuildCard: React.FC<GuildCardProps> = ({ guild, activeTab, isMobile }) => {
  const { user } = useAuth()

  const getGuildLevelColor = (level: number) => {
    if (level >= 10) return 'bg-purple-500'
    if (level >= 5) return 'bg-blue-500'
    if (level >= 2) return 'bg-green-500'
    return 'bg-gray-500'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <Users className="w-4 h-4 text-gray-500" />
    }
  }

  const handleJoinGuild = async (guildId: string) => {
    try {
      const { error } = await supabase
        .from('guild_members')
        .insert({
          user_id: user?.id,
          guild_id: guildId,
          role: 'member'
        })

      if (error) throw error

      // 更新公会成员数量
      await supabase.rpc('increment_guild_members', { guild_id: guildId })
      window.location.reload()
    } catch (error) {
      console.error('加入公会失败:', error)
      alert('加入公会失败，请重试')
    }
  }

  const handleLeaveGuild = async (guildId: string) => {
    try {
      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', user?.id)
        .eq('guild_id', guildId)

      if (error) throw error

      // 更新公会成员数量
      await supabase.rpc('decrement_guild_members', { guild_id: guildId })
      window.location.reload()
    } catch (error) {
      console.error('退出公会失败:', error)
      alert('退出公会失败，请重试')
    }
  }

  return (
    <MobileCard className="hover:shadow-lg transition-shadow">
      {/* 公会头部 */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{guild.name}</h3>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {guild.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-white text-xs font-medium ${getGuildLevelColor(guild.guild_level)}`}>
              Lv.{guild.guild_level}
            </div>
            {activeTab === 'my-guilds' && guild.role && getRoleIcon(guild.role)}
          </div>
        </div>
      </div>

      {/* 公会描述 */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {guild.description || '暂无描述'}
      </p>

      {/* 公会统计 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          <span>{guild.member_count}/{guild.max_members}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Activity className="w-4 h-4 mr-1" />
          <span>活跃</span>
        </div>
      </div>

      {/* 成员进度条 */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${(guild.member_count / guild.max_members) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 创建者信息 */}
      <div className="text-xs text-gray-500 mb-4">
        创建者: {guild.creator_name}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        {activeTab === 'discover' && (
          <>
            {guild.is_member ? (
              <button
                onClick={() => handleLeaveGuild(guild.id)}
                className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm min-h-[44px]"
              >
                退出公会
              </button>
            ) : (
              <button
                onClick={() => handleJoinGuild(guild.id)}
                disabled={guild.member_count >= guild.max_members}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px]"
              >
                {guild.member_count >= guild.max_members ? '已满员' : '加入公会'}
              </button>
            )}
          </>
        )}
        {activeTab === 'my-guilds' && (
          <>
            <button
              onClick={() => {
                // 这里可以处理进入公会的逻辑
                console.log('进入公会:', guild.id)
              }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm min-h-[44px]"
            >
              进入公会
            </button>
            <button
              onClick={() => handleLeaveGuild(guild.id)}
              className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors min-h-[44px]"
            >
              退出
            </button>
          </>
        )}
      </div>
    </MobileCard>
  )
}

  useEffect(() => {
    fetchGuilds()
    fetchMyGuilds()
  }, [user])

  const fetchGuilds = async () => {
    try {
      setLoading(true)
      
      // 获取所有公会信息
      const { data: guildData, error: guildError } = await supabase
        .from('guilds')
        .select(`
          *,
          profiles!guilds_created_by_fkey (full_name)
        `)
        .order('member_count', { ascending: false })

      if (guildError) throw guildError

      // 获取用户已加入的公会ID列表
      const { data: memberData, error: memberError } = await supabase
        .from('guild_members')
        .select('guild_id')
        .eq('user_id', user?.id)

      if (memberError) throw memberError

      const joinedGuildIds = new Set(memberData?.map(m => m.guild_id) || [])

      // 标记用户是否已加入每个公会
      const enrichedGuilds = guildData?.map((guild: any) => ({
        ...guild,
        creator_name: guild.profiles?.full_name || '未知',
        is_member: joinedGuildIds.has(guild.id)
      })) || []

      setGuilds(enrichedGuilds)
    } catch (error) {
      console.error('获取公会列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyGuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          role,
          joined_at,
          guilds (
            id,
            name,
            description,
            category,
            member_count,
            max_members,
            guild_level,
            created_at,
            profiles!guilds_created_by_fkey (full_name)
          )
        `)
        .eq('user_id', user?.id)
        .order('joined_at', { ascending: false })

      if (error) throw error

      const formattedGuilds = data?.map((item: any) => ({
        ...item.guilds,
        creator_name: item.guilds.profiles?.full_name || '未知',
        role: item.role,
        is_member: true
      })) || []

      setMyGuilds(formattedGuilds)
    } catch (error) {
      console.error('获取我的公会失败:', error)
    }
  }

  const handleJoinGuild = async (guildId: string) => {
    try {
      const { error } = await supabase
        .from('guild_members')
        .insert({
          user_id: user?.id,
          guild_id: guildId,
          role: 'member'
        })

      if (error) throw error

      // 更新公会成员数量
      await supabase.rpc('increment_guild_members', { guild_id: guildId })

      await fetchGuilds()
      await fetchMyGuilds()
    } catch (error) {
      console.error('加入公会失败:', error)
      alert('加入公会失败，请重试')
    }
  }

  const handleLeaveGuild = async (guildId: string) => {
    try {
      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('user_id', user?.id)
        .eq('guild_id', guildId)

      if (error) throw error

      // 更新公会成员数量
      await supabase.rpc('decrement_guild_members', { guild_id: guildId })

      await fetchGuilds()
      await fetchMyGuilds()
    } catch (error) {
      console.error('退出公会失败:', error)
      alert('退出公会失败，请重试')
    }
  }

  const handleCreateGuild = async () => {
    try {
      if (!newGuild.name.trim() || !newGuild.category) {
        alert('请填写完整的公会信息')
        return
      }

      const { data, error } = await supabase
        .from('guilds')
        .insert({
          name: newGuild.name.trim(),
          description: newGuild.description.trim(),
          category: newGuild.category,
          max_members: newGuild.max_members,
          created_by: user?.id,
          member_count: 1,
          guild_level: 1
        })
        .select()
        .single()

      if (error) throw error

      // 创建者自动成为公会领袖
      await supabase
        .from('guild_members')
        .insert({
          user_id: user?.id,
          guild_id: data.id,
          role: 'leader'
        })

      setShowCreateModal(false)
      setNewGuild({ name: '', description: '', category: '', max_members: 50 })
      await fetchGuilds()
      await fetchMyGuilds()
    } catch (error) {
      console.error('创建公会失败:', error)
      alert('创建公会失败，请重试')
    }
  }

  const filteredGuilds = guilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || guild.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getGuildLevelColor = (level: number) => {
    if (level >= 10) return 'bg-purple-500'
    if (level >= 5) return 'bg-blue-500'
    if (level >= 2) return 'bg-green-500'
    return 'bg-gray-500'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <Users className="w-4 h-4 text-gray-500" />
    }
  }

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
              <Users className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
              技能公会
            </h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">加入志同道合的技能社群，一起成长进步</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            创建公会
          </button>
        </div>

        {/* 搜索和筛选 */}
        {activeTab === 'discover' && (
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索公会名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </MobileCard>

      {/* 标签页 */}
      <MobileTabs 
        tabs={[
          {
            id: 'discover',
            label: `发现公会`,
            content: (
              <>
                {/* 公会列表 */}
                <MobileGrid cols={1} gap={4}>
                  {filteredGuilds.map((guild) => (
                    <GuildCard key={guild.id} guild={guild} activeTab={activeTab} isMobile={isMobile} />
                  ))}
                </MobileGrid>
              </>
            )
          },
          {
            id: 'my-guilds',
            label: `我的公会 (${myGuilds.length})`,
            content: (
              <>
                {/* 我的公会列表 */}
                <MobileGrid cols={1} gap={4}>
                  {myGuilds.map((guild) => (
                    <GuildCard key={guild.id} guild={guild} activeTab={activeTab} isMobile={isMobile} />
                  ))}
                </MobileGrid>
              </>
            )
          }
        ]}
        defaultTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'discover' | 'my-guilds')}
      />

      {/* 空状态 */}
      {((activeTab === 'discover' && filteredGuilds.length === 0) || 
        (activeTab === 'my-guilds' && myGuilds.length === 0)) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'discover' ? '没有找到相关公会' : '还没有加入任何公会'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'discover' 
              ? '尝试搜索其他关键词或创建新的公会' 
              : '快去发现页面找到志同道合的技能社群吧！'
            }
          </p>
        </div>
      )}

      {/* 创建公会弹窗 */}
      <MobileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建新公会"
        size={isMobile ? 'full' : 'md'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公会名称</label>
            <input
              type="text"
              value={newGuild.name}
              onChange={(e) => setNewGuild(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              placeholder="为你的公会起个响亮的名字"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">技能分类</label>
            <select
              value={newGuild.category}
              onChange={(e) => setNewGuild(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="">选择技能分类</option>
              {categories.slice(1).map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公会描述</label>
            <textarea
              value={newGuild.description}
              onChange={(e) => setNewGuild(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="介绍一下这个公会的目标和特色..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">最大成员数</label>
            <input
              type="number"
              value={newGuild.max_members}
              onChange={(e) => setNewGuild(prev => ({ ...prev, max_members: parseInt(e.target.value) || 50 }))}
              min={10}
              max={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleCreateGuild}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
          >
            创建公会
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            取消
          </button>
        </div>
      </MobileModal>

      {/* 公会聊天弹窗 */}
      {showChatModal && selectedGuild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full h-[80vh] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedGuild.name}</h3>
                  <p className="text-sm text-gray-500">{selectedGuild.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <GuildChat guildId={selectedGuild.id} guildInfo={selectedGuild} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Guilds