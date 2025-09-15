import React, { useState, useEffect } from 'react';
import { Camera, Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentsStorage, AttendanceStorage } from '../../utils/storage';
import { Student, AttendanceRecord } from '../../types';
import CameraInterface from '../Camera/CameraInterface';
import MobileCamera from '../Camera/MobileCamera';
import { faceApiService } from '../../services/faceApiService';

const AttendanceScreen: React.FC = () => {
  const { state, setCurrentSession, setError } = useApp();
  const [showCamera, setShowCamera] = useState(false);
  const [showMobileCamera, setShowMobileCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [recentSessions, setRecentSessions] = useState<AttendanceRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if we're on a mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    setIsMobile(mobileRegex.test(userAgent.toLowerCase()));

    // Load recent attendance sessions
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = AttendanceStorage.getByDate(today);
    setRecentSessions(todayAttendance.slice(0, 5));

    // Set default class
    if (state.school?.classes.length) {
      setSelectedClass(state.school.classes[0]);
    }
  }, [state.school]);

  useEffect(() => {
    // Load students for selected class
    if (selectedClass) {
      const classStudents = StudentsStorage.getByClass(selectedClass);
      setStudents(classStudents);
    }
  }, [selectedClass]);

  const handleStartCamera = () => {
    if (!selectedClass) {
      setError('Please select a class first');
      return;
    }

    if (students.length === 0) {
      setError('No students registered for this class. Please add students first.');
      return;
    }

    if (isMobile) {
      setShowMobileCamera(true);
    } else {
      setShowCamera(true);
    }
  };

  const handlePhotoCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setShowCamera(false);
    setIsProcessing(true);

    try {
      // Process the image for face detection
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Detect faces and match with students
      const faces = await faceApiService.processClassPhoto(img, students);

      // Immediately convert matches to attendance (skip manual review for speed)
      const autoAttendance = students.map((s) => ({
        studentId: s.id,
        isPresent: !!faces.find((f) => f.studentMatch?.student.id === s.id),
      }));

      handleConfirmAttendance(autoAttendance);
    } catch (error) {
      console.error('Error processing photo:', error);
      setError('Failed to process photo. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleConfirmAttendance = (attendance: { studentId: string; isPresent: boolean }[]) => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    const records: AttendanceRecord[] = [];

    attendance.forEach(({ studentId, isPresent }) => {
      if (isPresent) {
        const student = students.find((s) => s.id === studentId);
        if (student) {
          const record: AttendanceRecord = {
            id: `attendance-${Date.now()}-${studentId}`,
            studentId,
            studentName: student.name,
            class: selectedClass,
            date,
            time,
            confidence: 0.95, // Mock confidence
            photo: capturedImage,
            isPresent: true,
            isManuallyMarked: false,
            createdAt: new Date(),
          };
          records.push(record);
        }
      }
    });

    // Save attendance records
    AttendanceStorage.addBulk(records);

    // Reset state
    setCapturedImage('');
    setCurrentSession(null);

    // Reload recent sessions
    const todayAttendance = AttendanceStorage.getByDate(date);
    setRecentSessions(todayAttendance.slice(0, 5));

    // Show success message
    alert(`Attendance marked successfully! ${records.length} students present.`);
  };

  // Retake flow removed for faster processing

  // Group recent sessions by class
  const sessionsByClass = recentSessions.reduce(
    (acc, record) => {
      if (!acc[record.class]) {
        acc[record.class] = [];
      }
      acc[record.class].push(record);
      return acc;
    },
    {} as Record<string, AttendanceRecord[]>
  );

  // If you want to skip manual review for speed, auto-confirm after processing
  // We will show results briefly only if needed. Otherwise, proceed directly.

  return (
    <>
      {/* Mobile Camera Modal */}
      {showMobileCamera && (
        <MobileCamera
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowMobileCamera(false)}
        />
      )}

      <div className="p-4 space-y-6">
        {/* Class Selection */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Select Class</h3>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {state.school?.classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {selectedClass && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              <Users className="w-4 h-4 inline mr-1" />
              {students.length} students registered
            </span>
            <span className="text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Camera Section */}
      <div className="card text-center">
        <Camera className="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Take Attendance Photo</h2>
        <p className="text-gray-600 mb-6">
          Capture a photo of your class to automatically mark attendance
        </p>

        <button
          onClick={handleStartCamera}
          disabled={!selectedClass || students.length === 0}
          className={`w-full btn-primary flex items-center justify-center ${
            !selectedClass || students.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Camera className="w-5 h-5 mr-2" />
          {isMobile ? 'Take Photo' : 'Start Camera'}
        </button>

        {students.length === 0 && selectedClass && (
          <p className="text-sm text-amber-600 mt-3">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Please register students first
          </p>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Today's Attendance</h3>

        {Object.keys(sessionsByClass).length === 0 ? (
          <p className="text-gray-500 text-sm">No attendance taken today</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(sessionsByClass).map(([className, records]) => {
              const uniqueStudents = new Set(records.map((r) => r.studentId)).size;

              return (
                <div key={className} className="border-l-4 border-l-primary-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{className}</p>
                      <p className="text-sm text-gray-600">{uniqueStudents} students present</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Last: {records[0].time}
                      </p>
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Interface */}
      {showCamera && (
        <CameraInterface onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
            <span>Processing faces...</span>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default AttendanceScreen;
