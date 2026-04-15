@echo off
echo ============================================
echo   Minificador CSS/JS - Vkron
echo ============================================
echo.

cd /d "%~dp0.."

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js nao encontrado!
    echo.
    echo Opcao 1: Instale o Node.js em https://nodejs.org
    echo Opcao 2: Abra o arquivo tools\minify.html no navegador para minificar manualmente
    echo.
    pause
    exit /b
)

:: Install clean-css-cli if not present
echo Instalando ferramenta de minificacao...
call npm install -g clean-css-cli terser >nul 2>nul

:: Minify CSS
echo.
echo Minificando CSS...
call cleancss -o css/home.min.css css/home.css
call cleancss -o css/blog.min.css css/blog.css
echo CSS minificado com sucesso!

:: Minify JS
echo.
echo Minificando JS...
call terser js/home.js -o js/home.min.js --compress --mangle
call terser js/blog.js -o js/blog.min.js --compress --mangle
echo JS minificado com sucesso!

echo.
echo ============================================
echo   Minificacao concluida!
echo ============================================
echo.
pause
