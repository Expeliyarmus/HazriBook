@echo off
echo Installing required dependencies for Class Photo Attendance System...

npm install react-router-dom @types/react-router-dom
npm install react-webcam @types/react-webcam
npm install face-api.js
npm install tailwindcss postcss autoprefixer
npm install lucide-react
npm install recharts
npm install @types/node

echo.
echo Setting up Tailwind CSS...
npx tailwindcss init -p

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. Run this script: install-dependencies.bat
echo 2. Update tailwind.config.js
echo 3. Update src/index.css with Tailwind directives
echo 4. Start development: npm start