# HKPT PRO - Script Khoi Dong
# Double-click file nay hoac chay bang: powershell -ExecutionPolicy Bypass -File KHOI_DONG.ps1

$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $AppDir

Write-Host "`n=== HKPT PRO - Khoi Dong He Thong ===" -ForegroundColor Cyan

# Kill tien trinh cu neu co
Write-Host "`n[1/3] Giai phong cong 3001 va 5173..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue  
}
Start-Sleep -Seconds 1

# Khoi dong Backend
Write-Host "[2/3] Khoi dong Backend (node server.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$AppDir'; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Khoi dong Frontend
Write-Host "[3/3] Khoi dong Frontend (npx vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$AppDir'; npx vite --port 5173" -WindowStyle Normal

Start-Sleep -Seconds 5

# Mo trinh duyet
Write-Host "`nMo trinh duyet..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n=== Ung dung da chay tai http://localhost:5173 ===" -ForegroundColor Green
Write-Host "Tai khoan: vn24h.bnb" -ForegroundColor Gray
Write-Host "Nhan phim bat ky de dong cua so nay...`n" -ForegroundColor Gray
