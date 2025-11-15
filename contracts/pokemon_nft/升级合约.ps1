# 升级现有合约 - 添加XP系统和调整蛋孵化难度
# 使用 sui client upgrade 而不是 publish

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "升级 PokéChain 合约" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "Move.toml")) {
    Write-Host "错误: 请在 contracts/pokemon_nft 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 读取当前的 Package ID
$envPath = "..\..\frontend\.env.local"
if (Test-Path $envPath) {
    $currentPackageId = Get-Content $envPath | Select-String "NEXT_PUBLIC_ONECHAIN_PACKAGE_ID" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }
    Write-Host "当前 Package ID: $currentPackageId" -ForegroundColor Yellow
} else {
    Write-Host "警告: 找不到 .env.local 文件" -ForegroundColor Yellow
    $currentPackageId = Read-Host "请输入当前的 Package ID"
}

if (-not $currentPackageId -or $currentPackageId -eq "") {
    Write-Host "错误: 无法获取 Package ID" -ForegroundColor Red
    exit 1
}

Write-Host ""
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
Write-Host "3. 升级合约到区块链..." -ForegroundColor Yellow
Write-Host "   Package ID: $currentPackageId" -ForegroundColor Cyan

$upgradeOutput = sui client upgrade --gas-budget 100000000 2>&1 | Tee-Object -Variable output

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 升级失败" -ForegroundColor Red
    Write-Host $upgradeOutput
    exit 1
}

Write-Host "   ✓ 升级成功" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "合约升级成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "更新内容:" -ForegroundColor Cyan
Write-Host "  1. Pokemon XP系统:" -ForegroundColor White
Write-Host "     • 添加 add_experience() 函数" -ForegroundColor Gray
Write-Host "     • 战斗胜利后XP记录到blockchain" -ForegroundColor Gray
Write-Host "     • 自动升级 (每100 XP升1级)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. 蛋孵化难度调整:" -ForegroundColor White
Write-Host "     • 每场战斗 +1 step (之前是 +10)" -ForegroundColor Gray
Write-Host "     • 需要 10 场战斗才能孵化" -ForegroundColor Gray
Write-Host ""
Write-Host "Package ID 保持不变: $currentPackageId" -ForegroundColor Yellow
Write-Host ""
