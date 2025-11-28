@echo off
echo ========================================
echo Pokemon NFT 快速修复工具
echo ========================================
echo.

echo 1. 检查环境变量...
node check-env.js
echo.

echo 2. 清除 Next.js 缓存...
if exist .next (
    rmdir /s /q .next
    echo    已清除 .next 文件夹
) else (
    echo    .next 文件夹不存在
)
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 下一步:
echo 1. 启动开发服务器: npm run dev
echo 2. 硬刷新浏览器: Ctrl+Shift+R
echo 3. 访问测试页面: http://localhost:3000/test-onechain
echo 4. 重新铸造 Pokemon: http://localhost:3000/start-game
echo.
pause
