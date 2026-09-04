# OsterdOps C++ Gateway — PowerShell Build Script

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   OsterdOps C++ Gateway — PowerShell Build" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$hasCl = Get-Command cl -ErrorAction SilentlyContinue
$hasGpp = Get-Command g++ -ErrorAction SilentlyContinue
$hasDocker = Get-Command docker -ErrorAction SilentlyContinue

if ($hasGpp) {
    Write-Host "[Info] Found g++ compiler. Building standalone release..." -ForegroundColor Green
    if (!(Test-Path "build")) { New-Item -ItemType Directory -Path "build" | Out-Null }
    g++ -std=c++17 -O3 -I./include src/*.cpp -lws2_32 -lpthread -o build/osterdops_gateway.exe
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[Success] Binary compiled at build/osterdops_gateway.exe" -ForegroundColor Green
        Write-Host "Run with: .\build\osterdops_gateway.exe --port 8080" -ForegroundColor Yellow
    }
} elseif ($hasCl) {
    Write-Host "[Info] Found MSVC compiler. Building with CMake..." -ForegroundColor Green
    if (!(Test-Path "build")) { New-Item -ItemType Directory -Path "build" | Out-Null }
    Set-Location build
    cmake ..
    cmake --build . --config Release
    Set-Location ..
} elseif ($hasDocker) {
    Write-Host "[Info] Host compiler not found. Building with Docker..." -ForegroundColor Yellow
    docker build -t osterdops-gateway-cpp .
    Write-Host "[Success] Docker image built. Run with: docker run -p 8080:8080 osterdops-gateway-cpp" -ForegroundColor Green
} else {
    Write-Host "[Warning] Neither g++, cl, nor docker were detected in PATH." -ForegroundColor Red
    Write-Host "Install MinGW-w64, Visual Studio C++ Build Tools, or Docker Desktop to compile." -ForegroundColor Gray
}
