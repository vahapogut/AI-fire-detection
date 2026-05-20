@echo off
echo Starting AI Fire Detection System...

:: Detect Python command
set PYTHON_CMD=
python --version >nul 2>nul
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
    goto python_found
)
py --version >nul 2>nul
if %errorlevel% equ 0 (
    set PYTHON_CMD=py
    goto python_found
)

echo.
echo [ERROR] Python was not found on your system!
echo Please install Python 3.9 or higher and ensure it is added to your PATH.
echo.
pause
exit /b 1

:python_found
echo Using Python interpreter command: %PYTHON_CMD%

echo Starting Backend (Checking dependencies and Running)...
echo This might take a while if downloading models or libraries...
start cmd /k "cd backend && (if not exist venv (echo Creating virtual environment... && %PYTHON_CMD% -m venv venv)) && venv\Scripts\python -m pip install -r requirements.txt && echo Starting Server... && venv\Scripts\python -m uvicorn main:app --reload --port 8000"

echo Starting Frontend...
start cmd /k "cd frontend && (if not exist node_modules (echo Installing node modules... && npm install)) && npm run dev"

echo System initiating...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
