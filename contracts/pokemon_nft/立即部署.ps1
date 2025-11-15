# Pokemon NFT 智能合约部署脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 Pokemon NFT 合约部署工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 你的新钱包地址
$walletAddress = "0x7c24267e7c7babae39987dcad1f52334f8cf94455f08e47f1072ebd2f233f06d"
Write-Host "📍 钱包地址: $walletAddress" -ForegroundColor Green
Write-Host ""

# 检查当前地址
Write-Host "🔍 检查当前配置..." -ForegroundColor Yellow
$currentAddress = sui client active-address 2>&1 | Out-String
if ($currentAddress -match "0x[a-f0-9]+") {
    Write-Host "✅ 当前地址: $($matches[0])" -ForegroundColor Green
} else {
    Write-Host "⚠️  无法获取当前地址，可能需要重新配置" -ForegroundColor Yellow
}
Write-Host ""

# 检查网络
Write-Host "🌐 检查网络..." -ForegroundColor Yellow
$currentEnv = sui client active-env 2>&1 | Out-String
Write-Host "当前网络: $currentEnv" -ForegroundColor Cyan
Write-Host ""

# 检查余额
Write-Host "💰 检查余额..." -ForegroundColor Yellow
sui client gas 2>&1
Write-Host ""

# 确认部署
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "准备部署 Pokemon NFT 合约" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "合约包含:" -ForegroundColor Cyan
Write-Host "  - pokemon.move (Pokemon NFT 模块)" -ForegroundColor White
Write-Host "  - egg.move (繁殖和蛋模块)" -ForegroundColor White
Write-Host "  - marketplace.move (市场模块)" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "确认部署？(y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ 部署已取消" -ForegroundColor Red
    exit 0
}
Write-Host ""

# 部署合约
Write-Host "🚀 开始部署合约..." -ForegroundColor Green
Write-Host "这可能需要几秒钟，请稍候..." -ForegroundColor Cyan
Write-Host ""

$output = sui client publish --gas-budget 500000000 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host $output
    Write-Host ""
    
    # 提取 Package ID
    if ($output -match "PackageID:\s*(0x[a-f0-9]+)") {
        $packageId = $matches[1]
        Write-Host "📦 Package ID: $packageId" -ForegroundColor Green
        
        # 保存部署信息
        $deployInfo = @"
========================================
Pokemon NFT 合约部署成功！
========================================
部署时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
钱包地址: $walletAddress
Package ID: $packageId
网络: $currentEnv

========================================
重要对象 ID（从输出中提取）
========================================
请从上面的输出中找到以下对象的 ID：
- MarketplaceConfig (市场配置)
- UpgradeCap (升级权限)

========================================
下一步操作
========================================

1. 更新前端配置
   编辑 frontend/.env.local:
   NEXT_PUBLIC_PACKAGE_ID=$packageId
   NEXT_PUBLIC_MARKETPLACE_ID=<从输出中找到的 MarketplaceConfig ID>

2. 更新后端配置
   编辑 backend/.env:
   PACKAGE_ID=$packageId
   MARKETPLACE_ID=<从输出中找到的 MarketplaceConfig ID>

3. 测试合约
   sui client call \
     --package $packageId \
     --module pokemon \
     --function mint_starter \
     --args 1 "Pikachu" 1 25 $walletAddress \
     --gas-budget 10000000

4. 查看区块浏览器
   https://suiscan.xyz/testnet/object/$packageId

========================================
"@
        
        $deployInfo | Out-File -FilePath "deployment_info.txt" -Encoding UTF8
        Write-Host "✅ 部署信息已保存到 deployment_info.txt" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 请查看 deployment_info.txt 获取完整信息" -ForegroundColor Cyan
        
    } else {
        Write-Host "⚠️  无法自动提取 Package ID，请从上面的输出中手动查找" -ForegroundColor Yellow
        $output | Out-File -FilePath "deployment_output.txt" -Encoding UTF8
        Write-Host "完整输出已保存到 deployment_output.txt" -ForegroundColor Cyan
    }
    
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ 部署失败！" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $output
    Write-Host ""
    Write-Host "常见问题排查:" -ForegroundColor Yellow
    Write-Host "1. 检查余额是否足够: sui client gas" -ForegroundColor Cyan
    Write-Host "2. 检查网络连接: sui client active-env" -ForegroundColor Cyan
    Write-Host "3. 尝试增加 gas 预算" -ForegroundColor Cyan
    Write-Host "4. 如果是 OneChain，切换到 Sui Testnet:" -ForegroundColor Cyan
    Write-Host "   sui client switch --env testnet" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "感谢使用 Pokemon NFT 部署工具！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
