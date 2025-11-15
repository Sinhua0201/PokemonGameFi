# 修复 Sui 配置并部署合约
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🔧 修复 Sui 配置并部署合约" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$configPath = "$env:USERPROFILE\.sui\sui_config\client.yaml"
$backupPath = "$env:USERPROFILE\.sui\sui_config\client.yaml.backup"

Write-Host "📁 配置文件路径: $configPath" -ForegroundColor Cyan
Write-Host ""

# 检查配置文件
if (Test-Path $configPath) {
    Write-Host "⚠️  发现损坏的配置文件" -ForegroundColor Yellow
    
    # 备份
    if (Test-Path $configPath) {
        Write-Host "📦 备份配置文件..." -ForegroundColor Yellow
        Copy-Item $configPath $backupPath -Force -ErrorAction SilentlyContinue
    }
    
    # 删除损坏的配置
    Write-Host "🗑️  删除损坏的配置文件..." -ForegroundColor Yellow
    Remove-Item $configPath -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   重新初始化 Sui 客户端" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "请按照提示操作:" -ForegroundColor Cyan
Write-Host "1. 是否连接到 Sui Full node? 输入: y" -ForegroundColor White
Write-Host "2. 服务器 URL? 输入: https://fullnode.testnet.sui.io:443" -ForegroundColor White
Write-Host "3. 环境别名? 输入: testnet" -ForegroundColor White
Write-Host "4. 选择密钥方案? 输入: 0 (ed25519)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  重要: 请记下生成的助记词！" -ForegroundColor Red
Write-Host ""

# 初始化客户端
sui client

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   配置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 显示当前配置
Write-Host "📋 当前配置:" -ForegroundColor Cyan
Write-Host ""
Write-Host "地址:" -ForegroundColor Yellow
sui client active-address
Write-Host ""
Write-Host "网络:" -ForegroundColor Yellow
sui client active-env
Write-Host ""
Write-Host "余额:" -ForegroundColor Yellow
sui client gas
Write-Host ""

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   下一步" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 获取测试币:" -ForegroundColor Cyan
Write-Host "   访问 https://discord.com/invite/sui" -ForegroundColor White
Write-Host "   在 #testnet-faucet 频道发送:" -ForegroundColor White
Write-Host "   !faucet <你的地址>" -ForegroundColor White
Write-Host ""
Write-Host "2. 等待测试币到账后，运行:" -ForegroundColor Cyan
Write-Host "   .\立即部署.ps1" -ForegroundColor White
Write-Host ""
