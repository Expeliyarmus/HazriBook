# Open File Explorer to the build folder
Start-Process explorer.exe -ArgumentList "$PWD\build"

# Wait a moment for Explorer to open
Start-Sleep -Seconds 2

# Open Netlify Drop in browser
Start-Process "https://app.netlify.com/drop"

Write-Host @"

==========================================================
🚀 INSTANT DEPLOYMENT - NO PHONE SETUP REQUIRED!
==========================================================

1. File Explorer opened to your 'build' folder
2. Netlify Drop opened in your browser

TO DEPLOY:
- Select all files in the build folder (Ctrl+A)
- Drag them to the Netlify Drop page
- You'll get an instant URL like:
  https://amazing-name-123456.netlify.app

Share this URL with anyone - it works on all phones!
No app install or setup needed on their phones.

==========================================================
"@ -ForegroundColor Green

Read-Host "Press Enter to continue..."