# Phone Access Guide - Class Photo Attendance App

## Method 1: Local Network (Same Wi-Fi) - For Testing at Home

### Step 1: Find Your PC's IP Address
```powershell
ipconfig
```
Look for "IPv4 Address" under your Wi-Fi adapter (e.g., `192.168.1.100`)

### Step 2: Start the App
```powershell
npm start
```

### Step 3: Allow Firewall Access
- Windows Firewall popup may appear - click "Allow access"
- Or manually: Windows Defender Firewall → Allow an app → Add Node.js

### Step 4: Access from Phone
- Connect phone to same Wi-Fi
- Open browser on phone
- Navigate to: `http://YOUR_PC_IP:3000` (e.g., `http://192.168.1.100:3000`)

---

## Method 2: Ngrok Tunnel (Free) - For Friends Anywhere

### Step 1: Install Ngrok
1. Download from https://ngrok.com/download
2. Extract ngrok.exe to a folder (e.g., `C:\ngrok\`)
3. Sign up at https://ngrok.com (free account)
4. Get your auth token from dashboard

### Step 2: Configure Ngrok
```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your App
```powershell
cd C:\Users\Kunal\class-photo-attendance
npm start
```

### Step 4: Create Tunnel
In a new PowerShell window:
```powershell
cd C:\ngrok
.\ngrok.exe http 3000
```

### Step 5: Share the URL
- Ngrok will show: `Forwarding https://abc123.ngrok-free.app -> http://localhost:3000`
- Share the HTTPS URL with friends: `https://abc123.ngrok-free.app`
- URL changes each time (free tier)

---

## Method 3: Deploy to Vercel (Free & Permanent) - Best for Sharing

### Step 1: Create Production Build
```powershell
cd C:\Users\Kunal\class-photo-attendance
npm run build
```

### Step 2: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 3: Deploy
```powershell
vercel --prod
```
- First time: It will ask to login (opens browser)
- Project name: `class-photo-attendance`
- Directory: `./build`
- Override settings: No

### Step 4: Get Your URL
- Vercel gives you: `https://class-photo-attendance.vercel.app`
- This URL is permanent and works anywhere!

---

## Method 4: GitHub Pages (Free) - Alternative to Vercel

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `class-photo-attendance`
3. Public repository
4. Don't initialize with README

### Step 2: Add to package.json
Edit `package.json` and add:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/class-photo-attendance"
```

### Step 3: Install gh-pages
```powershell
npm install --save-dev gh-pages
```

### Step 4: Add Deploy Scripts
In `package.json` under "scripts":
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```

### Step 5: Push Code & Deploy
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/class-photo-attendance.git
git push -u origin main
npm run deploy
```

### Step 6: Access Your App
- URL: `https://YOUR_USERNAME.github.io/class-photo-attendance`
- Takes 5-10 minutes to activate first time

---

## Quick Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Local IP** | Instant, no internet needed | Same Wi-Fi only | Testing at home |
| **Ngrok** | Works anywhere, HTTPS | URL changes, 2hr limit (free) | Quick demos |
| **Vercel** | Permanent URL, fast, auto-HTTPS | Need account | Production sharing |
| **GitHub Pages** | Free forever, your domain | Setup takes time | Long-term hosting |

---

## Troubleshooting

### Camera Not Working?
- **Local IP**: Camera works without HTTPS
- **Ngrok/Vercel/GitHub**: HTTPS enables all features

### Can't Access on Phone?
1. Check firewall isn't blocking port 3000
2. Ensure phone and PC on same network (for local IP)
3. Try different browser (Chrome/Safari)

### Ngrok Errors?
- Free tier: Max 2 hours per session
- Solution: Restart tunnel or upgrade

### Vercel Deploy Failed?
```powershell
# Clear cache and rebuild
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run build
vercel --prod
```

---

## Recommended Setup for Your Demo

1. **For SIH Presentation**: Use Vercel
   - Professional URL
   - Always works
   - No last-minute issues

2. **For Testing with Friends**: Use Ngrok
   - Quick setup
   - They can test immediately
   - Good for feedback

3. **Backup Plan**: Local IP + Mobile Hotspot
   - If internet fails at venue
   - Create hotspot from your phone
   - Connect laptop and demo phones to hotspot
   - Use laptop's IP address

---

## Security Notes

- The app stores data locally in browser
- No data is sent to servers
- Safe to use on public URLs
- Each user has their own local data

---

## Quick Start Commands

```powershell
# Local Network
npm start
# Share: http://YOUR_PC_IP:3000

# Ngrok (after setup)
npm start
# New terminal:
cd C:\ngrok && .\ngrok.exe http 3000

# Vercel Deploy
npm run build && vercel --prod

# GitHub Pages Deploy
npm run deploy
```