# Fix and Deploy Marketplace Contract
# This script replaces the broken marketplace with a working escrow system

Write-Host "🔧 Fixing Marketplace Contract..." -ForegroundColor Cyan

# Step 1: Backup old contract
Write-Host "`n📦 Backing up old marketplace contract..." -ForegroundColor Yellow
Copy-Item "sources/marketplace.move" "sources/marketplace_old_backup.move" -Force
Write-Host "✅ Backup created: marketplace_old_backup.move" -ForegroundColor Green

# Step 2: Replace with fixed version
Write-Host "`n🔄 Replacing with fixed marketplace contract..." -ForegroundColor Yellow
Copy-Item "sources/marketplace_fixed.move" "sources/marketplace.move" -Force
Write-Host "✅ Marketplace contract updated" -ForegroundColor Green

# Step 3: Build the contract
Write-Host "`n🔨 Building contract..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Restoring backup..." -ForegroundColor Red
    Copy-Item "sources/marketplace_old_backup.move" "sources/marketplace.move" -Force
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 4: Deploy
Write-Host "`n🚀 Deploying to blockchain..." -ForegroundColor Yellow
Write-Host "⚠️  This will create a NEW marketplace with a NEW address" -ForegroundColor Yellow
Write-Host "⚠️  Old listings will NOT be migrated (they're lost anyway due to the bug)" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

# Deploy
$output = sui client publish --gas-budget 100000000 2>&1 | Out-String
Write-Host $output

# Extract package ID and marketplace ID
if ($output -match "PackageID: (0x[a-f0-9]+)") {
    $packageId = $matches[1]
    Write-Host "`n✅ New Package ID: $packageId" -ForegroundColor Green
}

if ($output -match "Marketplace.*ObjectID: (0x[a-f0-9]+)") {
    $marketplaceId = $matches[1]
    Write-Host "✅ New Marketplace ID: $marketplaceId" -ForegroundColor Green
}

# Step 5: Update environment variables
Write-Host "`n📝 Updating .env.local..." -ForegroundColor Yellow

$envPath = "../../frontend/.env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($packageId) {
        $envContent = $envContent -replace "NEXT_PUBLIC_PACKAGE_ID=0x[a-f0-9]+", "NEXT_PUBLIC_PACKAGE_ID=$packageId"
    }
    
    if ($marketplaceId) {
        $envContent = $envContent -replace "NEXT_PUBLIC_MARKETPLACE_ID=0x[a-f0-9]+", "NEXT_PUBLIC_MARKETPLACE_ID=$marketplaceId"
    }
    
    Set-Content $envPath $envContent -NoNewline
    Write-Host "✅ Environment variables updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found at $envPath" -ForegroundColor Yellow
    Write-Host "Please manually update:" -ForegroundColor Yellow
    if ($packageId) { Write-Host "  NEXT_PUBLIC_PACKAGE_ID=$packageId" }
    if ($marketplaceId) { Write-Host "  NEXT_PUBLIC_MARKETPLACE_ID=$marketplaceId" }
}

Write-Host "`n✅ Marketplace fix complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your frontend development server" -ForegroundColor White
Write-Host "2. Test listing a Pokemon" -ForegroundColor White
Write-Host "3. Test buying and canceling listings" -ForegroundColor White
