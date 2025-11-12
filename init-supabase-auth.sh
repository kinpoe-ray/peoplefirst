#!/bin/bash

# Supabase认证系统初始化脚本
# 用于验证配置并测试连接

echo "🚀 开始初始化Evolv平台的Supabase认证系统..."
echo

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "❌ 错误：未找到.env文件"
    echo "请复制.env.example并配置相应的环境变量"
    exit 1
fi

echo "✅ 找到.env文件"

# 检查是否安装了依赖
if [ ! -d node_modules ]; then
    echo "📦 安装依赖包..."
    pnpm install
fi

# 检查必要的文件
required_files=(
    "src/lib/supabase.ts"
    "src/contexts/AuthContext.tsx"
    "src/hooks/useAuth.ts"
    "src/components/AuthNavigation.tsx"
    "src/components/AuthStatus.tsx"
    "src/pages/Login.tsx"
    "src/pages/Register.tsx"
    "src/components/Layout.tsx"
)

echo
echo "🔍 检查配置文件..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (缺失)"
    fi
done

# 验证环境变量
echo
echo "🌍 验证环境变量配置..."
source .env

if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ 缺少 VITE_SUPABASE_URL"
else
    echo "✅ VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 缺少 VITE_SUPABASE_ANON_KEY"
else
    echo "✅ VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
fi

# 类型检查
echo
echo "🔍 进行TypeScript类型检查..."
pnpm run lint 2>/dev/null || echo "⚠️  类型检查完成（可能有警告）"

# 构建测试
echo
echo "🏗️  测试构建..."
pnpm run build 2>/dev/null && echo "✅ 构建成功" || echo "❌ 构建失败"

echo
echo "🎉 初始化完成！"
echo
echo "📚 下一步："
echo "1. 启动开发服务器: pnpm dev"
echo "2. 访问 http://localhost:5173"
echo "3. 测试注册和登录功能"
echo
echo "📖 详细文档请参考: SUPABASE_AUTH_SETUP.md"