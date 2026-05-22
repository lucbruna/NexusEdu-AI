param(
    [string]$Port = "8000",
    [string]$NgrokToken = "",
    [switch]$InstallNgrok
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path "$PSScriptRoot\.."

Write-Host "=== NexusEdu - Modo Externo (ngrok) ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check / install ngrok
$ngrok = $null
try { $ngrok = Get-Command ngrok -ErrorAction Stop } catch { $ngrok = $null }

if (-not $ngrok) {
    if ($InstallNgrok) {
        Write-Host "A descarregar ngrok..." -ForegroundColor Yellow
        $url = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
        $zip = "$env:TEMP\ngrok.zip"
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
        Expand-Archive -Path $zip -DestinationPath "$env:LOCALAPPDATA\ngrok" -Force
        $ngrokPath = "$env:LOCALAPPDATA\ngrok\ngrok.exe"
        [Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:LOCALAPPDATA\ngrok", "User")
        $env:Path += ";$env:LOCALAPPDATA\ngrok"
        Write-Host "ngrok instalado em $ngrokPath" -ForegroundColor Green
    } else {
        Write-Host "ngrok nao encontrado." -ForegroundColor Red
        Write-Host "Instala automaticamente: .\scripts\run-externo.ps1 -InstallNgrok" -ForegroundColor Yellow
        exit 1
    }
}

# 2. Check if backend is running, start if not
$portCheck = netstat -ano | Select-String ":$Port"
if (-not $portCheck) {
    Write-Host "A iniciar backend na porta $Port..." -ForegroundColor Yellow
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) {
        Write-Host "Python nao encontrado. Usa Docker?" -ForegroundColor Yellow
        $choice = Read-Host "Iniciar com Docker? (s/N)"
        if ($choice -eq "s") {
            $backendProcess = Start-Process -FilePath "docker" -ArgumentList "compose", "up", "-d" -NoNewWindow -PassThru
        } else {
            Write-Host "ERRO: Nao foi possivel iniciar o backend" -ForegroundColor Red
            exit 1
        }
    } else {
        Set-Location $root\backend
        $backendProcess = Start-Process -FilePath "python" -ArgumentList "main.py" -WindowStyle Hidden -PassThru
        Start-Sleep -Seconds 5
        Set-Location $root
    }
}

# 3. Configure ngrok token if provided
if ($NgrokToken) {
    & ngrok config add-authtoken $NgrokToken
}

# 4. Start ngrok
Write-Host ""
Write-Host "A iniciar tunel ngrok..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend local: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
Write-Host "A carregar painel ngrok em http://127.0.0.1:4040..." -ForegroundColor Gray

Start-Process -FilePath "ngrok" -ArgumentList "http", $Port, "--log=stdout" -NoNewWindow

Start-Sleep -Seconds 4

# 5. Fetch the public URL
try {
    $apiResult = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -UseBasicParsing
    $publicUrl = $apiResult.tunnels[0].public_url
    Write-Host ""
    Write-Host "=== ACESSO EXTERNO ===" -ForegroundColor Green
    Write-Host "URL Publica: $publicUrl" -ForegroundColor White
    Write-Host "Docs API:    $publicUrl/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Partilha esta URL com os professores!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para construir APK com esta URL:" -ForegroundColor Cyan
    Write-Host "  .\scripts\build-android.ps1 -ApiUrl `"$publicUrl`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Prima CTRL+C para parar o tunel e o backend." -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "A iniciar ngrok... abre o painel em http://127.0.0.1:4040" -ForegroundColor Yellow
    Write-Host "para ver a URL publica." -ForegroundColor Yellow
}
