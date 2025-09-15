import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, User, Hash, Users, Upload } from 'lucide-react';
import Webcam from 'react-webcam';
import { Student } from '../../types';
import { StudentsStorage } from '../../utils/storage';
import { faceApiService } from '../../services/faceApiService';
import { useApp } from '../../context/AppContext';
import CameraPermission from '../Camera/CameraPermission';
import MobileCamera from '../Camera/MobileCamera';

interface StudentRegistrationProps {
  onClose: () => void;
  onSuccess: (student: Student) => void;
  editStudent?: Student | null;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({
  onClose,
  onSuccess,
  editStudent
}) => {
  const { state, setError } = useApp();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [showMobileCamera, setShowMobileCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string>(editStudent?.photo || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    name: editStudent?.name || '',
    rollNumber: editStudent?.rollNumber || '',
    class: editStudent?.class || state.school?.classes[0] || '',
  });

  useEffect(() => {
    // Detect if we're on a mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
  }, []);

  const handleCapture = () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setCapturedPhoto(imageSrc);
          setShowCamera(false);
          setCameraError(false);
        } else {
          setError('Failed to capture photo. Please try again.');
        }
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      setError('Camera error. Please try uploading from gallery instead.');
      setCameraError(true);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedPhoto(result);
        setShowCamera(false);
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
      };
    reader.readAsDataURL(file);
  }
};

const handleMobilePhotoCapture = (photoData: string) => {
  setCapturedPhoto(photoData);
  setShowMobileCamera(false);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.rollNumber || !formData.class) {
      setError('Please fill in all required fields');
      return;
    }

    if (!capturedPhoto && !editStudent) {
      setError('Please capture a photo of the student');
      return;
    }

    setIsProcessing(true);

    try {
      // Extract face descriptor from photo
      let faceDescriptor: Float32Array | undefined;

      if (capturedPhoto && capturedPhoto !== editStudent?.photo) {
        const img = document.createElement('img') as HTMLImageElement;
        img.src = capturedPhoto;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const descriptor = await faceApiService.extractFaceDescriptor(img);
        if (descriptor) {
          faceDescriptor = descriptor;
        } else if (!editStudent) {
          setError('Could not detect face in photo. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      const student: Student = {
        id: editStudent?.id || `student-${Date.now()}`,
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim(),
        class: formData.class.trim(),
        photo: capturedPhoto || editStudent?.photo,
        faceDescriptor: faceDescriptor || editStudent?.faceDescriptor,
        createdAt: editStudent?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Save to storage
      StudentsStorage.add(student);

      console.log(`Student ${editStudent ? 'updated' : 'registered'} successfully:`, student.name);
      onSuccess(student);
    } catch (error) {
      console.error('Error registering student:', error);
      setError('Failed to register student. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Mobile Camera Modal */}
      {showMobileCamera && (
        <MobileCamera
          onPhotoCapture={handleMobilePhotoCapture}
          onClose={() => setShowMobileCamera(false)}
          currentPhoto={capturedPhoto}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {editStudent ? 'Edit Student' : 'Register New Student'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Student Photo * {isMobile && <span className="text-xs text-gray-500">(Mobile Mode)</span>}
            </label>
            
            {!showCamera ? (
              <div className="space-y-3">
                {capturedPhoto ? (
                  <div className="relative">
                    <img
                      src={capturedPhoto}
                      alt="Student"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (isMobile) {
                            setShowMobileCamera(true);
                          } else if (!cameraError) {
                            setShowPermission(true);
                          }
                        }}
                        disabled={cameraError && !isMobile}
                        className={`h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                          cameraError && !isMobile
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                            : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                        }`}
                      >
                        <Camera className={`w-8 h-8 mb-2 ${cameraError && !isMobile ? 'text-gray-300' : 'text-gray-400'}`} />
                        <span className={`text-sm ${cameraError && !isMobile ? 'text-gray-400' : 'text-gray-600'}`}>
                          {cameraError && !isMobile ? 'Camera Error' : 'Take Photo'}
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload Photo</span>
                      </button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {cameraError && !isMobile && (
                      <p className="text-sm text-amber-600 text-center">
                        Camera not available. Please upload a photo from gallery.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-48 object-cover rounded-lg"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user"
                  }}
                  onUserMediaError={(error) => {
                    console.error('Camera error:', error);
                    setCameraError(true);
                    setShowCamera(false);
                    setError('Camera access denied. Please use upload option.');
                  }}
                />
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCamera(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter student's full name"
                required
              />
            </div>
          </div>

          {/* Roll Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter roll number"
                required
              />
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                required
              >
                <option value="">Select class</option>
                {state.school?.classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{editStudent ? 'Update Student' : 'Register Student'}</span>
              </>
            )}
          </button>
          </form>
        </div>
      </div>

      {/* Camera Permission Modal */}
      {showPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-2">
              <button
                onClick={() => setShowPermission(false)}
                className="float-right p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <CameraPermission
                onPermissionGranted={() => {
                  setShowPermission(false);
                  setShowCamera(true);
                  setCameraError(false);
                }}
                onPermissionDenied={() => {
                  setShowPermission(false);
                  setCameraError(true);
                  // Automatically open file picker
                  setTimeout(() => {
                    fileInputRef.current?.click();
                  }, 100);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default StudentRegistration;
