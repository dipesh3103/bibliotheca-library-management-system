@echo off
echo.
echo ==========================================
echo   Bibliotheca Library Management Setup
echo ==========================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo Backend install failed & pause & exit /b 1 )
echo Backend ready!

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 ( echo Frontend install failed & pause & exit /b 1 )
echo Frontend ready!

echo.
echo Seeding admin user...
cd ..\backend
node -e "const mongoose=require('mongoose');mongoose.connect('mongodb://localhost:27017/library_management').then(async()=>{const User=require('./models/User');const e=await User.findOne({email:'admin@library.com'});if(!e){await User.create({name:'Admin',email:'admin@library.com',password:'admin123',role:'admin'});console.log('Admin created');}else{console.log('Admin exists');}mongoose.disconnect();}).catch(e=>console.log('Seed skipped:',e.message));" 2>nul

echo.
echo ==========================================
echo   Starting Bibliotheca...
echo ==========================================
echo.
echo   Backend  ^>  http://localhost:5000
echo   Frontend ^>  http://localhost:3000
echo.
echo   Login: admin@library.com / admin123
echo.
echo   Close this window to stop the server
echo ==========================================

start "Library Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul
start "Library Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both servers started in separate windows.
echo The browser will open automatically.
pause
