param(
    [string]$ApiUrl = "http://0.0.0.0:8000",
    [int]$Port = 8000,
    [string]$DbUrl = "postgresql://postgres:20201020@localhost/nexusedu",
    [string]$OutDir = "$PSScriptRoot\..\dist"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path "$PSScriptRoot\.."
$backend = Join-Path $root "backend"

Write-Host "=== NexusEdu Backend - Build Executavel ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$backend\venv")) {
    Write-Host "A criar ambiente virtual..." -ForegroundColor Yellow
    python -m venv "$backend\venv"
    & "$backend\venv\Scripts\pip" install -r "$backend\requirements.txt"
    & "$backend\venv\Scripts\pip" install pyinstaller
}

Write-Host "A instalar dependencias..." -ForegroundColor Yellow
& "$backend\venv\Scripts\pip" install pyinstaller 2>&1 | Out-Null

$exeName = "NexusEdu-Server.exe"
$specContent = @"
# -*- mode: python ; coding: utf-8 -*-
a = Analysis(
    ['main.py'],
    pathex=['$backend'],
    binaries=[],
    datas=[],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.middleware',
        'uvicorn.middleware.asgi2',
        'uvicorn.middleware.asgi3',
        'uvicorn.middleware.message_logger',
        'uvicorn.middleware.proxy_headers',
        'uvicorn.middleware.wsgi',
        'passlib.handlers.bcrypt',
        'pydantic',
        'pydantic_settings',
        'sqlalchemy',
        'sqlalchemy.ext.declarative',
        'alembic',
        'slowapi',
        'multipart',
        'jose',
        'cryptography',
        'requests',
        'pytesseract',
        'pypdf',
        'docx',
        'PIL',
        'mercadopago',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'numpy'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='$exeName',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_trap=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
"@

$specFile = Join-Path $backend "build.spec"
Set-Content -Path $specFile -Value $specContent -Encoding UTF8

Write-Host "A compilar executavel (isto pode demorar alguns minutos)..." -ForegroundColor Yellow
$env:DATABASE_URL = $DbUrl
$env:HOST = "0.0.0.0"
$env:PORT = "$Port"
$env:CORS_ORIGINS = "http://localhost:5173,capacitor://localhost,http://localhost"

& "$backend\venv\Scripts\pyinstaller" --clean --distpath "$OutDir" --workpath "$backend\build" "$specFile" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: A compilacao falhou." -ForegroundColor Red
    exit 1
}

$exePath = Join-Path $OutDir $exeName
if (Test-Path $exePath) {
    Write-Host ""
    Write-Host "=== Sucesso! ===" -ForegroundColor Green
    Write-Host "Executavel criado em: $exePath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para executar:" -ForegroundColor Cyan
    Write-Host "  $exePath" -ForegroundColor White
    Write-Host ""
    Write-Host "Nota: e necessario ter PostgreSQL a correr em localhost:5432" -ForegroundColor Yellow
    Write-Host "      ou usar Docker para a base de dados:" -ForegroundColor Yellow
    Write-Host "  docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=20201020 -e POSTGRES_DB=nexusedu postgres:16-alpine" -ForegroundColor Yellow
}
