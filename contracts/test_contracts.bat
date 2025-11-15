@echo off
REM 智能合约测试脚本

echo ========================================
echo 🧪 运行智能合约测试
echo ========================================
echo.

REM 检查 Sui CLI
where sui >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Sui CLI 未安装
    echo 请先配置 Sui CLI（查看 WINDOWS_SETUP_CN.md）
    pause
    exit /b 1
)

REM 进入合约目录
cd pokemon_nft
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 找不到 pokemon_nft 目录
    pause
    exit /b 1
)

echo 📦 合约模块：
echo    - pokemon (宝可梦 NFT)
echo    - egg (蛋 NFT 和繁殖)
echo    - marketplace (市场交易)
echo.

REM 运行所有测试
echo ========================================
echo 🧪 运行所有测试...
echo ========================================
echo.

sui move test --gas-limit 100000000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 测试失败
    echo.
    echo 💡 常见问题：
    echo    1. 检查合约语法
    echo    2. 确认测试逻辑正确
    echo    3. 查看上面的错误信息
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 所有测试通过！
echo ========================================
echo.

REM 显示测试统计
echo 📊 测试模块：
echo    ✅ pokemon_tests - 宝可梦 NFT 测试
echo    ✅ egg_tests - 蛋和繁殖测试
echo    ✅ marketplace_tests - 市场测试
echo.

cd ..

echo 🚀 下一步：
echo    1. 部署合约：deploy.bat
echo    2. 配置前端：更新 .env.local
echo    3. 启动游戏：npm run dev
echo.

pause
