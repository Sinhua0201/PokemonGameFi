@echo off
chcp 65001 >nul
echo ========================================
echo 🧹 清理并部署智能合约
echo ========================================
echo.

cd pokemon_nft

echo 📁 清理旧文件...
if exist Move.lock (
    del Move.lock
    echo ✅ 已删除 Move.lock
)

if exist build (
    rmdir /s /q build
    echo ✅ 已删除 build 目录
)

echo.
echo 🔨 编译合约...
sui move build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 编译失败！
    pause
    exit /b 1
)

echo.
echo ✅ 编译成功！
echo.
echo 🚀 部署到测试网...
echo 请等待 10-30 秒...
echo.

sui client publish --gas-budget 100000000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 部署失败！
    echo.
    echo 💡 尝试解决方案：
    echo 1. 以管理员身份运行此脚本
    echo 2. 关闭所有编辑器和终端
    echo 3. 检查网络连接
    echo 4. 确认有足够的 Gas
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 部署成功！
echo ========================================
echo.
echo 📝 请保存上面显示的 PackageID
echo 然后更新 frontend/.env.local 文件
echo.
pause
