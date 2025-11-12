import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react'
import { MobileCard, MobileModal } from '../components/MobileOptimized'
import { useIsMobile } from '../hooks/use-mobile'

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
    system: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showProgress: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    fontSize: 'small' | 'medium' | 'large'
  }
  account: {
    email: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
}

const Settings: React.FC = () => {
  const { user, profile } = useAuth()
  const isMobile = useIsMobile()
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      system: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showProgress: true
    },
    appearance: {
      theme: 'auto',
      language: 'zh-CN',
      fontSize: 'medium'
    },
    account: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })
  
  const [activeSection, setActiveSection] = useState<'notifications' | 'privacy' | 'appearance' | 'account'>('notifications')
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const sections = [
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'privacy', label: '隐私设置', icon: Shield },
    { id: 'appearance', label: '外观设置', icon: Moon },
    { id: 'account', label: '账户设置', icon: User }
  ] as const

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // 这里应该调用保存设置的API
      // await supabase.from('user_settings').upsert({ user_id: user?.id, settings })
      
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: '设置保存成功！' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (settings.account.newPassword !== settings.account.confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不匹配' })
      return
    }

    if (settings.account.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少需要6个字符' })
      return
    }

    setLoading(true)
    try {
      // 这里应该调用密码更新API
      // await supabase.auth.updateUser({ password: settings.account.newPassword })
      
      setMessage({ type: 'success', text: '密码更新成功！' })
      setSettings(prev => ({
        ...prev,
        account: {
          ...prev.account,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }))
    } catch (error) {
      setMessage({ type: 'error', text: '密码更新失败，请检查当前密码是否正确' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* 页面头部 */}
      <MobileCard>
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between'} mb-4 md:mb-6`}>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 flex items-center`}>
            <SettingsIcon className={`${isMobile ? 'w-5 h-5 mr-2' : 'w-6 h-6 mr-3'}`} />
            系统设置
          </h1>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className={`flex items-center ${isMobile ? 'min-h-[44px] w-full justify-center px-4 py-3' : 'px-6 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm font-medium">
              {loading ? '保存中...' : '保存设置'}
            </span>
          </button>
        </div>

        {/* 成功/错误消息 */}
        {message && (
          <div className={`${isMobile ? 'p-3 mb-4' : 'p-4 mb-6'} rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}
      </MobileCard>

      {/* 设置导航 */}
      <MobileCard>
        <div className={`${isMobile ? 'flex flex-wrap gap-2 p-2' : 'grid grid-cols-4 gap-1'}`}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`${isMobile ? 'flex-1 min-h-[44px] flex flex-col items-center justify-center p-3' : 'flex items-center px-4 py-3'} rounded-lg transition-colors ${
                activeSection === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`${isMobile ? 'w-5 h-5 mb-1' : 'w-4 h-4 mr-2'}`} />
              <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{label}</span>
            </button>
          ))}
        </div>
      </MobileCard>

      {/* 设置内容 */}
      <MobileCard>
        <div className={isMobile ? 'p-4' : 'p-6'}>
          {activeSection === 'notifications' && (
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4`}>通知偏好</h2>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {[
                  { key: 'email', label: '邮件通知', desc: '接收重要更新的邮件提醒' },
                  { key: 'push', label: '推送通知', desc: '接收浏览器推送通知' },
                  { key: 'marketing', label: '营销通知', desc: '接收产品更新和活动信息' },
                  { key: 'system', label: '系统通知', desc: '接收系统维护和重要通知' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 border rounded-lg`}>
                    <div className={isMobile ? '' : 'flex-1'}>
                      <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900`}>{label}</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{desc}</p>
                    </div>
                    <label className={`relative inline-flex ${isMobile ? 'w-full' : 'items-center'} cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={Boolean(settings.notifications[key as keyof typeof settings.notifications])}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`${isMobile ? 'w-full h-6' : 'w-11 h-6'} bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4`}>隐私设置</h2>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="p-3 border rounded-lg">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900 mb-2`}>个人资料可见性</h3>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="public">公开 - 所有人可见</option>
                    <option value="friends">好友可见</option>
                    <option value="private">私密 - 仅自己可见</option>
                  </select>
                </div>

                {[
                  { key: 'showEmail', label: '显示邮箱地址', desc: '允许其他用户查看您的邮箱地址' },
                  { key: 'showProgress', label: '显示学习进度', desc: '允许显示您在平台上的学习进度' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 border rounded-lg`}>
                    <div className={isMobile ? '' : 'flex-1'}>
                      <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900`}>{label}</h3>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{desc}</p>
                    </div>
                    <label className={`relative inline-flex ${isMobile ? 'w-full' : 'items-center'} cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={Boolean(settings.privacy[key as keyof typeof settings.privacy])}
                        onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`${isMobile ? 'w-full h-6' : 'w-11 h-6'} bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4`}>外观设置</h2>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="p-3 border rounded-lg">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900 mb-2`}>主题</h3>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-2'}`}>
                    {[
                      { value: 'light', label: '浅色主题', icon: Sun },
                      { value: 'dark', label: '深色主题', icon: Moon },
                      { value: 'auto', label: '跟随系统', icon: Globe }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleSettingChange('appearance', 'theme', value)}
                        className={`flex items-center ${isMobile ? 'p-3' : 'p-2'} border rounded-lg ${
                          settings.appearance.theme === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-3 h-3 mr-2'}`} />
                        <span className={`${isMobile ? 'text-sm' : 'text-xs'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 border rounded-lg">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900 mb-2`}>语言</h3>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="zh-TW">繁體中文</option>
                  </select>
                </div>

                <div className="p-3 border rounded-lg">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900 mb-2`}>字体大小</h3>
                  <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-2'}`}>
                    {[
                      { value: 'small', label: '小' },
                      { value: 'medium', label: '中' },
                      { value: 'large', label: '大' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleSettingChange('appearance', 'fontSize', value)}
                        className={`${isMobile ? 'p-3' : 'p-2'} border rounded-lg ${
                          settings.appearance.fontSize === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`${isMobile ? 'text-sm' : 'text-xs'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
              <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4`}>账户安全</h2>
              
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                <div className="p-3 border rounded-lg">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900 mb-2`}>邮箱地址</h3>
                  <input
                    type="email"
                    value={settings.account.email}
                    onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                    className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3' : 'px-3 py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    disabled
                  />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-1`}>邮箱地址暂不支持修改</p>
                </div>

                <div className="p-3 border rounded-lg space-y-3">
                  <h3 className={`${isMobile ? 'text-sm' : 'font-medium'} text-gray-900`}>修改密码</h3>
                  
                  <div>
                    <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-1`}>当前密码</label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={settings.account.currentPassword}
                        onChange={(e) => handleSettingChange('account', 'currentPassword', e.target.value)}
                        className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3 pr-10' : 'px-3 py-2 pr-10'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="请输入当前密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-1`}>新密码</label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={settings.account.newPassword}
                        onChange={(e) => handleSettingChange('account', 'newPassword', e.target.value)}
                        className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3 pr-10' : 'px-3 py-2 pr-10'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="请输入新密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-700 mb-1`}>确认新密码</label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={settings.account.confirmPassword}
                        onChange={(e) => handleSettingChange('account', 'confirmPassword', e.target.value)}
                        className={`w-full ${isMobile ? 'min-h-[44px] px-4 py-3 pr-10' : 'px-3 py-2 pr-10'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="请再次输入新密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={loading || !settings.account.currentPassword || !settings.account.newPassword}
                    className={`w-full ${isMobile ? 'min-h-[44px]' : ''} flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">更新密码</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MobileCard>
    </div>
  )
}

export default Settings