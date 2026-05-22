param(
  [string]$ApiUrl = "http://192.168.1.12:8000"
)

Write-Host "=== NexusEdu AI - Build Android APK ===" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

# Step 1: Build frontend with API URL
Write-Host "[1/4] Building frontend (Vite)... " -NoNewline
$env:VITE_API_URL = $ApiUrl
Set-Location "$PSScriptRoot\.."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# Step 2: Sync Capacitor
Write-Host "[2/4] Syncing Capacitor... " -NoNewline
npx cap sync
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# Step 3: Build APK
Write-Host "[3/4] Building Android APK... " -NoNewline
Set-Location "android"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Amazon Corretto\jdk21.0.11_10"
.\gradlew.bat assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED" -ForegroundColor Red; exit 1 }
Write-Host "OK" -ForegroundColor Green

# Step 4: Locate APK
Write-Host "[4/4] Locating APK..."
$apk = Get-ChildItem -Path "app\build\outputs\apk\debug\*.apk" | Select-Object -First 1
if ($apk) {
  Write-Host ""
  Write-Host "=== APK PRONTO ===" -ForegroundColor Green
  Write-Host "Local: $($apk.FullName)" -ForegroundColor White
  Write-Host "Tamanho: $([math]::Round($apk.Length / 1MB, 1)) MB" -ForegroundColor White
  Write-Host ""
  Write-Host "Instala no telemóvel:" -ForegroundColor Yellow
  Write-Host "  1. Transfere o APK para o Android" -ForegroundColor Yellow
  Write-Host "  2. Abre e instala" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Backend tem de estar a correr em:" -ForegroundColor Yellow
  Write-Host "  $ApiUrl" -ForegroundColor Cyan
} else {
  Write-Host "APK não encontrado!" -ForegroundColor Red
  exit 1
}

Set-Location "$PSScriptRoot\.."
