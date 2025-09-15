# HazriBook Deployment Guide

## Step 1: Create GitHub Repository

1. Open this link: https://github.com/new
2. Fill in the details:
   - Repository name: `hazribook`
   - Description: "Face recognition based attendance system for rural schools"
   - Make it Public
   - Don't initialize with any files
3. Click "Create repository"

## Step 2: Upload Files to GitHub

1. On the new empty repository page, click "uploading an existing file"

2. Upload these files and folders (drag and drop all at once):
   ```
   src/
   public/
   package.json
   package-lock.json
   tsconfig.json
   tailwind.config.js
   postcss.config.js
   .gitignore
   README.md
   ```

   DO NOT upload:
   - node_modules/ folder
   - build/ folder
   - hazribook-deploy.zip
   - .git/ folder (if it exists)
   - DEPLOY.txt
   - CLOUDFLARE-DEPLOY.md

3. At the bottom, add a commit message:
   "Initial commit: Upload HazriBook application"

4. Click "Commit changes"

## Step 3: Deploy to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Sign up for a free Cloudflare account if you don't have one
   - Use your email
   - Create a password
   - No credit card required

3. After signing in:
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select "Pages"
   - Click "Connect to Git"

4. Connect your GitHub account:
   - Click "Connect GitHub"
   - Select "hazribook" repository
   - Click "Begin setup"

5. Configure your deployment:
   - Project name: `hazribook`
   - Production branch: `main`
   
   Set Build Settings:
   ```
   Framework preset: Create React App
   Build command: npm run build
   Build output directory: build
   ```

   Add Environment Variables:
   ```
   NODE_VERSION: 16
   ```

6. Click "Save and Deploy"

Your app will be deployed to: `https://hazribook.pages.dev`

## Using Your Deployed App

1. Share the Cloudflare Pages URL with your friends
2. Each person can create their own school account
3. Data is stored locally on each device
4. The app works offline after first load

## Add to Home Screen Instructions

For iPhone:
1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Select "Add to Home Screen"
4. Name it "HazriBook" and tap Add

For Android:
1. Open the app URL in Chrome
2. Tap the three dots menu (⋮)
3. Select "Add to Home screen"
4. Name it "HazriBook" and tap Add

## Need Help?

If camera doesn't work:
1. Make sure you're using HTTPS
2. Allow camera permissions when prompted
3. Use Chrome (Android) or Safari (iOS)
4. Clear site data and refresh if needed