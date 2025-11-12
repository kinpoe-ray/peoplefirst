import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  BarChart3, 
  TrendingUp,
  BookOpen,
  Calculator,
  FileText,
  Calendar,
  Award,
  Target,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Grade, GradeSummary, GradeImportData } from '../types';

interface GradeManagementProps {
  hideHeader?: boolean;
}

const GradeManagement: React.FC<GradeManagementProps> = ({ hideHeader = false }) => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [summary, setSummary] = useState<GradeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'import' | 'analytics'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  
  // 文件上传状态
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增成绩表单状态
  const [newGrade, setNewGrade] = useState<{
    title: string;
    grade_type: 'quiz' | 'assignment' | 'project' | 'final_exam' | 'participation' | 'peer_evaluation';
    score: string;
    max_score: string;
    credits: string;
    semester: string;
    feedback: string;
  }>({
    title: '',
    grade_type: 'assignment',
    score: '',
    max_score: '100',
    credits: '3',
    semester: '',
    feedback: ''
  });

  // 成绩类型选项
  const gradeTypes = [
    { value: 'quiz', label: '测验' },
    { value: 'assignment', label: '作业' },
    { value: 'project', label: '项目' },
    { value: 'final_exam', label: '期末考试' },
    { value: 'participation', label: '课堂参与' },
    { value: 'peer_evaluation', label: '同伴评价' }
  ];

  // 学期选项
  const semesters = [
    '2024-2025学年第一学期',
    '2024-2025学年第二学期',
    '2023-2024学年第一学期',
    '2023-2024学年第二学期',
    '2022-2023学年第一学期',
    '2022-2023学年第二学期'
  ];

  useEffect(() => {
    if (user) {
      fetchGrades();
      fetchGradeSummary();
    }
  }, [user]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('获取成绩列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeSummary = async () => {
    try {
      // 计算GPA和统计信息
      const { data: gradeData, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user?.id)
        .not('score', 'is', null);

      if (error) throw error;

      const totalCredits = gradeData?.reduce((sum, grade) => {
        return sum + (grade.max_score > 0 ? (grade.score / grade.max_score) : 0);
      }, 0) || 0;

      const completedGrades = gradeData?.filter(g => g.score !== null) || [];
      const cumulativeGPA = completedGrades.length > 0 
        ? completedGrades.reduce((sum, grade) => sum + (grade.score / grade.max_score), 0) / completedGrades.length
        : 0;

      // 成绩分布统计
      const gradeDistribution: { [key: string]: number } = {};
      completedGrades.forEach(grade => {
        const letterGrade = grade.letter_grade || getLetterGrade(grade.score || 0, grade.max_score);
        gradeDistribution[letterGrade] = (gradeDistribution[letterGrade] || 0) + 1;
      });

      // 趋势数据（按学期）
      const trendData: any[] = [];
      const semesterMap: { [key: string]: { grades: Grade[], credits: number } } = {};
      
      completedGrades.forEach(grade => {
        // 这里需要实际的学期字段，目前用created_at模拟
        const semester = new Date(grade.created_at).getFullYear() + '-' + 
                        (new Date(grade.created_at).getMonth() >= 8 ? '秋' : '春');
        
        if (!semesterMap[semester]) {
          semesterMap[semester] = { grades: [], credits: 1 };
        }
        semesterMap[semester].grades.push(grade);
      });

      Object.entries(semesterMap).forEach(([semester, data]) => {
        const semesterGPA = data.grades.length > 0 
          ? data.grades.reduce((sum, g) => sum + (g.score / g.max_score), 0) / data.grades.length
          : 0;
        
        trendData.push({
          semester,
          gpa: Math.round(semesterGPA * 4 * 100) / 100,
          credits: data.credits,
          courses_count: data.grades.length
        });
      });

      const gradeSummary: GradeSummary = {
        total_courses: completedGrades.length,
        total_credits: completedGrades.length * 3, // 假设每门课3学分
        earned_credits: completedGrades.filter(g => (g.score / g.max_score) >= 0.6).length * 3,
        cumulative_gpa: Math.round(cumulativeGPA * 4 * 100) / 100,
        grade_distribution: gradeDistribution,
        trend_data: trendData
      };

      setSummary(gradeSummary);
    } catch (error) {
      console.error('获取成绩统计失败:', error);
    }
  };

  const getLetterGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const handleAddGrade = async () => {
    try {
      const score = parseFloat(newGrade.score);
      const maxScore = parseFloat(newGrade.max_score);
      const credits = parseInt(newGrade.credits);
      
      if (isNaN(score) || isNaN(maxScore)) {
        alert('请输入有效的分数');
        return;
      }

      const gradeData = {
        user_id: user?.id,
        title: newGrade.title,
        grade_type: newGrade.grade_type,
        score: score,
        max_score: maxScore,
        letter_grade: getLetterGrade(score, maxScore),
        percentage: Math.round((score / maxScore) * 10000) / 100,
        is_passed: score >= maxScore * 0.6,
        feedback: newGrade.feedback,
        graded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('grades')
        .insert([gradeData]);

      if (error) throw error;

      setShowAddForm(false);
      setNewGrade({
        title: '',
        grade_type: 'assignment',
        score: '',
        max_score: '100',
        credits: '3',
        semester: '',
        feedback: ''
      });
      
      await fetchGrades();
      await fetchGradeSummary();
    } catch (error) {
      console.error('添加成绩失败:', error);
      alert('添加成绩失败，请重试');
    }
  };

  const handleEditGrade = async () => {
    if (!editingGrade) return;

    try {
      const score = parseFloat(newGrade.score);
      const maxScore = parseFloat(newGrade.max_score);

      const { error } = await supabase
        .from('grades')
        .update({
          title: newGrade.title,
          grade_type: newGrade.grade_type,
          score: score,
          max_score: maxScore,
          letter_grade: getLetterGrade(score, maxScore),
          percentage: Math.round((score / maxScore) * 10000) / 100,
          is_passed: score >= maxScore * 0.6,
          feedback: newGrade.feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingGrade.id);

      if (error) throw error;

      setEditingGrade(null);
      setShowAddForm(false);
      await fetchGrades();
      await fetchGradeSummary();
    } catch (error) {
      console.error('编辑成绩失败:', error);
      alert('编辑成绩失败，请重试');
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('确定要删除这条成绩记录吗？')) return;

    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;
      
      await fetchGrades();
      await fetchGradeSummary();
    } catch (error) {
      console.error('删除成绩失败:', error);
      alert('删除成绩失败，请重试');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // 解析文件（这里简化处理，实际应该支持Excel/CSV）
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const importedGrades: Partial<Grade>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const gradeData: Partial<Grade> = {
          user_id: user?.id,
          title: values[0] || '未知课程',
          grade_type: 'assignment',
          max_score: parseFloat(values[2]) || 100,
          score: parseFloat(values[1]) || 0,
          letter_grade: getLetterGrade(parseFloat(values[1]) || 0, parseFloat(values[2]) || 100),
          percentage: parseFloat(values[1]) / parseFloat(values[2]) * 100 || 0,
          is_passed: parseFloat(values[1]) >= parseFloat(values[2]) * 0.6,
          graded_at: new Date().toISOString()
        };
        importedGrades.push(gradeData);
      }

      // 批量插入数据
      const { error } = await supabase
        .from('grades')
        .insert(importedGrades);

      if (error) throw error;

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setActiveTab('list');
        fetchGrades();
        fetchGradeSummary();
        alert(`成功导入 ${importedGrades.length} 条成绩记录`);
      }, 500);

    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件格式不支持或上传失败，请重试');
      setUploading(false);
      setUploadProgress(0);
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setNewGrade({
      title: grade.title,
      grade_type: grade.grade_type,
      score: grade.score?.toString() || '',
      max_score: grade.max_score.toString(),
      credits: '3',
      semester: '',
      feedback: grade.feedback || ''
    });
    setShowAddForm(true);
  };

  const exportGrades = () => {
    const csvContent = [
      '课程名称,分数,满分,学分,等级,类型,日期',
      ...grades.map(grade => 
        `${grade.title},${grade.score},${grade.max_score},3,${grade.letter_grade},${grade.grade_type},${new Date(grade.created_at).toLocaleDateString()}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `成绩记录_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      {!hideHeader && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 mr-3" />
                成绩管理
              </h1>
              <p className="text-gray-600 mt-2">管理您的课程成绩，跟踪学习进度</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => exportGrades()}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                导出成绩
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加成绩
              </button>
            </div>
          </div>

          {/* GPA概览卡片 */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">累计GPA</p>
                    <p className="text-2xl font-bold text-blue-900">{summary.cumulative_gpa.toFixed(2)}</p>
                  </div>
                  <Award className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">已完成课程</p>
                    <p className="text-2xl font-bold text-green-900">{summary.total_courses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">已获得学分</p>
                    <p className="text-2xl font-bold text-purple-900">{summary.earned_credits}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">通过率</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {summary.total_courses > 0
                        ? Math.round((summary.earned_credits / summary.total_credits) * 100)
                        : 0
                      }%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
          )}

          {/* 标签页切换 */}
          <div className="flex space-x-4 mb-6">
            {[
              { key: 'list', label: '成绩列表', icon: FileText },
              { key: 'add', label: '添加成绩', icon: Plus },
              { key: 'import', label: '批量导入', icon: Upload },
              { key: 'analytics', label: '数据分析', icon: BarChart3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* 成绩列表 */}
        {activeTab === 'list' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">课程名称</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">类型</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">分数</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">等级</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">百分比</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状态</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">日期</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{grade.title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {gradeTypes.find(t => t.value === grade.grade_type)?.label || grade.grade_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono">{grade.score}/{grade.max_score}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          grade.letter_grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade.letter_grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade.letter_grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade.letter_grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.letter_grade || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {grade.percentage?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          grade.is_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {grade.is_passed ? '通过' : '未通过'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {new Date(grade.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(grade)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {grades.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无成绩记录</h3>
                <p className="text-gray-600 mb-4">开始添加您的第一个成绩记录</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  添加成绩
                </button>
              </div>
            )}
          </div>
        )}

        {/* 添加/编辑成绩表单 */}
        {(activeTab === 'add' || showAddForm) && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingGrade ? '编辑成绩' : '添加新成绩'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">课程名称</label>
                <input
                  type="text"
                  value={newGrade.title}
                  onChange={(e) => setNewGrade(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入课程名称"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">成绩类型</label>
                  <select
                    value={newGrade.grade_type}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, grade_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {gradeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">学期</label>
                  <select
                    value={newGrade.semester}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择学期</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">得分</label>
                  <input
                    type="number"
                    value={newGrade.score}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, score: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">满分</label>
                  <input
                    type="number"
                    value={newGrade.max_score}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, max_score: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">学分</label>
                  <input
                    type="number"
                    value={newGrade.credits}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, credits: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">评语（可选）</label>
                <textarea
                  value={newGrade.feedback}
                  onChange={(e) => setNewGrade(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="添加评语或备注..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingGrade ? handleEditGrade : handleAddGrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingGrade ? '更新成绩' : '添加成绩'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGrade(null);
                  setActiveTab('list');
                  setNewGrade({
                    title: '',
                    grade_type: 'assignment',
                    score: '',
                    max_score: '100',
                    credits: '3',
                    semester: '',
                    feedback: ''
                  });
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 批量导入 */}
        {activeTab === 'import' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">批量导入成绩</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">上传成绩文件</h4>
              <p className="text-gray-600 mb-4">
                支持CSV和Excel格式。文件应包含：课程名称、分数、满分等列
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {uploading ? '上传中...' : '选择文件'}
              </button>
              
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">正在处理 {uploadProgress}%</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">文件格式要求：</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• CSV格式：第一行为列标题：课程名称,分数,满分,学分</li>
                <li>• Excel格式：与CSV相同的列结构</li>
                <li>• 每行代表一条成绩记录</li>
                <li>• 支持的分数范围：0-100分</li>
              </ul>
            </div>
          </div>
        )}

        {/* 数据分析 */}
        {activeTab === 'analytics' && summary && (
          <div className="space-y-6">
            {/* 成绩趋势图表 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GPA趋势</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary.trend_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 成绩分布 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">成绩分布</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(summary.grade_distribution).map(([grade, count]) => ({
                      grade,
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">等级比例</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(summary.grade_distribution).map(([grade, count]) => ({
                          name: grade,
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(summary.grade_distribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 统计详情 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">总览统计</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>总课程数:</span>
                    <span className="font-medium">{summary.total_courses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>总学分:</span>
                    <span className="font-medium">{summary.total_credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>已获学分:</span>
                    <span className="font-medium">{summary.earned_credits}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">GPA表现</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>累计GPA:</span>
                    <span className="font-medium">{summary.cumulative_gpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最高学期GPA:</span>
                    <span className="font-medium">
                      {summary.trend_data.length > 0 
                        ? Math.max(...summary.trend_data.map(t => t.gpa)).toFixed(2)
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>最低学期GPA:</span>
                    <span className="font-medium">
                      {summary.trend_data.length > 0 
                        ? Math.min(...summary.trend_data.map(t => t.gpa)).toFixed(2)
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">成绩分析</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>A级课程:</span>
                    <span className="font-medium">{summary.grade_distribution['A'] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>B级课程:</span>
                    <span className="font-medium">{summary.grade_distribution['B'] || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>通过率:</span>
                    <span className="font-medium">
                      {summary.total_courses > 0 
                        ? Math.round((summary.earned_credits / summary.total_credits) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeManagement;
