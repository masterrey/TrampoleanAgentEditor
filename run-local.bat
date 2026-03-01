@echo off
setlocal

cd /d "%~dp0"

if not exist ".env.local" (
  echo [ERRO] Arquivo .env.local nao encontrado na raiz do projeto.
  echo Crie o arquivo .env.local antes de iniciar.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRO] npm nao encontrado. Instale o Node.js 20+ e tente novamente.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo Iniciando projeto em modo desenvolvimento...
call npm run dev

if errorlevel 1 (
  echo [ERRO] Falha ao iniciar o projeto.
  pause
  exit /b 1
)

endlocal
