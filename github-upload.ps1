# Create .gitignore file
@"
node_modules/
build/
.env
.DS_Store
*.log
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

Write-Host "Created .gitignore file" -ForegroundColor Green

# Open GitHub to create new repository
Start-Process "https://github.com/new"

Write-Host @"

=================================================================
GITHUB SETUP INSTRUCTIONS
=================================================================

1. GITHUB REPO (Browser just opened):
   - Repository name: class-photo-attendance
   - Description: Face recognition based attendance system for rural schools
   - Keep it PUBLIC
   - DON'T initialize with README
   - Click 'Create repository'

2. AFTER CREATING REPO:
   - Click 'uploading an existing file' link
   - Drag these files/folders:
     * src folder
     * public folder  
     * package.json
     * package-lock.json
     * tsconfig.json
     * tailwind.config.js
     * postcss.config.js
     * .eslintrc.json
     * .gitignore (just created)
     * README.md

3. IMPORTANT - DON'T UPLOAD:
   - node_modules folder
   - build folder

4. Commit message: "Initial commit - Class Photo Attendance System"

5. Click 'Commit changes'

Your GitHub URL will be:
https://github.com/YOUR_USERNAME/class-photo-attendance

=================================================================
"@ -ForegroundColor Cyan

# Open file explorer to make dragging easier
explorer.exe .