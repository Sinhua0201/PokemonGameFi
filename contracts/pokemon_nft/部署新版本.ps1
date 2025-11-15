# 部署更新后的智能合约（孵化步数 10）

Write-Host "🚀 部署更新后的智能合约..." -ForegroundColor Cyan
Write-Host ""
Write-Host "更新内容:" -ForegroundColor Yellow
Write-Host "  - 孵化步数: 1000 → 10" -ForegroundColor Green
Write-Host "  - 只需赢 1 场战斗即可孵化蛋！" -ForegroundColor Green
Write-Host ""

# 确认
$confirm = Read-Host "是否继续部署? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ 已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 构建合约..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建成功" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 部署到区块链..." -ForegroundColor Yellow
Write-Host "⚠️  请在钱包中确认交易" -ForegroundColor Yellow
Write-Host ""

sui client publish --gas-budget 100000000

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 部署失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "  1. Gas 不足" -ForegroundColor White
    Write-Host "  2. 网络问题" -ForegroundColor White
    Write-Host "  3. 钱包未连接" -ForegroundColor White
    Write-Host ""
    Write-Host "解决方法:" -ForegroundColor Yellow
    Write-Host "  1. 检查钱包余额: sui client gas" -ForegroundColor White
    Write-Host "  2. 检查网络连接: sui client active-env" -ForegroundColor White
    Write-Host "  3. 重试部署" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ 部署成功！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步:" -ForegroundColor Cyan
Write-Host "  1. 从上面的输出中找到 'Published Objects' 部分" -ForegroundColor White
Write-Host "  2. 复制 Package ID (0x开头的长字符串)" -ForegroundColor White
Write-Host "  3. 运行更新脚本:" -ForegroundColor White
Write-Host "     .\更新环境变量.ps1 <新的PackageID>" -ForegroundColor Yellow
Write-Host ""
