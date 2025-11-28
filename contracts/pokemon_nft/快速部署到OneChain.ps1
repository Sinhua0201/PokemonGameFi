# OneChain 快速部署脚本
# 使用 OCT 作为 gas token

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "OneChain 测试网快速部署" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查当前地址
Write-Host "1. 检查当前地址..." -ForegroundColor Yellow
sui client active-address

# 2. 检查 OCT 余额
Write-Host ""
Write-Host "2. 检查 OCT 余额..." -ForegroundColor Yellow
$objects = sui client objects --json | ConvertFrom-Json
$octCoins = $objects | Where-Object { $_.data.type -like "*::oct::OCT" }

if ($octCoins.Count -eq 0) {
    Write-Host "❌ 没有找到 OCT coins！请先获取测试 OCT。" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 找到 $($octCoins.Count) 个 OCT coins" -ForegroundColor Green
$gasObjectId = $octCoins[0].data.objectId
Write-Host "使用 Gas Object: $gasObjectId" -ForegroundColor Cyan

# 3. 编译合约
Write-Host ""
Write-Host "3. 编译合约..." -ForegroundColor Yellow
sui move build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 编译失败！" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 编译成功" -ForegroundColor Green

# 4. 部署合约
Write-Host ""
Write-Host "4. 部署到 OneChain 测试网..." -ForegroundColor Yellow
Write-Host "Gas Budget: 500000000 MIST (0.5 OCT)" -ForegroundColor Cyan

$output = sui client publish --gas-budget 500000000 --gas $gasObjectId 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    
    # 提取重要信息
    if ($output -match "PackageID: (0x[a-f0-9]+)") {
        $packageId = $matches[1]
        Write-Host "📦 Package ID: $packageId" -ForegroundColor Cyan
    }
    
    if ($output -match "Transaction Digest: ([A-Za-z0-9]+)") {
        $txDigest = $matches[1]
        Write-Host "🔗 Transaction: $txDigest" -ForegroundColor Cyan
        Write-Host "🌐 浏览器: https://testnet.onechain.com/tx/$txDigest" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "完整输出已保存，请查看控制台获取所有对象 ID" -ForegroundColor Yellow
    
} else {
    Write-Host ""
    Write-Host "❌ 部署失败！" -ForegroundColor Red
    Write-Host $output
    exit 1
}
