import React, { useState, useEffect } from 'react';
import { Camera, Shield, AlertCircle } from 'lucide-react';

interface CameraPermissionProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

const CameraPermission: React.FC<CameraPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [browserInfo, setBrowserInfo] = useState<string>('');
  const [isHttps, setIsHttps] = useState(false);

  useEffect(() => {
    checkCameraPermission();
    detectBrowser();
    checkHttps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    
    if (userAgent.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('Edge') > -1) {
      browser = 'Edge';
    }
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setBrowserInfo(`${browser} ${isMobile ? '(Mobile)' : '(Desktop)'}`);
  };

  const checkHttps = () => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsHttps(isSecure);
  };

  const checkCameraPermission = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported');
        setPermissionStatus('denied');
        return;
      }

      // Check current permission status if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(result.state as any);
          
          if (result.state === 'granted') {
            onPermissionGranted();
            return;
          }
        } catch (error) {
          console.log('Permissions API not fully supported, trying direct access');
        }
      }

      // If permission API not available or permission not granted, set to prompt
      setPermissionStatus('prompt');
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setPermissionStatus('prompt');
    }
  };

  const requestCameraPermission = async () => {
    try {
      setPermissionStatus('checking');
      
      // Create a test stream to trigger permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false 
      });
      
      // Permission granted - stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      onPermissionGranted();
    } catch (error: any) {
      console.error('Camera permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        onPermissionDenied();
      } else if (error.name === 'NotFoundError') {
        alert('No camera found on this device');
        setPermissionStatus('denied');
        onPermissionDenied();
      } else {
        setPermissionStatus('denied');
        onPermissionDenied();
      }
    }
  };

  if (permissionStatus === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3" />
        <p className="text-sm text-gray-600">Checking camera access...</p>
      </div>
    );
  }

  if (!isHttps && !window.location.hostname.includes('localhost')) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 mb-2">HTTPS Required for Camera</h3>
            <p className="text-sm text-amber-700 mb-3">
              Camera access requires a secure connection (HTTPS). You're currently using HTTP.
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-amber-900">Solutions:</p>
              <ul className="list-disc list-inside text-amber-700 space-y-1">
                <li>Use the upload photo option instead</li>
                <li>Access the app via HTTPS</li>
                <li>Use ngrok for secure tunnel: <code className="bg-amber-100 px-1">ngrok http 3000</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-2">Camera Access Denied</h3>
            <p className="text-sm text-red-700 mb-3">
              Camera permission was denied. Please enable it in your browser settings.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-900">How to enable camera:</p>
              <div className="text-sm text-red-700 space-y-1">
                {browserInfo.includes('Chrome') && (
                  <>
                    <p>1. Click the lock/info icon in the address bar</p>
                    <p>2. Click "Site settings"</p>
                    <p>3. Find "Camera" and change to "Allow"</p>
                    <p>4. Refresh the page</p>
                  </>
                )}
                {browserInfo.includes('Safari') && (
                  <>
                    <p>1. Go to Safari → Preferences → Websites</p>
                    <p>2. Click on Camera</p>
                    <p>3. Find this website and change to "Allow"</p>
                    <p>4. Refresh the page</p>
                  </>
                )}
                {!browserInfo.includes('Chrome') && !browserInfo.includes('Safari') && (
                  <>
                    <p>1. Check your browser settings</p>
                    <p>2. Enable camera permission for this site</p>
                    <p>3. Refresh the page</p>
                  </>
                )}
              </div>
              <button
                onClick={requestCameraPermission}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Permission Required</h3>
        
        <p className="text-sm text-gray-600 mb-6">
          To take photos, we need access to your camera. Your privacy is important to us.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-3">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Your camera is only used when you explicitly take a photo</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-3">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Photos are stored locally on your device</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-600" />
            <span>We never upload photos without your permission</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={requestCameraPermission}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Allow Camera Access
          </button>
          
          <button
            onClick={onPermissionDenied}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Use Upload Instead
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Browser: {browserInfo}</p>
          <p>Secure Connection: {isHttps ? '✅ Yes' : '❌ No (Camera may not work)'}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraPermission;