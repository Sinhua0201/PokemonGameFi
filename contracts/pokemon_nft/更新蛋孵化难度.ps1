# 更新蛋孵化难度 - 改为10场战斗
# 修改: STEPS_PER_BATTLE_WIN = 1 (每场+1 step)
# 需要: 10场战斗才能孵化

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "更新蛋孵化系统 - 10场战斗孵化" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "Move.toml")) {
    Write-Host "错误: 请在 contracts/pokemon_nft 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host "1. 清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force build
    Write-Host "   ✓ 已清理 build 目录" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. 构建合约..." -ForegroundColor Yellow
sui move build 2>&1 | Tee-Object -Variable buildOutput

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 构建失败" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}
Write-Host "   ✓ 构建成功" -ForegroundColor Green

Write-Host ""
Write-Host "3. 部署到区块链..." -ForegroundColor Yellow
$deployOutput = sui client publish --gas-budget 100000000 2>&1 | Tee-Object -Variable output

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 部署失败" -ForegroundColor Red
    Write-Host $deployOutput
    exit 1
}

Write-Host "   ✓ 部署成功" -ForegroundColor Green

# 提取 Package ID
$packageId = $deployOutput | Select-String -Pattern "│ Published Objects:.*?│.*?│\s+(\w+)\s+│" | ForEach-Object { $_.Matches.Groups[1].Value }

if (-not $packageId) {
    # 尝试另一种模式
    $packageId = $deployOutput | Select-String -Pattern "PackageID:\s+(\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }
}

if ($packageId) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "新的 Package ID: $packageId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "请更新 frontend/.env.local 文件:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=$packageId" -ForegroundColor White
    Write-Host ""
    Write-Host "更新内容:" -ForegroundColor Cyan
    Write-Host "  • 每场战斗 +1 step (之前是 +10)" -ForegroundColor White
    Write-Host "  • 需要 10 场战斗才能孵化 (之前是 1 场)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "警告: 无法自动提取 Package ID" -ForegroundColor Yellow
    Write-Host "请从上面的输出中手动查找并更新 .env.local" -ForegroundColor Yellow
}
