# 🔍 VS Code Debugging Guide

## Quick Start (Do This First!)

1. **Open Terminal in VS Code:** Press `` Ctrl + ` ``
2. **Start the app:** Type `npm start` and press Enter
3. **Start debugging:** Press `F5`
4. **Choose browser:** Select "Chrome" or "Edge"

## Setting Breakpoints

### Where to Set Breakpoints for Testing:

1. **Login Flow:**
   - File: `src/components/Auth/LoginScreen.tsx`
   - Line: 55 (handleSubmit function)
   - Test: Fill the login form and submit

2. **Student Registration:**
   - File: `src/components/Students/StudentRegistration.tsx`
   - Line: 43 (handleSubmit function)
   - Test: Add a new student

3. **Camera Capture:**
   - File: `src/components/Camera/CameraInterface.tsx`
   - Line: 54 (capture function)
   - Test: Take a photo

4. **Attendance Marking:**
   - File: `src/components/Attendance/AttendanceScreen.tsx`
   - Line: 92 (handleConfirmAttendance)
   - Test: Confirm attendance

## Debug Panel Overview

### Variables Panel (Left Side)
- **Local:** Current function variables
- **Closure:** Parent scope variables
- **Global:** Window/document objects

### Watch Panel
Add expressions to monitor:
- `state.school`
- `students.length`
- `localStorage.length`

### Call Stack
Shows function execution path

### Breakpoints Panel
Manage all your breakpoints

## Useful Debug Console Commands

```javascript
// Check app state
window.debugStorage.logAllData()

// Check specific storage
localStorage.getItem('class-photo-students')

// Clear all data (for fresh testing)
window.debugStorage.clearAllData()

// Export data
window.debugStorage.exportData()

// Check React component props
$r.props  // Select component in React DevTools first

// Test camera
navigator.mediaDevices.enumerateDevices()
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start/Continue Debugging | `F5` |
| Step Over | `F10` |
| Step Into | `F11` |
| Step Out | `Shift+F11` |
| Restart | `Ctrl+Shift+F5` |
| Stop | `Shift+F5` |
| Toggle Breakpoint | `F9` |
| Open Debug Console | `Ctrl+Shift+Y` |

## Mobile Debugging

1. Start the app: `npm start`
2. In VS Code, select "Mobile Debug (Chrome)" from dropdown
3. Press `F5`
4. Chrome opens in mobile view with debugging

## Common Issues & Solutions

### Issue: Breakpoints not hitting
**Solution:** 
- Make sure `npm start` is running
- Refresh the browser (F5 in browser)
- Check source maps are enabled

### Issue: Cannot set breakpoint
**Solution:**
- File might not be compiled yet
- Visit that page/component first
- Set breakpoint after app loads

### Issue: Variables show undefined
**Solution:**
- You might be looking at them before initialization
- Step through code with F10

## Pro Tips

1. **Conditional Breakpoints:** Right-click a breakpoint → Edit Breakpoint → Add condition
2. **Logpoints:** Right-click line number → Add Logpoint (logs without stopping)
3. **Exception Breakpoints:** In Breakpoints panel, check "Caught Exceptions"
4. **Hot Reload:** Save file while debugging to see changes instantly

## Test Scenarios to Debug

1. **Test Login:**
   - Set breakpoint in LoginScreen handleSubmit
   - Fill form and submit
   - Step through validation

2. **Test Camera:**
   - Set breakpoint in CameraInterface capture
   - Click capture button
   - Inspect image data

3. **Test Storage:**
   - Open Debug Console
   - Run: `window.debugStorage.logAllData()`
   - See all stored data

## VS Code Debug Layout Tips

1. **Arrange Panels:**
   - Drag Debug Console to bottom
   - Keep Variables on left
   - File explorer on right

2. **Use Split View:**
   - Right-click tab → Split Right
   - See component and debug side-by-side

3. **Debug Terminal:**
   - Can run commands while debugging
   - See console.log outputs

---

## Quick Test Flow

1. Press `F5` to start debugging
2. Login with any school name
3. Go to Students → Add Student
4. Take a photo (breakpoint will hit)
5. Step through with `F10`
6. Check Variables panel
7. Continue with `F5`

Happy Debugging! 🚀