# 测试 Marketplace 购买功能

$PACKAGE_ID = "0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa"
$MARKETPLACE_ID = "0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd"

Write-Host "=== 测试 Marketplace 购买功能 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 检查 marketplace 对象
Write-Host "1. 检查 Marketplace 对象..." -ForegroundColor Yellow
sui client object $MARKETPLACE_ID

Write-Host ""
Write-Host "2. 检查你的 OCT 余额..." -ForegroundColor Yellow
sui client gas

Write-Host ""
Write-Host "3. 检查你拥有的对象..." -ForegroundColor Yellow
sui client objects

Write-Host ""
Write-Host "=== 测试完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "如果要测试购买，请使用以下命令格式：" -ForegroundColor Cyan
Write-Host "sui client call --package $PACKAGE_ID --module marketplace --function buy_egg --type-args '0x2::oct::OCT' --args $MARKETPLACE_ID <NFT_ID> <PAYMENT_COIN> --gas-budget 10000000"
