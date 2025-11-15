# 检查当前部署的合约状态

Write-Host "🔍 检查智能合约状态..." -ForegroundColor Cyan
Write-Host ""

# 读取当前的 Package ID
$envFile = "..\..\frontend\.env.local"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match 'NEXT_PUBLIC_PACKAGE_ID=(.+)') {
        $packageId = $matches[1].Trim()
        Write-Host "📦 当前 Package ID:" -ForegroundColor Yellow
        Write-Host "   $packageId" -ForegroundColor White
        Write-Host ""
    }
}

# 检查钱包
Write-Host "👛 钱包信息:" -ForegroundColor Yellow
sui client active-address
Write-Host ""

# 检查 Gas
Write-Host "⛽ Gas 余额:" -ForegroundColor Yellow
sui client gas --json | ConvertFrom-Json | ForEach-Object {
    $balance = $_.balance
    $balanceSui = [math]::Round($balance / 1000000000, 2)
    Write-Host "   余额: $balanceSui SUI" -ForegroundColor White
}
Write-Host ""

# 检查网络
Write-Host "🌐 当前网络:" -ForegroundColor Yellow
sui client active-env
Write-Host ""

Write-Host "📋 部署选项:" -ForegroundColor Cyan
Write-Host ""
Write-Host "选项 1: 部署新版本合约（推荐）" -ForegroundColor Green
Write-Host "  - 孵化步数: 10（只需 1 场战斗）" -ForegroundColor White
Write-Host "  - 命令: .\部署新版本.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "选项 2: 继续使用当前合约" -ForegroundColor Yellow
Write-Host "  - 孵化步数: 1000（需要 100 场战斗）" -ForegroundColor White
Write-Host "  - 不需要做任何事" -ForegroundColor White
Write-Host ""
