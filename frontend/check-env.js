#!/usr/bin/env node

/**
 * 检查环境变量是否正确加载
 */

console.log('🔍 检查环境变量...\n');

// 读取 .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const packageIdMatch = envContent.match(/NEXT_PUBLIC_PACKAGE_ID=(.+)/);
const onechainPackageIdMatch = envContent.match(/NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=(.+)/);

console.log('📋 .env.local 中的配置:');
console.log('NEXT_PUBLIC_PACKAGE_ID:', packageIdMatch ? packageIdMatch[1] : '未找到');
console.log('NEXT_PUBLIC_ONECHAIN_PACKAGE_ID:', onechainPackageIdMatch ? onechainPackageIdMatch[1] : '未找到');

console.log('\n💡 预期的 Package ID (V2):');
console.log('0xf2912bdcd0ce0d68b18e7574cab1cbecd289c450cc71071760106a443cd6dcb9');

console.log('\n⚠️  如果 Package ID 不匹配:');
console.log('1. 确认 .env.local 文件已保存');
console.log('2. 重启开发服务器 (npm run dev)');
console.log('3. 清除浏览器缓存');
console.log('4. 硬刷新页面 (Ctrl+Shift+R 或 Cmd+Shift+R)');
