#!/bin/bash

# 宝可梦 NFT 合约一键部署脚本
# 使用方法：bash deploy.sh

echo "🚀 开始部署宝可梦 NFT 合约..."
echo ""

# 检查 Sui CLI 是否安装
if ! command -v sui &> /dev/null; then
    echo "❌ 错误：Sui CLI 未安装"
    echo "请先运行：cargo install --locked sui"
    exit 1
fi

echo "✅ Sui CLI 已安装"
echo ""

# 检查钱包
echo "📝 检查钱包..."
ADDRESS=$(sui client active-address 2>/dev/null)
if [ -z "$ADDRESS" ]; then
    echo "❌ 错误：未找到钱包"
    echo "请先运行：sui client"
    exit 1
fi

echo "✅ 钱包地址：$ADDRESS"
echo ""

# 检查余额
echo "💰 检查余额..."
BALANCE=$(sui client gas --json 2>/dev/null | grep -o '"balance":[0-9]*' | head -1 | grep -o '[0-9]*')
if [ -z "$BALANCE" ] || [ "$BALANCE" -lt 100000000 ]; then
    echo "⚠️  余额不足，正在获取测试币..."
    sui client faucet
    echo "⏳ 等待 30 秒让测试币到账..."
    sleep 30
fi

echo "✅ 余额充足"
echo ""

# 进入合约目录
cd pokemon_nft || exit 1

# 构建合约
echo "🔨 构建合约..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建成功"
echo ""

# 部署合约
echo "🚀 部署合约到测试网..."
echo "⏳ 这可能需要 10-30 秒..."
echo ""

DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# 提取 Package ID
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -o '"packageId":"0x[a-f0-9]*"' | head -1 | grep -o '0x[a-f0-9]*')

if [ -z "$PACKAGE_ID" ]; then
    echo "⚠️  无法自动提取 Package ID，请手动查找"
    echo ""
    echo "完整输出："
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ 部署成功！"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    部署信息                                 ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Package ID: $PACKAGE_ID"
echo "║ 网络: Testnet"
echo "║ 部署者: $ADDRESS"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 保存 Package ID 到文件
echo "$PACKAGE_ID" > ../PACKAGE_ID.txt
echo "📝 Package ID 已保存到 contracts/PACKAGE_ID.txt"
echo ""

# 更新配置文件
echo "🔧 更新配置文件..."

# 更新前端配置
if [ -f "../../frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_ONECHAIN_PACKAGE_ID" ../../frontend/.env.local; then
        sed -i.bak "s/NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=.*/NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=$PACKAGE_ID/" ../../frontend/.env.local
        echo "✅ 已更新 frontend/.env.local"
    else
        echo "NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=$PACKAGE_ID" >> ../../frontend/.env.local
        echo "✅ 已添加到 frontend/.env.local"
    fi
fi

# 更新后端配置
if [ -f "../../backend/.env" ]; then
    if grep -q "ONECHAIN_PACKAGE_ID" ../../backend/.env; then
        sed -i.bak "s/ONECHAIN_PACKAGE_ID=.*/ONECHAIN_PACKAGE_ID=$PACKAGE_ID/" ../../backend/.env
        echo "✅ 已更新 backend/.env"
    else
        echo "ONECHAIN_PACKAGE_ID=$PACKAGE_ID" >> ../../backend/.env
        echo "✅ 已添加到 backend/.env"
    fi
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 重启前端：cd frontend && npm run dev"
echo "2. 重启后端：cd backend && python main.py"
echo "3. 访问：http://localhost:3000"
echo "4. 连接 OneWallet 并测试铸造宝可梦"
echo ""
echo "🔍 查看合约："
echo "https://suiexplorer.com/object/$PACKAGE_ID?network=testnet"
echo ""
