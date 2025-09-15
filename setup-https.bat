@echo off
echo ========================================
echo    SETTING UP HTTPS FOR MOBILE CAMERA
echo ========================================
echo.
echo IMPORTANT: Camera on phones requires HTTPS!
echo.
echo Option 1: Use ngrok (Recommended)
echo ----------------------------------
echo 1. Download ngrok from: https://ngrok.com/download
echo 2. Extract it to any folder
echo 3. Run: ngrok http 3000
echo 4. Use the HTTPS URL on your phone
echo.
echo Option 2: Use localtunnel
echo -------------------------
echo 1. Install: npm install -g localtunnel
echo 2. Run: lt --port 3000
echo 3. Use the HTTPS URL on your phone
echo.
echo Option 3: Use serveo.net (No installation)
echo ------------------------------------------
echo Run this command:
echo ssh -R 80:localhost:3000 serveo.net
echo.
pause