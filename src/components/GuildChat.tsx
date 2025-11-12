import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Send, 
  Users, 
  Settings, 
  Hash, 
  Bell, 
  BellOff, 
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Search,
  Pin,
  Archive,
  Shield,
  Crown,
  Info,
  UserPlus,
  UserMinus,
  MessageCircle,
  Activity,
  Award,
  TrendingUp
} from 'lucide-react';
import { Guild, GuildMessage, GuildActivity } from '../types';

interface GuildChatProps {
  guildId: string;
  guildInfo?: Guild;
}

const GuildChat: React.FC<GuildChatProps> = ({ guildId, guildInfo }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [activities, setActivities] = useState<GuildActivity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'activity' | 'members'>('chat');
  const [showMemberList, setShowMemberList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (guildId) {
      fetchMessages();
      fetchActivities();
      fetchMembers();
      
      // 订阅实时消息更新
      const subscription = supabase
        .channel(`guild_messages_${guildId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_messages',
          filter: `guild_id=eq.${guildId}`
        }, (payload) => {
          const newMessage = payload.new as GuildMessage;
          // 获取消息发送者信息
          fetchMessageAuthor(newMessage);
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_activities',
          filter: `guild_id=eq.${guildId}`
        }, (payload) => {
          fetchActivities();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [guildId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guild_messages')
        .select(`
          *,
          profiles!guild_messages_user_id_fkey (full_name, avatar_url)
        `)
        .eq('guild_id', guildId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages = data?.map(msg => ({
        ...msg,
        author_name: msg.profiles?.full_name || '未知用户',
        author_avatar: msg.profiles?.avatar_url
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('guild_activities')
        .select(`
          *,
          profiles!guild_activities_user_id_fkey (full_name, avatar_url)
        `)
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedActivities = data?.map(activity => ({
        ...activity,
        user_name: activity.profiles?.full_name || '未知用户',
        user_avatar: activity.profiles?.avatar_url
      })) || [];

      setActivities(formattedActivities);
    } catch (error) {
      console.error('获取公会动态失败:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          profiles!guild_members_user_id_fkey (full_name, avatar_url),
          guilds!guild_members_guild_id_fkey (name)
        `)
        .eq('guild_id', guildId)
        .eq('status', 'active');

      if (error) throw error;

      setMembers(data || []);
    } catch (error) {
      console.error('获取成员列表失败:', error);
    }
  };

  const fetchMessageAuthor = async (message: GuildMessage) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', message.user_id)
        .single();

      if (error) throw error;

      const enrichedMessage = {
        ...message,
        author_name: data?.full_name || '未知用户',
        author_avatar: data?.avatar_url
      };

      setMessages(prev => [...prev, enrichedMessage]);
    } catch (error) {
      console.error('获取消息发送者信息失败:', error);
      // 即使获取失败，也添加消息
      const fallbackMessage = {
        ...message,
        author_name: '未知用户',
        author_avatar: undefined
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      // 发送消息
      const { data: messageData, error: messageError } = await supabase
        .from('guild_messages')
        .insert({
          guild_id: guildId,
          user_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // 添加活动记录
      await supabase
        .from('guild_activities')
        .insert({
          guild_id: guildId,
          user_id: user?.id,
          activity_type: 'message',
          content: `发送了一条消息`
        });

      setNewMessage('');
      messageInputRef.current?.focus();
      
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送消息失败，请重试');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? '刚刚' : `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'joined': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'left': return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'message': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-purple-500" />;
      case 'level_up': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {guildInfo?.name || '公会聊天'}
                </h3>
                <p className="text-sm text-gray-500">
                  {members.length} 位成员在线
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMemberList(!showMemberList)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex space-x-1 mt-4">
            {[
              { key: 'chat', label: '聊天', icon: MessageCircle },
              { key: 'activity', label: '动态', icon: Activity },
              { key: 'members', label: '成员', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">开始对话</h4>
                    <p className="text-gray-500">发送第一条消息开始聊天吧！</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="group hover:bg-gray-50 -mx-2 rounded-lg p-2 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {message.author_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {message.author_name}
                            </span>
                            {getRoleIcon('member')}
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 break-words">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 消息输入 */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Image className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息... (Enter发送, Shift+Enter换行)"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '42px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-4">
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">暂无动态</h4>
                    <p className="text-gray-500">公会动态会在这里显示</p>
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        {activity.user_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {activity.user_name}
                          </span>
                          {getActivityIcon(activity.activity_type)}
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{activity.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="p-4">
              <div className="space-y-2">
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">暂无成员</h4>
                    <p className="text-gray-500">还没有成员加入这个公会</p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm">
                        {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {member.profiles?.full_name || '未知用户'}
                          </span>
                          {getRoleIcon(member.role)}
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status === 'active' ? '在线' : '离线'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          加入时间: {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 成员列表侧边栏 */}
      {showMemberList && (
        <div className="w-64 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">在线成员 ({members.filter(m => m.status === 'active').length})</h4>
          </div>
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {members.map((member) => (
              <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                  {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.profiles?.full_name || '未知用户'}
                  </p>
                </div>
                {getRoleIcon(member.role)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuildChat;
