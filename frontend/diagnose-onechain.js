#!/usr/bin/env node

/**
 * OneChain 配置诊断脚本
 * 运行: node diagnose-onechain.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OneChain 配置诊断\n');
console.log('='.repeat(50));

// 1. 检查 .env.local
console.log('\n📋 检查环境变量文件...');
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local 文件不存在！');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

// 必需的环境变量
const requiredVars = [
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_PACKAGE_ID',
  'NEXT_PUBLIC_GAME_STATE_ID',
  'NEXT_PUBLIC_MARKETPLACE_ID',
  'NEXT_PUBLIC_TOKEN_TREASURY_ID',
];

let allPresent = true;
requiredVars.forEach(varName => {
  if (envVars[varName] && envVars[varName] !== '') {
    console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: 未配置`);
    allPresent = false;
  }
});

// 2. 检查 providers.tsx
console.log('\n📋 检查 Providers 配置...');
const providersPath = path.join(__dirname, 'app', 'providers.tsx');

if (!fs.existsSync(providersPath)) {
  console.log('❌ app/providers.tsx 文件不存在！');
} else {
  const providersContent = fs.readFileSync(providersPath, 'utf-8');
  
  if (providersContent.includes('onechain-testnet')) {
    console.log('✅ 使用 OneChain 网络配置');
  } else {
    console.log('⚠️  可能未配置 OneChain 网络');
  }
  
  if (providersContent.includes('NEXT_PUBLIC_RPC_URL')) {
    console.log('✅ 使用环境变量 RPC URL');
  } else {
    console.log('⚠️  可能使用硬编码 RPC URL');
  }
}

// 3. 检查 constants.ts
console.log('\n📋 检查 Constants 配置...');
const constantsPath = path.join(__dirname, 'config', 'constants.ts');

if (!fs.existsSync(constantsPath)) {
  console.log('❌ config/constants.ts 文件不存在！');
} else {
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8');
  
  if (constantsContent.includes('RPC_URL')) {
    console.log('✅ 定义了 RPC_URL 常量');
  } else {
    console.log('⚠️  未定义 RPC_URL 常量');
  }
  
  if (constantsContent.includes('GAME_STATE_ID')) {
    console.log('✅ 定义了 GAME_STATE_ID 常量');
  } else {
    console.log('⚠️  未定义 GAME_STATE_ID 常量');
  }
}

// 4. 总结
console.log('\n' + '='.repeat(50));
console.log('\n📊 诊断总结:');

if (allPresent) {
  console.log('✅ 所有必需的环境变量都已配置');
  console.log('\n🚀 下一步:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问测试页面: http://localhost:3000/test-onechain');
  console.log('3. 连接钱包并测试功能');
} else {
  console.log('❌ 部分环境变量未配置');
  console.log('\n🔧 修复步骤:');
  console.log('1. 检查 .env.local 文件');
  console.log('2. 确保所有 NEXT_PUBLIC_* 变量都已设置');
  console.log('3. 重启开发服务器');
}

console.log('\n💡 提示:');
console.log('- 查看 ONECHAIN_SETUP.md 获取详细配置指南');
console.log('- 使用 /test-onechain 页面测试连接');
console.log('- 检查浏览器控制台获取详细错误信息');
console.log('');
