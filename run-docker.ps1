param(
    [switch]$InstallDocker,
    [switch]$Build,
    [string]$ApiUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"

Write-Host "=== NexusEdu - Docker Setup ===" -ForegroundColor Cyan

$hasDocker = $null
try { $hasDocker = Get-Command docker -ErrorAction Stop } catch { $hasDocker = $null }

if (-not $hasDocker) {
    if ($InstallDocker) {
        Write-Host "A descarregar Docker Desktop..." -ForegroundColor Yellow
        $url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
        $installer = "$env:TEMP\DockerDesktopInstaller.exe"
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Host "A instalar Docker Desktop (pode demorar alguns minutos)..." -ForegroundColor Yellow
        Start-Process -FilePath $installer -ArgumentList "install", "--quiet" -Wait
        Write-Host "Docker instalado. A reiniciar servico..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "Docker nao encontrado." -ForegroundColor Red
        Write-Host "Opcoes:" -ForegroundColor Yellow
        Write-Host "  1. Instalar Docker: .\run-docker.ps1 -InstallDocker" -ForegroundColor White
        Write-Host "  2. Usar backend local: .\backend\venv\Scripts\python.exe .\backend\main.py" -ForegroundColor White
        exit 1
    }
}

if ($Build) {
    Write-Host "A construir imagem Docker..." -ForegroundColor Yellow
    docker compose build backend
}

Write-Host "A iniciar servicos (PostgreSQL + Backend)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend disponivel em: $ApiUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Para construir APK com esta URL:" -ForegroundColor Cyan
Write-Host "  .\frontend\scripts\build-android.ps1 -ApiUrl `"$ApiUrl`"" -ForegroundColor White
Write-Host ""
Write-Host "Prima CTRL+C para parar." -ForegroundColor Gray

docker compose up
