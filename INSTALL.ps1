# Education 5.0.1 WebApp Installation Script
# Run this from PowerShell: .\INSTALL.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Education 5.0.1 WebApp Installer" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$webappDir = "C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin"
cd $webappDir

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install @tanstack/react-query axios sonner

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Backup existing files
Write-Host "Step 2: Backing up existing files..." -ForegroundColor Yellow
if (Test-Path "src\App.tsx") {
    Copy-Item "src\App.tsx" "src\App.tsx.BACKUP" -Force
    Write-Host "✓ Backed up App.tsx" -ForegroundColor Green
}
if (Test-Path "src\main.tsx") {
    Copy-Item "src\main.tsx" "src\main.tsx.BACKUP" -Force
    Write-Host "✓ Backed up main.tsx" -ForegroundColor Green
}
if (Test-Path "src\components\Layout\Layout.tsx") {
    Copy-Item "src\components\Layout\Layout.tsx" "src\components\Layout\Layout.tsx.BACKUP" -Force
    Write-Host "✓ Backed up Layout.tsx" -ForegroundColor Green
}
Write-Host ""

# Step 3: Replace files with new versions
Write-Host "Step 3: Updating configuration files..." -ForegroundColor Yellow
if (Test-Path "src\App.tsx.NEW") {
    Move-Item "src\App.tsx.NEW" "src\App.tsx" -Force
    Write-Host "✓ Updated App.tsx" -ForegroundColor Green
}
if (Test-Path "src\main.tsx.NEW") {
    Move-Item "src\main.tsx.NEW" "src\main.tsx" -Force
    Write-Host "✓ Updated main.tsx" -ForegroundColor Green
}
if (Test-Path "src\components\Layout\Layout.tsx.NEW") {
    Move-Item "src\components\Layout\Layout.tsx.NEW" "src\components\Layout\Layout.tsx" -Force
    Write-Host "✓ Updated Layout.tsx" -ForegroundColor Green
}
Write-Host ""

# Step 4: Verify files exist
Write-Host "Step 4: Verifying installation..." -ForegroundColor Yellow
$requiredFiles = @(
    "src\api\schools.ts",
    "src\api\administrators.ts",
    "src\api\teachers.ts",
    "src\api\students.ts",
    "src\components\tables\DataTable.tsx",
    "src\pages\Schools.tsx",
    "src\pages\Administrators.tsx",
    "src\pages\Teachers.tsx",
    "src\pages\Students.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        $allFilesExist = $false
    }
}
Write-Host ""

if (-not $allFilesExist) {
    Write-Host "✗ Installation incomplete - some files are missing" -ForegroundColor Red
    exit 1
}

# Step 5: Success message
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: cd C:\Users\chimw\Documents\Work-Gs\edu5.0\backend\education-5.0.1-backend && pnpm run start:dev" -ForegroundColor White
Write-Host "2. Start webapp: npm run dev" -ForegroundColor White
Write-Host "3. Open browser to http://localhost:5173" -ForegroundColor White
Write-Host "4. Login with Super Admin:" -ForegroundColor White
Write-Host "   - Email: raldo1@gmail.com" -ForegroundColor White
Write-Host "   - Password: Martha2554#" -ForegroundColor White
Write-Host "   - Role: Super Admin" -ForegroundColor White
Write-Host ""
Write-Host "Features installed:" -ForegroundColor Yellow
Write-Host "  ✓ Schools CRUD (Create, Read, Update, Delete)" -ForegroundColor Green
Write-Host "  ✓ Administrators CRUD (Create, Read, Delete)" -ForegroundColor Green
Write-Host "  ✓ Teachers CRUD (Create, Read, Delete)" -ForegroundColor Green
Write-Host "  ✓ Students CRUD (Create, Read, Delete)" -ForegroundColor Green
Write-Host "  ✓ Role-based access control" -ForegroundColor Green
Write-Host "  ✓ Protected routes" -ForegroundColor Green
Write-Host "  ✓ Data tables with search & sort" -ForegroundColor Green
Write-Host ""
