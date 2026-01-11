@echo off
echo ========================================
echo  ChatNet - Generate Diagrams
echo ========================================
echo.

REM Check if mmdc is installed
where mmdc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Mermaid CLI not found!
    echo Please install: npm install -g @mermaid-js/mermaid-cli
    pause
    exit /b 1
)

echo [1/3] Generating System Architecture...
mmdc -i diagrams\system_architecture.mmd -o assets\system_architecture.png -b transparent
if %ERRORLEVEL% EQU 0 (
    echo [OK] system_architecture.png created
) else (
    echo [FAIL] Failed to generate system_architecture.png
)

echo.
echo [2/3] Generating Message Flow...
mmdc -i diagrams\message_flow.mmd -o assets\MessageFlow.png -b transparent
if %ERRORLEVEL% EQU 0 (
    echo [OK] MessageFlow.png created
) else (
    echo [FAIL] Failed to generate MessageFlow.png
)

echo.
echo [3/3] Generating Technology Stack...
mmdc -i diagrams\technology_stack.mmd -o assets\TechnologyStack.png -b transparent
if %ERRORLEVEL% EQU 0 (
    echo [OK] TechnologyStack.png created
) else (
    echo [FAIL] Failed to generate TechnologyStack.png
)

echo.
echo ========================================
echo  Done! Check assets/ folder
echo ========================================
pause
