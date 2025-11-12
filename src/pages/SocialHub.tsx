import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type Guild } from '../lib/supabase';
import { Users, Plus, MessageCircle, Heart, UserPlus } from 'lucide-react';

export default function SocialHub() {
  const { profile } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuilds, setMyGuilds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [newGuild, setNewGuild] = useState({
    name: '',
    description: '',
    skill_category: 'IT',
  });

  useEffect(() => {
    loadGuilds();
    loadMyGuilds();
  }, [profile]);

  const loadGuilds = async () => {
    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .order('member_count', { ascending: false });

    if (!error && data) {
      setGuilds(data);
    }
    setLoading(false);
  };

  const loadMyGuilds = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('guild_members')
      .select('guild_id')
      .eq('user_id', profile.id);

    if (!error && data) {
      setMyGuilds(data.map((m) => m.guild_id));
    }
  };

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const { data: guildData, error: guildError } = await supabase
      .from('guilds')
      .insert({
        ...newGuild,
        created_by: profile.id,
        member_count: 1,
      })
      .select()
      .maybeSingle();

    if (!guildError && guildData) {
      await supabase.from('guild_members').insert({
        guild_id: guildData.id,
        user_id: profile.id,
        role: 'owner',
      });

      setShowCreateGuild(false);
      setNewGuild({ name: '', description: '', skill_category: 'IT' });
      loadGuilds();
      loadMyGuilds();
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    if (!profile) return;

    await supabase.from('guild_members').insert({
      guild_id: guildId,
      user_id: profile.id,
      role: 'member',
    });

    await supabase.rpc('increment_guild_members', { guild_id: guildId });

    loadGuilds();
    loadMyGuilds();
  };

  const handleLeaveGuild = async (guildId: string) => {
    if (!profile) return;

    await supabase
      .from('guild_members')
      .delete()
      .eq('guild_id', guildId)
      .eq('user_id', profile.id);

    loadGuilds();
    loadMyGuilds();
  };

  const categories = ['IT', '产品', '运营', '设计', '营销'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">技能社交</h1>
              <p className="text-sm text-gray-600">加入技能公会，与同道者交流成长</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateGuild(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            创建公会
          </button>
        </div>
      </div>

      {showCreateGuild && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">创建新公会</h2>
          <form onSubmit={handleCreateGuild} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公会名称</label>
              <input
                type="text"
                value={newGuild.name}
                onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="给公会起个名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">技能分类</label>
              <select
                value={newGuild.skill_category}
                onChange={(e) => setNewGuild({ ...newGuild, skill_category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公会简介</label>
              <textarea
                value={newGuild.description}
                onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="介绍一下这个公会"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => setShowCreateGuild(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">全部公会</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => {
            const isMember = myGuilds.includes(guild.id);
            return (
              <div key={guild.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{guild.name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {guild.skill_category}
                    </span>
                  </div>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {guild.description || '暂无简介'}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{guild.member_count} 成员</span>
                  {isMember ? (
                    <button
                      onClick={() => handleLeaveGuild(guild.id)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      退出公会
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGuild(guild.id)}
                      className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      加入
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
