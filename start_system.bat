@echo off
echo ===================================================
echo   PRAVAAH - Real ML Landslide Intelligence Platform
echo ===================================================
echo Starting FastAPI ML Inference Backend on port 8000...
start cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul
echo Starting Next.js PRAVAAH Frontend on port 3000...
start cmd /k "npm run dev"
echo.
echo ===================================================
echo PRAVAAH is launching!
echo Backend:  http://127.0.0.1:8000 (Docs: /docs)
echo Frontend: http://localhost:3000
echo ===================================================
