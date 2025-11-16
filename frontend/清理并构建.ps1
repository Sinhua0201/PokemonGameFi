# 清理缓存并重新构建

Write-Host "🧹 清理 Next.js 缓存..." -ForegroundColor Cyan

# 删除 .next 目录
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ 已删除 .next 目录" -ForegroundColor Green
}

# 删除 TypeScript 缓存
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item -Force tsconfig.tsbuildinfo
    Write-Host "✅ 已删除 TypeScript 缓存" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 开始构建..." -ForegroundColor Cyan
Write-Host ""

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 构建成功！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 构建失败" -ForegroundColor Red
}
