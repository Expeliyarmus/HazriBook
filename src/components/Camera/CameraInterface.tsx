import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { X } from 'lucide-react';

interface CameraInterfaceProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
  className?: string;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture, onClose, className }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);



  const videoConstraints = {
    width: { ideal: 1024 },
    height: { ideal: 576 },
    facingMode: 'environment' as const,
    aspectRatio: 16 / 9,
  };

  const capture = useCallback(async () => {
    if (!webcamRef.current) {
      return;
    }

    try {
      setIsCapturing(true);

      const imageSrc = webcamRef.current.getScreenshot({
        width: 1024,
        height: 576,
      });

      if (imageSrc) {
        onCapture(imageSrc);
      } else {
        alert('Failed to capture image. Please try again.');
      }
      setIsCapturing(false);
    } catch (error) {
      console.error('Camera capture error:', error);
      setIsCapturing(false);
      alert('Camera error. Please check permissions and try again.');
    }
  }, [onCapture]);


  return (
    <div className={`fixed inset-0 bg-black z-50 ${className || ''}`}>
      

      {/* Camera View */}
      <div className="relative w-full h-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          onUserMediaError={(error) => {
            console.error('Camera access error:', error);
            alert('Camera access denied. Please allow camera permissions and refresh.');
          }}
        />

        {/* Top Controls */}
        <div className="absolute top-4 left-4">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
            aria-label="Close camera"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
          {/* Capture Button */}
          <button
            onClick={capture}
            disabled={isCapturing}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all transform ${
              isCapturing
                ? 'bg-green-500 scale-95'
                : 'bg-white bg-opacity-20 hover:bg-opacity-30 active:scale-95'
            }`}
            aria-label="Capture photo"
          >
            {isCapturing ? (
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-90" />
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isCapturing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
            <span className="text-gray-900">Capturing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraInterface;
