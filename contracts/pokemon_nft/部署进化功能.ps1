# Deploy Pokemon Contract with Evolution Feature
Write-Host "Deploying Pokemon Contract with Evolution..." -ForegroundColor Cyan

# Switch to contract directory
Set-Location -Path $PSScriptRoot

# Check current address
Write-Host "`nChecking current address..." -ForegroundColor Cyan
$activeAddress = sui client active-address
Write-Host "Current address: $activeAddress" -ForegroundColor Green

# Check balance
Write-Host "`nChecking balance..." -ForegroundColor Cyan
sui client gas

# Build contract
Write-Host "`nBuilding contract..." -ForegroundColor Cyan
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful" -ForegroundColor Green

# Deploy contract (publish new version)
Write-Host "`nDeploying new contract version..." -ForegroundColor Cyan
Write-Host "Note: This will create a new Package ID" -ForegroundColor Yellow

$output = sui client publish --gas-budget 500000000 2>&1 | Out-String

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed" -ForegroundColor Red
    Write-Host $output
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Green

# Save output to file
$output | Out-File -FilePath "DEPLOY_OUTPUT.txt" -Encoding UTF8
Write-Host "`nOutput saved to DEPLOY_OUTPUT.txt" -ForegroundColor Cyan

# Extract Package ID
if ($output -match "PackageID:\s*(0x[a-f0-9]+)") {
    $packageId = $matches[1]
    Write-Host "`nNew Package ID: $packageId" -ForegroundColor Green
    
    # Update frontend .env.local
    $envPath = "..\..\frontend\.env.local"
    if (Test-Path $envPath) {
        Write-Host "`nUpdating frontend .env.local..." -ForegroundColor Cyan
        $envContent = Get-Content $envPath -Raw
        
        if ($envContent -match "NEXT_PUBLIC_PACKAGE_ID=.*") {
            $envContent = $envContent -replace "NEXT_PUBLIC_PACKAGE_ID=.*", "NEXT_PUBLIC_PACKAGE_ID=$packageId"
            $envContent | Set-Content $envPath -NoNewline
            Write-Host "Updated NEXT_PUBLIC_PACKAGE_ID" -ForegroundColor Green
        } else {
            Write-Host "NEXT_PUBLIC_PACKAGE_ID not found, please add manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "frontend/.env.local not found" -ForegroundColor Yellow
    }
    
    Write-Host "`nPlease record:" -ForegroundColor Cyan
    Write-Host "Package ID: $packageId" -ForegroundColor White
} else {
    Write-Host "`nCannot extract Package ID, check DEPLOY_OUTPUT.txt" -ForegroundColor Yellow
}

Write-Host "`n" -NoNewline
Write-Host "Evolution Feature Deployed!" -ForegroundColor Green
Write-Host "`nNew Features:" -ForegroundColor Cyan
Write-Host "  - First evolution requires Level 12" -ForegroundColor White
Write-Host "  - Second evolution requires Level 20" -ForegroundColor White
Write-Host "  - Stats increase by 20% on evolution" -ForegroundColor White
Write-Host "  - Added evolution_stage field" -ForegroundColor White

Write-Host "`n" -NoNewline
Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "  - This is a new contract deployment" -ForegroundColor White
Write-Host "  - Old NFTs will not be migrated automatically" -ForegroundColor White
Write-Host "  - Need to mint new Pokemon to use evolution feature" -ForegroundColor White
Write-Host "  - Make sure frontend Package ID is updated" -ForegroundColor White
