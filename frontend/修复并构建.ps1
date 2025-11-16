# 修复依赖并构建 Frontend

Write-Host "🔧 修复 Frontend 依赖和构建问题..." -ForegroundColor Cyan
Write-Host ""

# 删除旧的依赖
Write-Host "1. 清理旧依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "   ✅ 删除 node_modules" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "   ✅ 删除 package-lock.json" -ForegroundColor Green
}
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ 删除 .next" -ForegroundColor Green
}

Write-Host ""

# 安装依赖
Write-Host "2. 安装依赖..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "   ❌ 依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 构建
Write-Host "3. 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 构建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Cyan
    Write-Host "1. 推送代码到 Git" -ForegroundColor White
    Write-Host "2. 在 Vercel 部署" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ 构建失败" -ForegroundColor Red
    Write-Host "请查看上面的错误信息" -ForegroundColor Yellow
    exit 1
}
