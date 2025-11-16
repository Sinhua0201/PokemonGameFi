# Railway 部署配置检查脚本
# 运行: .\check_railway_setup.ps1

Write-Host "🔍 检查 Railway 部署配置..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 检查 backend 目录
Write-Host "📁 检查 backend 目录..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "  ✅ backend 目录存在" -ForegroundColor Green
} else {
    Write-Host "  ❌ backend 目录不存在" -ForegroundColor Red
    $allGood = $false
}

# 检查必需文件
$requiredFiles = @(
    "backend/main.py",
    "backend/requirements.txt",
    "backend/Procfile",
    "backend/nixpacks.toml"
)

Write-Host ""
Write-Host "📄 检查必需文件..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file 缺失" -ForegroundColor Red
        $allGood = $false
    }
}

# 检查 requirements.txt 内容
Write-Host ""
Write-Host "📦 检查 requirements.txt..." -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    $content = Get-Content "backend/requirements.txt" -Raw
    if ($content -match "fastapi") {
        Write-Host "  ✅ 包含 fastapi" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  未找到 fastapi" -ForegroundColor Yellow
    }
    if ($content -match "uvicorn") {
        Write-Host "  ✅ 包含 uvicorn" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  未找到 uvicorn" -ForegroundColor Yellow
    }
}

# 检查 Procfile
Write-Host ""
Write-Host "🚀 检查 Procfile..." -ForegroundColor Yellow
if (Test-Path "backend/Procfile") {
    $procfile = Get-Content "backend/Procfile" -Raw
    if ($procfile -match "uvicorn main:app") {
        Write-Host "  ✅ 启动命令正确" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  启动命令可能不正确" -ForegroundColor Yellow
    }
}

# 检查 .env 文件
Write-Host ""
Write-Host "🔐 检查环境变量..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "  ✅ .env 文件存在" -ForegroundColor Green
    $env = Get-Content "backend/.env" -Raw
    if ($env -match "GEMINI_API_KEY") {
        Write-Host "  ✅ 包含 GEMINI_API_KEY" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  缺少 GEMINI_API_KEY" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  .env 文件不存在（Railway 使用环境变量）" -ForegroundColor Yellow
}

# 检查是否有 railway.toml（应该删除）
Write-Host ""
Write-Host "🚂 检查 Railway 配置..." -ForegroundColor Yellow
if (Test-Path "railway.toml") {
    Write-Host "  ⚠️  发现 railway.toml（建议删除，使用 Root Directory 设置）" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ 没有 railway.toml（正确）" -ForegroundColor Green
}

# 总结
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ 所有检查通过！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Yellow
    Write-Host "1. 在 Railway Dashboard 设置 Root Directory 为 'backend'" -ForegroundColor White
    Write-Host "2. 添加环境变量（GEMINI_API_KEY, FIREBASE_CREDENTIALS）" -ForegroundColor White
    Write-Host "3. 部署！" -ForegroundColor White
} else {
    Write-Host "⚠️  发现一些问题，请修复后再部署" -ForegroundColor Yellow
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 查看详细指南: RAILWAY_FIX_NOW.md" -ForegroundColor Cyan
