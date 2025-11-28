# 直接测试购买 - 获取详细错误信息
$PACKAGE_ID = "0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa"
$MARKETPLACE_ID = "0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd"
$NFT_ID = "0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c"
$OCT_COIN = "0x10d49a4aa7ebe3f4583678024b111a7bb90795e712700adca762782ef85227a3"

Write-Host "=== 直接测试购买 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Package: $PACKAGE_ID" -ForegroundColor Yellow
Write-Host "Marketplace: $MARKETPLACE_ID" -ForegroundColor Yellow  
Write-Host "NFT ID: $NFT_ID" -ForegroundColor Yellow
Write-Host "OCT Coin: $OCT_COIN" -ForegroundColor Yellow
Write-Host ""

Write-Host "执行购买..." -ForegroundColor Green

sui client call `
    --package $PACKAGE_ID `
    --module marketplace `
    --function buy_egg `
    --type-args "0x2::oct::OCT" `
    --args $MARKETPLACE_ID $NFT_ID $OCT_COIN `
    --gas-budget 10000000 `
    --json

Write-Host ""
Write-Host "完成！" -ForegroundColor Green
