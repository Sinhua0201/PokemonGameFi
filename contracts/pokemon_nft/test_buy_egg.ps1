# 测试购买 Egg
$PACKAGE_ID = "0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa"
$MARKETPLACE_ID = "0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd"
$NFT_ID = "0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c"
$PRICE = "10000000"  # 0.01 OCT in MIST

Write-Host "=== 测试购买 Egg ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "NFT ID: $NFT_ID" -ForegroundColor Yellow
Write-Host "Price: 0.01 OCT" -ForegroundColor Yellow
Write-Host ""

# 获取你的 OCT coins
Write-Host "1. 获取你的 OCT coins..." -ForegroundColor Green
$coins = sui client gas --json | ConvertFrom-Json

if ($coins.Count -eq 0) {
    Write-Host "❌ 没有找到 OCT coins" -ForegroundColor Red
    exit 1
}

$gasObjectId = $coins[0].gasCoinId
Write-Host "使用 Gas Coin: $gasObjectId" -ForegroundColor Cyan
Write-Host ""

# 构建购买命令
Write-Host "2. 构建购买交易..." -ForegroundColor Green
Write-Host ""
Write-Host "命令:" -ForegroundColor Yellow
Write-Host "sui client call \"
Write-Host "  --package $PACKAGE_ID \"
Write-Host "  --module marketplace \"
Write-Host "  --function buy_egg \"
Write-Host "  --type-args '0x2::oct::OCT' \"
Write-Host "  --args $MARKETPLACE_ID $NFT_ID $gasObjectId \"
Write-Host "  --gas-budget 10000000"
Write-Host ""

$confirm = Read-Host "是否执行购买? (y/n)"

if ($confirm -eq "y") {
    Write-Host ""
    Write-Host "3. 执行购买..." -ForegroundColor Green
    
    sui client call `
        --package $PACKAGE_ID `
        --module marketplace `
        --function buy_egg `
        --type-args "0x2::oct::OCT" `
        --args $MARKETPLACE_ID $NFT_ID $gasObjectId `
        --gas-budget 10000000
        
    Write-Host ""
    Write-Host "✅ 购买完成！" -ForegroundColor Green
} else {
    Write-Host "❌ 取消购买" -ForegroundColor Red
}
