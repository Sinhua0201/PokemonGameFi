# Pokemon NFT 部署到 OneChain
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🚀 部署到 OneChain Testnet" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  重要提示:" -ForegroundColor Yellow
Write-Host "1. 请先关闭所有其他 PowerShell/CMD 窗口" -ForegroundColor White
Write-Host "2. 确保没有其他程序在使用 Sui 配置文件" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 继续"

# 修复配置文件
Write-Host "🔧 修复配置文件..." -ForegroundColor Yellow
$config = @'
active_address: "0x7c24267e7c7babae39987dcad1f52334f8cf94455f08e47f1072ebd2f233f06d"
active_env: onechain-testnet
envs:
- alias: onechain-testnet
  rpc: https://rpc-testnet.onelabs.cc:443
  ws: null
keystore:
  File: C:\Users\User\.sui\sui_config\sui.keystore
'@

try {
    $config | Set-Content -Path "$env:USERPROFILE\.sui\sui_config\client.yaml" -Encoding UTF8 -Force
    Write-Host "✅ 配置文件已更新" -ForegroundColor Green
} catch {
    Write-Host "❌ 无法更新配置文件: $_" -ForegroundColor Red
    Write-Host "请手动关闭所有使用 Sui 的程序后重试" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 2
Write-Host ""

# 验证配置
Write-Host "🔍 验证配置..." -ForegroundColor Yellow
$address = sui client active-address 2>&1 | Select-String -Pattern "0x[a-f0-9]+" | ForEach-Object { $_.Matches.Value }
if ($address) {
    Write-Host "✅ 当前地址: $address" -ForegroundColor Green
} else {
    Write-Host "⚠️  无法获取地址" -ForegroundColor Yellow
}

$env = sui client active-env 2>&1 | Select-String -Pattern "onechain" | ForEach-Object { $_.Matches.Value }
if ($env) {
    Write-Host "✅ 当前网络: OneChain Testnet" -ForegroundColor Green
} else {
    Write-Host "⚠️  网络可能不正确" -ForegroundColor Yellow
}
Write-Host ""

# 检查余额
Write-Host "💰 检查余额..." -ForegroundColor Yellow
sui client gas 2>&1
Write-Host ""

# 确认部署
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "准备部署 Pokemon NFT 合约到 OneChain" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  注意: OneChain API 版本 (1.0.1) 较旧" -ForegroundColor Yellow
Write-Host "可能会遇到兼容性问题" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "确认部署？(y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ 部署已取消" -ForegroundColor Red
    exit 0
}
Write-Host ""

# 部署合约
Write-Host "🚀 开始部署..." -ForegroundColor Green
Write-Host "这可能需要一些时间，请耐心等待..." -ForegroundColor Cyan
Write-Host ""

$output = sui client publish --gas-budget 500000000 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host $output
    Write-Host ""
    
    # 提取并保存信息
    if ($output -match "PackageID:\s*(0x[a-f0-9]+)") {
        $packageId = $matches[1]
        
        $deployInfo = @"
========================================
Pokemon NFT 部署成功 - OneChain Testnet
========================================
部署时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
钱包地址: 0x7c24267e7c7babae39987dcad1f52334f8cf94455f08e47f1072ebd2f233f06d
Package ID: $packageId
网络: OneChain Testnet
RPC: https://rpc-testnet.onelabs.cc:443

========================================
更新配置
========================================

frontend/.env.local:
NEXT_PUBLIC_PACKAGE_ID=$packageId
NEXT_PUBLIC_MARKETPLACE_ID=<从输出中找到>

backend/.env:
PACKAGE_ID=$packageId
MARKETPLACE_ID=<从输出中找到>

========================================
测试合约
========================================

sui client call \
  --package $packageId \
  --module pokemon \
  --function mint_starter \
  --args 1 "Pikachu" 1 25 0x7c24267e7c7babae39987dcad1f52334f8cf94455f08e47f1072ebd2f233f06d \
  --gas-budget 10000000

========================================
"@
        
        $deployInfo | Out-File -FilePath "onechain_deployment.txt" -Encoding UTF8
        Write-Host "✅ 部署信息已保存到 onechain_deployment.txt" -ForegroundColor Green
    }
    
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ 部署失败" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $output
    Write-Host ""
    
    if ($output -match "VMVerificationOrDeserializationError") {
        Write-Host "⚠️  这是已知的 OneChain 兼容性问题" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "原因: OneChain API 版本 (1.0.1) 太旧" -ForegroundColor Yellow
        Write-Host "无法支持使用 Sui CLI 1.60.0 编译的合约" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "建议:" -ForegroundColor Cyan
        Write-Host "1. 联系 OneChain 团队请求升级 API 版本" -ForegroundColor White
        Write-Host "2. 或者先在 Sui Testnet 上测试" -ForegroundColor White
        Write-Host ""
    }
    
    $output | Out-File -FilePath "deployment_error.txt" -Encoding UTF8
    Write-Host "错误信息已保存到 deployment_error.txt" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "部署完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
