import React, { useRef, useState } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';

interface MobileCameraProps {
  onPhotoCapture: (photo: string) => void;
  onClose: () => void;
  currentPhoto?: string;
}

const MobileCamera: React.FC<MobileCameraProps> = ({ onPhotoCapture, onClose, currentPhoto }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(currentPhoto || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        setIsProcessing(false);
        return;
      }

      // Read and resize the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1280px width)
          let width = img.width;
          let height = img.height;
          const maxWidth = 1280;
          
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(compressedImage);
          setIsProcessing(false);
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        alert('Failed to read photo. Please try again.');
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onPhotoCapture(preview);
    }
  };

  const handleRetake = () => {
    setPreview('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Take Photo</h2>
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {!preview ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
              {/* Camera/Gallery Input - This works on ALL mobile browsers */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"  // This tells mobile browsers to prefer camera
                onChange={handleFileChange}
                className="hidden"
                id="camera-input"
              />
              
              <label
                htmlFor="camera-input"
                className="block w-full"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Tap to Take Photo
                  </p>
                  <p className="text-sm text-gray-500">
                    Uses your device camera or gallery
                  </p>
                </div>
              </label>

              {/* Alternative: Direct gallery access */}
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="gallery-input"
                />
                <label
                  htmlFor="gallery-input"
                  className="block w-full"
                >
                  <div className="border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Or choose from gallery
                    </p>
                  </div>
                </label>
              </div>

              {isProcessing && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Processing photo...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Photo Preview */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={preview}
                alt="Captured"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                onClick={handleRetake}
                className="py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Use Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-3 border-t border-blue-100">
        <p className="text-xs text-blue-700 text-center">
          💡 Tip: Make sure face is clearly visible and well-lit
        </p>
      </div>
    </div>
  );
};

export default MobileCamera;