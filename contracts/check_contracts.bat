@echo off
REM 智能合约检查脚本
REM 用于验证合约是否正确配置和编译

echo ========================================
echo 🔍 检查智能合约状态
echo ========================================
echo.

REM 检查 Sui CLI
echo [1/6] 检查 Sui CLI...
where sui >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Sui CLI 未安装或未添加到 PATH
    echo.
    echo 💡 解决方案：
    echo    1. 确认已安装 Sui CLI
    echo    2. 将 sui.exe 所在目录添加到 PATH
    echo    3. 重新打开 PowerShell
    echo.
    echo 📚 详细说明请查看：WINDOWS_SETUP_CN.md
    pause
    exit /b 1
)

for /f "delims=" %%i in ('sui --version 2^>nul') do set SUI_VERSION=%%i
echo ✅ %SUI_VERSION%
echo.

REM 检查钱包
echo [2/6] 检查钱包配置...
for /f "delims=" %%i in ('sui client active-address 2^>nul') do set ADDRESS=%%i
if "%ADDRESS%"=="" (
    echo ❌ 未配置钱包
    echo.
    echo 💡 解决方案：
    echo    sui client
    echo.
    pause
    exit /b 1
)
echo ✅ 钱包地址：%ADDRESS%
echo.

REM 检查网络
echo [3/6] 检查网络配置...
for /f "delims=" %%i in ('sui client active-env 2^>nul') do set NETWORK=%%i
echo ✅ 当前网络：%NETWORK%
echo.

REM 检查余额
echo [4/6] 检查余额...
sui client gas 2>nul | findstr /C:"SUI" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  余额不足或无法获取
    echo.
    echo 💡 获取测试币：
    echo    sui client faucet
    echo.
) else (
    echo ✅ 有可用余额
)
echo.

REM 检查合约文件
echo [5/6] 检查合约文件...
if not exist "pokemon_nft\Move.toml" (
    echo ❌ 找不到 Move.toml
    pause
    exit /b 1
)
echo ✅ Move.toml 存在

if not exist "pokemon_nft\sources\pokemon.move" (
    echo ❌ 找不到 pokemon.move
    pause
    exit /b 1
)
echo ✅ pokemon.move 存在

if not exist "pokemon_nft\sources\egg.move" (
    echo ❌ 找不到 egg.move
    pause
    exit /b 1
)
echo ✅ egg.move 存在

if not exist "pokemon_nft\sources\marketplace.move" (
    echo ❌ 找不到 marketplace.move
    pause
    exit /b 1
)
echo ✅ marketplace.move 存在
echo.

REM 尝试编译
echo [6/6] 尝试编译合约...
cd pokemon_nft
sui move build >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 编译失败
    echo.
    echo 💡 查看详细错误：
    echo    cd pokemon_nft
    echo    sui move build
    echo.
    cd ..
    pause
    exit /b 1
)
echo ✅ 编译成功
cd ..
echo.

echo ========================================
echo ✅ 所有检查通过！
echo ========================================
echo.
echo 📋 系统状态：
echo    - Sui CLI: %SUI_VERSION%
echo    - 网络: %NETWORK%
echo    - 钱包: %ADDRESS%
echo    - 合约: 编译成功
echo.
echo 🚀 下一步：
echo    1. 运行测试：cd pokemon_nft ^&^& sui move test
echo    2. 部署合约：deploy.bat
echo    3. 配置前端：更新 frontend\.env.local
echo    4. 启动服务：npm run dev
echo.
pause
