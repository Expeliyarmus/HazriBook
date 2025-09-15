@echo off
echo ==========================================
echo    STARTING APP WITH HTTPS FOR CAMERA
echo ==========================================
echo.

echo Step 1: Starting the app server...
start cmd /k "npm start"

echo Step 2: Waiting for server to start...
timeout /t 10 /nobreak

echo Step 3: Creating HTTPS tunnel...
echo.
echo ==========================================
echo    YOUR HTTPS URL WILL APPEAR BELOW:
echo ==========================================
echo.

lt --port 3000 --subdomain classphoto2024

echo.
echo ==========================================
echo    USE THE HTTPS URL ON YOUR PHONE!
echo ==========================================
echo.
echo The camera will now work on your phone!
echo.
pause