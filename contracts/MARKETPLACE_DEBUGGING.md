# Marketplace 购买问题调试指南

## 问题描述
在尝试购买 marketplace 中的 NFT 时遇到错误。

## 可能的原因

### 1. Listing 不存在
- NFT 已经被其他人购买
- Listing 已被卖家取消
- NFT ID 不正确

### 2. 价格不匹配
- 前端显示的价格与链上实际价格不同
- 价格计算错误（小数位数问题）

### 3. 余额不足
- OCT 余额不足以支付
- 没有考虑 gas 费用

### 4. 合约状态问题
- Marketplace 对象状态异常
- Dynamic field 访问问题

## 调试步骤

### 步骤 1: 检查 Marketplace 状态

```bash
# 查看 marketplace 对象
sui client object 0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd

# 查看 dynamic fields (active listings)
sui client dynamic-field 0x175c044fe0e0fc401f45e5741e31f35445102c4171