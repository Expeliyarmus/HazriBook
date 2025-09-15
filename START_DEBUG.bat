@echo off
echo ========================================
echo    STARTING VS CODE DEBUGGER
echo ========================================
echo.
echo Step 1: Opening VS Code...
code .

echo Step 2: Waiting for VS Code to load...
timeout /t 3 /nobreak > nul

echo Step 3: The development server is already running
echo.
echo ========================================
echo    NOW FOLLOW THESE SIMPLE STEPS:
echo ========================================
echo.
echo  1. VS Code is now open
echo  2. Press F5 (Function key 5)
echo  3. Select "Chrome" or "Edge" when asked
echo  4. Debugging will start automatically!
echo.
echo ========================================
echo    QUICK BREAKPOINT TEST:
echo ========================================
echo.
echo  1. In VS Code, open any .tsx file
echo  2. Click left of a line number (red dot appears)
echo  3. Interact with the app in browser
echo  4. VS Code will pause at breakpoint!
echo.
echo Press F5 in VS Code now to start debugging!
echo.
pause