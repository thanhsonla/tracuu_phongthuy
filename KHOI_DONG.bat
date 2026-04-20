@echo off
title HKPT PRO - Khoi Dong

echo HKPT PRO - Huyen Khong Phi Tinh
echo.

echo Buoc 1: Khoi dong Backend (cong 3001)...
start "HKPT Backend" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 4 /nobreak >nul

echo Buoc 2: Khoi dong Frontend (cong 5173)...
start "HKPT Frontend" cmd /k "cd /d %~dp0 && npx vite --port 5173"
timeout /t 5 /nobreak >nul

echo Buoc 3: Mo trinh duyet...
start http://localhost:5173

echo.
echo Xong! Truy cap: http://localhost:5173
echo Tai khoan: vn24h.bnb
