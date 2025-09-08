@echo off
echo Building IA Europa Landing Page for production...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: Dependencies not installed. Please run setup.bat first.
    pause
    exit /b 1
)

echo Building for production...
npm run build

if %errorlevel% neq 0 (
    echo Error: Failed to build the project.
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
echo The production files are located in the 'dist' directory.
echo.
pause