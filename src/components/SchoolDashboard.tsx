import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Award,
  Building,
  Calendar,
  Target,
  BookOpen,
  Activity,
  DollarSign,
  Star,
  Globe,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Filter,
  ChevronDown,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  X
} from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line, Pie } from 'recharts'

interface SchoolStats {
  id: string
  school_name: string
  statistic_type: string
  period_type: string
  period_start: string
  period_end: string
  data: any
  metadata: any
  created_at: string
}

interface DashboardStats {
  totalStudents: number
  employmentRate: number
  averageSalary: number
  skillDistribution: { [key: string]: number }
  monthlyTrends: { month: string; students: number; employment: number }[]
}

const SchoolDashboard: React.FC = () => {
  const { user } = useAuth()
  
  // 状态管理
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [selectedSchool, setSelectedSchool] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 学校选项
  const schools = [
    { value: 'all', label: '全部学校' },
    { value: '清华大学', label: '清华大学' },
    { value: '北京大学', label: '北京大学' },
    { value: '北京邮电大学', label: '北京邮电大学' },
    { value: '上海交通大学', label: '上海交通大学' },
    { value: '复旦大学', label: '复旦大学' }
  ]

  const periods = [
    { value: 'monthly', label: '月度数据' },
    { value: 'quarterly', label: '季度数据' },
    { value: 'yearly', label: '年度数据' }
  ]

  // 初始化数据加载
  useEffect(() => {
    loadDashboardData()
  }, [selectedSchool, selectedPeriod])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await loadSchoolStatistics()
      await calculateDashboardStats()
    } catch (error) {
      console.error('加载仪表板数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载学校统计数据
  const loadSchoolStatistics = async () => {
    try {
      let query = supabase
        .from('school_statistics')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedSchool !== 'all') {
        query = query.eq('school_name', selectedSchool)
      }

      if (selectedPeriod !== 'all') {
        query = query.eq('period_type', selectedPeriod)
      }

      const { data, error } = await query

      if (error) throw error
      setSchoolStats(data || [])
    } catch (error) {
      console.error('加载学校统计数据失败:', error)
    }
  }

  // 计算仪表板统计
  const calculateDashboardStats = async () => {
    try {
      // 获取最新数据
      const studentData = schoolStats.filter(s => s.statistic_type === 'student_count')
      const employmentData = schoolStats.filter(s => s.statistic_type === 'graduate_employment')
      const skillData = schoolStats.filter(s => s.statistic_type === 'skill_distribution')

      // 计算学生总数
      const totalStudents = studentData.reduce((sum, stat) => 
        sum + (stat.data?.total_students || 0), 0)

      // 计算就业率
      const employmentRates = employmentData.map(stat => stat.data?.employment_rate || 0)
      const employmentRate = employmentRates.length > 0 
        ? employmentRates.reduce((sum, rate) => sum + rate, 0) / employmentRates.length
        : 0

      // 计算平均薪资
      const salaries = employmentData.map(stat => stat.data?.average_salary || 0)
      const averageSalary = salaries.length > 0
        ? salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length
        : 0

      // 技能分布
      const skillDistribution: { [key: string]: number } = {}
      skillData.forEach(stat => {
        if (stat.data) {
          Object.entries(stat.data).forEach(([skill, percentage]) => {
            skillDistribution[skill] = (skillDistribution[skill] || 0) + Number(percentage)
          })
        }
      })

      // 计算每个技能的平均百分比
      Object.keys(skillDistribution).forEach(skill => {
        skillDistribution[skill] = skillDistribution[skill] / skillData.length || 0
      })

      // 月度趋势数据
      const monthlyTrends = generateMonthlyTrends(studentData, employmentData)

      setDashboardStats({
        totalStudents,
        employmentRate: Math.round(employmentRate * 10) / 10,
        averageSalary: Math.round(averageSalary),
        skillDistribution,
        monthlyTrends
      })
    } catch (error) {
      console.error('计算统计数据失败:', error)
    }
  }

  // 生成月度趋势数据
  const generateMonthlyTrends = (studentData: SchoolStats[], employmentData: SchoolStats[]) => {
    const months = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11']
    
    return months.map(month => {
      const students = studentData
        .filter(s => s.period_start.startsWith(month))
        .reduce((sum, stat) => sum + (stat.data?.total_students || 0), 0)
      
      const employment = employmentData
        .filter(s => s.period_start.startsWith(month))
        .reduce((sum, stat) => sum + (stat.data?.employment_rate || 0), 0)
      
      return {
        month: month.split('-')[1] + '月',
        students: Math.round(students / Math.max(studentData.length, 1)),
        employment: Math.round(employment * 10) / 10
      }
    })
  }

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  // 导出数据
  const handleExport = () => {
    const dataStr = JSON.stringify(schoolStats, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `school-statistics-${selectedSchool}-${selectedPeriod}.json`
    link.click()
  }

  // 获取统计类型显示名称
  const getStatisticTypeName = (type: string) => {
    switch (type) {
      case 'student_count':
        return '学生统计'
      case 'graduate_employment':
        return '就业统计'
      case 'skill_distribution':
        return '技能分布'
      case 'course_performance':
        return '课程表现'
      case 'alumni_network':
        return '校友网络'
      default:
        return type
    }
  }

  // 获取趋势图标
  const getTrendIcon = (value: number, isPositive: boolean = true) => {
    if (value === 0) return <Activity className="w-4 h-4 text-gray-400" />
    return isPositive 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />
  }

  // 图表颜色配置
  const CHART_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  // 处理技能分布数据
  const skillData = dashboardStats ? Object.entries(dashboardStats.skillDistribution).map(([skill, value]) => ({
    name: skill === 'programming' ? '编程开发' : 
          skill === 'data_science' ? '数据科学' : 
          skill === 'design' ? '设计创作' : 
          skill === 'project_management' ? '项目管理' : 
          skill === 'business_analysis' ? '商业分析' : skill,
    value: Math.round(value * 10) / 10,
    fill: CHART_COLORS[Object.keys(dashboardStats.skillDistribution).indexOf(skill) % CHART_COLORS.length]
  })) : []

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
              <BarChart className="w-8 h-8 mr-3 text-blue-600" />
              学校管理后台
            </h1>
            <p className="text-gray-600 mt-2">学校运营数据分析与管理决策支持平台</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </button>
          </div>
        </div>

        {/* 筛选控件 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {schools.map(school => (
                <option key={school.value} value={school.value}>
                  {school.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">在校学生总数</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalStudents.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(5.2)}
                  <span className="text-sm text-green-600 ml-1">+5.2% 同比</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">毕业生就业率</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.employmentRate}%</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(2.1)}
                  <span className="text-sm text-green-600 ml-1">+2.1% 环比</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均薪资</p>
                <p className="text-3xl font-bold text-gray-900">¥{(dashboardStats.averageSalary / 1000).toFixed(0)}K</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(8.5)}
                  <span className="text-sm text-green-600 ml-1">+8.5% 同比</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃校友</p>
                <p className="text-3xl font-bold text-gray-900">8,900</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(3.2)}
                  <span className="text-sm text-green-600 ml-1">+3.2% 同比</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图表分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 学生与就业趋势 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            学生与就业趋势
          </h2>
          {dashboardStats && dashboardStats.monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={dashboardStats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3B82F6" />
                <Line type="monotone" dataKey="employment" stroke="#10B981" strokeWidth={3} />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>暂无趋势数据</p>
              </div>
            </div>
          )}
        </div>

        {/* 技能分布饼图 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            技能分布情况
          </h2>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={skillData}
                  cx="50%"
                  cy="50%"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>暂无技能分布数据</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 详细统计数据表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart className="w-5 h-5 mr-2" />
            详细统计数据
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学校</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统计类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统计周期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据范围</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据质量</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schoolStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{stat.school_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getStatisticTypeName(stat.statistic_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.period_type === 'monthly' ? '月度' : 
                     stat.period_type === 'quarterly' ? '季度' : '年度'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(stat.period_start).toLocaleDateString()} - {new Date(stat.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {stat.metadata?.accuracy >= 0.95 ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : stat.metadata?.accuracy >= 0.8 ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-900">
                        {((stat.metadata?.accuracy || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(stat.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(stat, null, 2)
                        const blob = new Blob([dataStr], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `${stat.school_name}-${stat.statistic_type}-${stat.period_start}.json`
                        link.click()
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {schoolStats.length === 0 && (
          <div className="text-center py-12">
            <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无统计数据</h3>
            <p className="text-gray-600">请调整筛选条件或联系系统管理员添加数据</p>
          </div>
        )}
      </div>

      {/* 关键指标监控 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          关键指标监控
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">学生流失率</span>
              <Zap className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">0.8%</div>
            <div className="text-sm text-green-600 mt-1">↓ 0.2% vs 上月</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">课程满意度</span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">4.6/5.0</div>
            <div className="text-sm text-green-600 mt-1">↑ 0.1 vs 上月</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">毕业率</span>
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">96.2%</div>
            <div className="text-sm text-green-600 mt-1">↑ 1.1% vs 去年</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolDashboard