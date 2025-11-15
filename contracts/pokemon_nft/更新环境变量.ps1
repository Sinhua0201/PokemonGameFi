# 更新 .env.local 中的 Package ID

param(
    [Parameter(Mandatory=$true)]
    [string]$NewPackageId
)

Write-Host "🔧 更新环境变量..." -ForegroundColor Cyan
Write-Host ""

# 验证 Package ID 格式
if ($NewPackageId -notmatch '^0x[a-fA-F0-9]{64}$') {
    Write-Host "❌ 错误: Package ID 格式不正确" -ForegroundColor Red
    Write-Host "   应该是 0x 开头的 64 位十六进制字符串" -ForegroundColor Yellow
    Write-Host "   例如: 0x17809f47bea76e872a58c825742f01b05cb1728639585bf010479caf47406a25" -ForegroundColor Yellow
    exit 1
}

$envFile = "..\..\frontend\.env.local"

if (!(Test-Path $envFile)) {
    Write-Host "❌ 错误: 找不到 .env.local 文件" -ForegroundColor Red
    Write-Host "   路径: $envFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 读取当前配置..." -ForegroundColor Yellow
$content = Get-Content $envFile -Raw

# 显示旧的 Package ID
if ($content -match 'NEXT_PUBLIC_PACKAGE_ID=(.+)') {
    $oldId = $matches[1].Trim()
    Write-Host "   旧 Package ID: $oldId" -ForegroundColor Gray
}

Write-Host "   新 Package ID: $NewPackageId" -ForegroundColor Green
Write-Host ""

# 更新 Package IDs
$content = $content -replace 'NEXT_PUBLIC_PACKAGE_ID=.+', "NEXT_PUBLIC_PACKAGE_ID=$NewPackageId"
$content = $content -replace 'NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=.+', "NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=$NewPackageId"

# 保存
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "✅ 环境变量已更新！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 更新的变量:" -ForegroundColor Cyan
Write-Host "   NEXT_PUBLIC_PACKAGE_ID=$NewPackageId" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=$NewPackageId" -ForegroundColor White
Write-Host ""
Write-Host "🔄 下一步:" -ForegroundColor Cyan
Write-Host "   1. 重启前端开发服务器" -ForegroundColor White
Write-Host "   2. 刷新浏览器页面" -ForegroundColor White
Write-Host ""
Write-Host "   cd frontend" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
