# 故障排除指南

## 问题：看不到我的 Pokemon NFT

### 症状
- `/profile` 页面显示空的 Pokemon 集合
- `/breeding` 页面看不到可繁殖的 Pokemon
- `/explore` 的战斗选择看不到我的 Pokemon

### 可能原因

#### 1. 使用了旧的 Package ID

**检查方法：**
```bash
node check-env.js
```

**预期结果：**
```
NEXT_PUBLIC_PACKAGE_ID: 0xf2912bdcd0ce0d68b18e7574cab1cbecd289c450cc71071760106a443cd6dcb9
```

**如果不匹配：**
1. 确认 `.env.local` 文件已保存
2. 重启开发服务器
3. 清除浏览器缓存

#### 2. 开发服务器未重启

**解决方法：**
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

#### 3. 浏览器缓存问题

**解决方法：**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)
- 或者打开开发者工具，右键刷新按钮，选择"清空缓存并硬性重新加载"

#### 4. Pokemon 是用旧合约铸造的

**检查方法：**
访问 `/test-onechain` 页面，查看 "Pokemon NFT 查询" 部分。

**如果显示 "没有找到 Pokemon NFT"：**
- 你的 Pokemon 可能是用旧的 Package ID 铸造的
- 需要用新合约重新铸造 Pokemon

**解决方法：**
1. 访问 `/start-game` 铸造新的初始 Pokemon
2. 或访问 `/encounter` 捕获新的 Pokemon

#### 5. RPC 连接问题

**检查方法：**
访问 `/test-onechain` 页面，点击"测试 RPC 连接"。

**如果连接失败：**
- 检查网络连接
- 确认 RPC URL 正确：`https://rpc-testnet.onelabs.cc:443`
- OneChain RPC 可能暂时不可用，稍后重试

#### 6. 钱包地址不匹配

**检查方法：**
1. 查看当前连接的钱包地址
2. 确认 Pokemon 是用这个地址铸造的

**解决方法：**
- 切换到正确的钱包账户
- 或用当前账户重新铸造 Pokemon

## 调试步骤

### 步骤 1: 检查环境变量
```bash
node check-env.js
```

### 步骤 2: 访问测试页面
```
http://localhost:3000/test-onechain
```

查看：
- ✅ 钱包连接状态
- ✅ Package ID 配置
- ✅ RPC 连接测试
- ✅ Pokemon NFT 查询结果

### 步骤 3: 检查浏览器控制台
打开开发者工具 (F12)，查看：
- 🔴 红色错误信息
- ⚠️ 黄色警告信息
- 📝 网络请求状态

### 步骤 4: 重启一切
```bash
# 1. 停止开发服务器
Ctrl+C

# 2. 清除 Next.js 缓存
rm -rf .next

# 3. 重新启动
npm run dev

# 4. 硬刷新浏览器
Ctrl+Shift+R
```

## 常见错误信息

### "Package ID not configured"
**原因：** `.env.local` 中的 `NEXT_PUBLIC_PACKAGE_ID` 未设置

**解决：** 检查 `.env.local` 文件，确保包含正确的 Package ID

### "No gas coins are owned by this address"
**原因：** 钱包没有 OCT gas

**解决：** 从 OneChain 水龙头获取测试 OCT

### "Cannot find module '@/config/constants'"
**原因：** TypeScript 路径配置问题

**解决：** 重启开发服务器

### "Failed to fetch"
**原因：** RPC 连接失败

**解决：** 
1. 检查网络连接
2. 确认 RPC URL 正确
3. 稍后重试

## 验证修复

### 1. 测试页面应该显示
- ✅ 钱包已连接
- ✅ Package ID 正确
- ✅ RPC 连接成功
- ✅ 找到 X 个 Pokemon（如果你已经铸造了）

### 2. Profile 页面应该显示
- 你的 Pokemon 集合
- 每个 Pokemon 的详细信息
- Pokemon 的图片和属性

### 3. Breeding 页面应该显示
- 可选择的 Pokemon 列表
- 繁殖按钮可用

### 4. Battle 页面应该显示
- 你的 Pokemon 可以选择
- 可以开始战斗

## 仍然无法解决？

### 收集信息
1. 浏览器控制台的完整错误信息
2. `/test-onechain` 页面的截图
3. 你的钱包地址
4. 你铸造 Pokemon 的交易 digest

### 检查合约
在 OneChain 浏览器查看你的交易：
```
https://testnet.onechain.com/address/YOUR_WALLET_ADDRESS
```

确认：
- Pokemon NFT 是否成功创建
- 使用的是哪个 Package ID
- NFT 的 owner 是否正确

## 快速修复清单

- [ ] 检查 `.env.local` 中的 Package ID
- [ ] 重启开发服务器
- [ ] 硬刷新浏览器
- [ ] 访问 `/test-onechain` 验证配置
- [ ] 确认钱包连接正确
- [ ] 用新合约重新铸造 Pokemon（如果需要）
- [ ] 检查浏览器控制台错误
- [ ] 清除 `.next` 缓存

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 完整的错误信息
2. `/test-onechain` 页面截图
3. 浏览器控制台日志
4. 你的操作步骤
