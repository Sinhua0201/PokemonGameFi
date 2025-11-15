@echo off
REM 宝可梦 NFT 合约一键部署脚本（Windows 版本）
REM 使用方法：双击运行或在命令行输入 deploy.bat

echo ========================================
echo 🚀 开始部署宝可梦 NFT 合约...
echo ========================================
echo.

REM 检查 Sui CLI 是否安装
where sui >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：Sui CLI 未安装
    echo 请先运行：cargo install --locked sui
    pause
    exit /b 1
)

echo ✅ Sui CLI 已安装
echo.

REM 检查钱包
echo 📝 检查钱包...
for /f "delims=" %%i in ('sui client active-address 2^>nul') do set ADDRESS=%%i
if "%ADDRESS%"=="" (
    echo ❌ 错误：未找到钱包
    echo 请先运行：sui client
    pause
    exit /b 1
)

echo ✅ 钱包地址：%ADDRESS%
echo.

REM 检查余额
echo 💰 检查余额...
echo ⚠️  请确保你有足够的测试币（至少 0.1 SUI）
echo 如果余额不足，请运行：sui client faucet
echo.
pause

REM 进入合约目录
cd pokemon_nft
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误：找不到 pokemon_nft 目录
    pause
    exit /b 1
)

REM 运行测试
echo ========================================
echo 🧪 运行测试...
echo ========================================
sui move test

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  测试失败，但继续构建...
    echo.
)

REM 构建合约
echo ========================================
echo 🔨 构建合约...
echo ========================================
sui move build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo ✅ 构建成功
echo.

REM 部署合约
echo ========================================
echo 🚀 部署合约到测试网...
echo ⏳ 这可能需要 10-30 秒...
echo ========================================
echo.

sui client publish --gas-budget 100000000 > deploy_output.txt 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 部署失败
    type deploy_output.txt
    pause
    exit /b 1
)

echo ✅ 部署成功！
echo.

REM 显示输出
echo ========================================
echo 📋 部署输出：
echo ========================================
type deploy_output.txt
echo.

echo ========================================
echo 📝 重要提示：
echo ========================================
echo 1. 请从上面的输出中找到 "Package ID"
echo 2. 复制 Package ID（格式：0x开头的一串字符）
echo 3. 更新配置文件：
echo    - frontend\.env.local 中的 NEXT_PUBLIC_ONECHAIN_PACKAGE_ID
echo    - backend\.env 中的 ONECHAIN_PACKAGE_ID
echo.
echo 4. 重启服务：
echo    - 前端：cd frontend ^&^& npm run dev
echo    - 后端：cd backend ^&^& python main.py
echo.
echo 5. 访问：http://localhost:3000
echo.

REM 保存输出到上级目录
copy deploy_output.txt ..\DEPLOY_OUTPUT.txt >nul
echo 📝 部署输出已保存到 contracts\DEPLOY_OUTPUT.txt
echo.

echo 🎉 部署完成！
echo.
pause
