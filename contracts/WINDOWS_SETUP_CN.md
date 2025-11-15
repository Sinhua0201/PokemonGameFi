# Windows 环境配置指南

## 📋 前置要求

你已经安装了 Sui CLI 1.59.1，现在需要配置环境。

## 🔧 步骤 1: 添加 Sui 到 PATH

### 方法 1: 查找 Sui 安装位置

```powershell
# 查找 sui.exe 的位置
where.exe sui
```

如果找不到，尝试这些常见位置：
- `C:\Users\<你的用户名>\.cargo\bin\sui.exe`
- `C:\Program Files\Sui\sui.exe`
- 下载目录

### 方法 2: 添加到 PATH

1. 找到 `sui.exe` 所在的文件夹路径
2. 按 `Win + X`，选择"系统"
3. 点击"高级系统设置"
4. 点击"环境变量"
5. 在"用户变量"中找到 `Path`
6. 点击"编辑"
7. 点击"新建"
8. 粘贴 sui.exe 所在的文件夹路径
9. 点击"确定"保存所有窗口

### 方法 3: 临时添加（本次会话有效）

```powershell
# 替换为你的 sui.exe 所在路径
$env:Path += ";C:\Users\<你的用户名>\.cargo\bin"
```

### 验证安装

```powershell
# 重新打开 PowerShell，然后运行
sui --version
```

应该显示：`sui 1.59.1-be94dd334013-dirty`

## 🔧 步骤 2: 配置 Sui 客户端

### 初始化 Sui 配置

```powershell
# 初始化 Sui 客户端
sui client

# 如果是第一次运行，会自动创建配置
```

### 切换到测试网

```powershell
# 查看当前网络
sui client active-env

# 切换到测试网
sui client switch --env testnet

# 或者添加自定义 RPC
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
```

### 创建或导入钱包

```powershell
# 查看当前地址
sui client active-address

# 创建新地址
sui client new-address ed25519

# 查看所有地址
sui client addresses
```

### 获取测试币

```powershell
# 从水龙头获取测试 SUI
sui client faucet

# 检查余额
sui client gas
```

## 🔧 步骤 3: 编译智能合约

```powershell
# 进入合约目录
cd contracts/pokemon_nft

# 编译合约
sui move build

# 如果成功，会显示 "Build Successful"
```

## 🔧 步骤 4: 运行测试

```powershell
# 运行所有测试
sui move test

# 运行特定测试
sui move test --filter pokemon_tests
sui move test --filter egg_tests
sui move test --filter marketplace_tests
```

## 🚀 步骤 5: 部署合约

### 使用自动部署脚本

```powershell
# 返回 contracts 目录
cd ..

# 运行部署脚本
.\deploy.bat
```

### 手动部署

```powershell
cd pokemon_nft

# 部署到测试网
sui client publish --gas-budget 100000000

# 记录输出中的 Package ID
# 例如: 0x1234567890abcdef...
```

## 📝 步骤 6: 配置前端

部署成功后，需要更新前端配置：

```powershell
# 编辑 frontend/.env.local
# 添加或更新以下内容：

NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x你的Package_ID
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
```

## 🔍 常见问题

### 问题 1: "sui: command not found"

**解决方案**：
- 确认 sui.exe 已安装
- 检查 PATH 环境变量
- 重新打开 PowerShell

### 问题 2: "insufficient gas"

**解决方案**：
```powershell
# 获取更多测试币
sui client faucet

# 等待几秒后检查余额
sui client gas
```

### 问题 3: 编译错误

**解决方案**：
```powershell
# 清理构建缓存
Remove-Item -Recurse -Force build/

# 重新编译
sui move build
```

### 问题 4: 网络连接问题

**解决方案**：
```powershell
# 尝试不同的 RPC 端点
sui client new-env --alias testnet2 --rpc https://rpc.testnet.sui.io:443
sui client switch --env testnet2
```

## 📚 下一步

配置完成后，你可以：

1. **测试合约**：运行 `sui move test`
2. **部署合约**：运行 `.\deploy.bat`
3. **启动后端**：`cd backend && python -m uvicorn main:app --reload`
4. **启动前端**：`cd frontend && npm run dev`
5. **开始游戏**：访问 `http://localhost:3000`

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Sui 版本：`sui --version`
2. 检查网络连接：`sui client active-env`
3. 检查余额：`sui client gas`
4. 查看日志：部署时的完整输出

---

**提示**：首次部署可能需要几分钟，请耐心等待。
