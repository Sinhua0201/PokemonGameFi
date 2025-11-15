# 更新蛋系统智能合约
# 将孵化步数从 1000 降低到 10

Write-Host "🥚 更新蛋系统智能合约..." -ForegroundColor Cyan
Write-Host ""

# 检查 sui 命令
if (!(Get-Command sui -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 未找到 sui 命令" -ForegroundColor Red
    Write-Host "请先安装 Sui CLI: https://docs.sui.io/build/install" -ForegroundColor Yellow
    exit 1
}

# 检查网络配置
$network = $env:NEXT_PUBLIC_ONECHAIN_NETWORK
if (!$network) {
    $network = "testnet"
    Write-Host "⚠️  未设置网络，使用默认: testnet" -ForegroundColor Yellow
}

Write-Host "📡 目标网络: $network" -ForegroundColor Green
Write-Host ""

# 显示更改
Write-Host "📝 智能合约更改:" -ForegroundColor Cyan
Write-Host "  - REQUIRED_INCUBATION_STEPS: 1000 → 10" -ForegroundColor Yellow
Write-Host "  - 现在只需赢 1 场战斗即可孵化蛋！" -ForegroundColor Green
Write-Host ""

# 确认
$confirm = Read-Host "是否继续部署? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 开始部署..." -ForegroundColor Cyan

# 构建
Write-Host "📦 构建合约..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建成功" -ForegroundColor Green
Write-Host ""

# 部署
Write-Host "🌐 部署到 $network..." -ForegroundColor Yellow
$result = sui client publish --gas-budget 100000000 --skip-dependency-verification

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 部署成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步:" -ForegroundColor Cyan
Write-Host "  1. 从部署输出中复制 Package ID" -ForegroundColor White
Write-Host "  2. 更新 frontend/.env.local 中的 NEXT_PUBLIC_ONECHAIN_PACKAGE_ID" -ForegroundColor White
Write-Host "  3. 重启前端应用" -ForegroundColor White
Write-Host ""
Write-Host "🎉 现在蛋只需要 10 步孵化（1 场战斗）！" -ForegroundColor Green
