import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  User,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FaceDetectionResult, Student } from '../../types';

interface RecognitionResultsProps {
  capturedImage: string;
  detectedFaces: FaceDetectionResult[];
  availableStudents: Student[];
  onConfirmAttendance: (attendance: { studentId: string; isPresent: boolean }[]) => void;
  onRetake: () => void;
  className?: string;
}

const RecognitionResults: React.FC<RecognitionResultsProps> = ({
  capturedImage,
  detectedFaces,
  availableStudents,
  onConfirmAttendance,
  onRetake,
  className,
}) => {
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [expandedFace, setExpandedFace] = useState<number | null>(null);
  const [manualAssignments, setManualAssignments] = useState<{ [faceIndex: number]: string }>({});
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageScale, setImageScale] = useState({ x: 1, y: 1 });

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Recognition Debug] ${message}`, data || '');
    }
  };

  // Calculate image scaling for face box positioning
  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current) {
        const img = imageRef.current;
        const scaleX = img.clientWidth / img.naturalWidth;
        const scaleY = img.clientHeight / img.naturalHeight;
        setImageScale({ x: scaleX, y: scaleY });
        debugLog('Image scale updated', { scaleX, scaleY });
      }
    };

    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        updateScale();
      } else {
        img.onload = updateScale;
      }
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [capturedImage]);

  // Initialize attendance state
  useEffect(() => {
    const initialAttendance: { [key: string]: boolean } = {};
    detectedFaces.forEach((face, _index) => {
      if (face.studentMatch) {
        initialAttendance[face.studentMatch.student.id] = true;
      }
    });
    setAttendance(initialAttendance);
    debugLog('Initialized attendance', initialAttendance);
  }, [detectedFaces]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const handleManualAssignment = (faceIndex: number, studentId: string) => {
    if (studentId) {
      setManualAssignments((prev) => ({ ...prev, [faceIndex]: studentId }));
      setAttendance((prev) => ({ ...prev, [studentId]: true }));
      debugLog(`Manual assignment: face ${faceIndex} -> student ${studentId}`);
    } else {
      setManualAssignments((prev) => {
        const newAssignments = { ...prev };
        delete newAssignments[faceIndex];
        return newAssignments;
      });
    }
  };

  const toggleStudentAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleConfirm = () => {
    const attendanceList = availableStudents.map((student) => ({
      studentId: student.id,
      isPresent: attendance[student.id] || false,
    }));

    debugLog('Confirming attendance', {
      total: attendanceList.length,
      present: attendanceList.filter((a) => a.isPresent).length,
    });

    onConfirmAttendance(attendanceList);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalStudents = availableStudents.length;

  return (
    <div className={`bg-white min-h-screen ${className || ''}`}>
      {/* Header */}
      <div className="bg-primary-600 text-white p-4">
        <h2 className="text-lg font-semibold mb-2">Review Recognition Results</h2>
        <div className="flex items-center justify-between text-sm">
          <span>{detectedFaces.length} faces detected</span>
          <span>
            {presentCount}/{totalStudents} students marked present
          </span>
        </div>
      </div>

      {/* Photo with Face Detection Boxes */}
      <div className="relative bg-gray-900 p-4">
        <img
          ref={imageRef}
          src={capturedImage}
          alt="Captured class"
          className="w-full h-auto max-h-80 object-contain mx-auto"
        />

        {/* Face detection boxes */}
        {detectedFaces.map((face, index) => {
          const box = face.detection.box;
          const student = manualAssignments[index]
            ? availableStudents.find((s) => s.id === manualAssignments[index])
            : face.studentMatch?.student;

          return (
            <div
              key={index}
              className="absolute border-2 border-primary-400 bg-primary-400 bg-opacity-20"
              style={{
                left: box.x * imageScale.x + (imageRef.current?.offsetLeft || 0),
                top: box.y * imageScale.y + (imageRef.current?.offsetTop || 0),
                width: box.width * imageScale.x,
                height: box.height * imageScale.y,
              }}
            >
              {/* Face label */}
              <div className="absolute -top-8 left-0 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                {student ? student.name : `Face ${index + 1}`}
                {face.studentMatch && (
                  <span className="ml-1">({Math.round(face.studentMatch.confidence * 100)}%)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detection Results */}
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">Detected Faces</h3>

        {detectedFaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No faces detected in the photo</p>
            <p className="text-sm mt-1">Try retaking with better lighting</p>
          </div>
        ) : (
          detectedFaces.map((face, index) => {
            const student = manualAssignments[index]
              ? availableStudents.find((s) => s.id === manualAssignments[index])
              : face.studentMatch?.student;
            const confidence = face.studentMatch?.confidence || 0;
            const isExpanded = expandedFace === index;

            return (
              <div key={index} className="card border-l-4 border-l-primary-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {student ? (
                        <UserCheck className="w-5 h-5 text-green-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        {student ? student.name : `Unknown Face ${index + 1}`}
                      </p>
                      {student && (
                        <p className="text-sm text-gray-600">
                          Roll: {student.rollNumber} | Class: {student.class}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {face.studentMatch && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(confidence)}`}
                      >
                        {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                      </span>
                    )}

                    <button
                      onClick={() => setExpandedFace(isExpanded ? null : index)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manual Assignment
                        </label>
                        <select
                          value={manualAssignments[index] || ''}
                          onChange={(e) => handleManualAssignment(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select Student</option>
                          {availableStudents
                            .filter((s) => !attendance[s.id] || manualAssignments[index] === s.id)
                            .map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name} ({student.rollNumber})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Student List */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">All Students</h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableStudents.map((student) => {
            const isPresent = attendance[student.id] || false;

            return (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  isPresent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPresent ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    {isPresent ? (
                      <UserCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <UserX className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleStudentAttendance(student.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isPresent
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isPresent ? 'Present' : 'Mark Present'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={handleConfirm}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>
            Confirm Attendance ({presentCount}/{totalStudents})
          </span>
        </button>

        <button
          onClick={onRetake}
          className="w-full btn-outline flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Retake Photo</span>
        </button>
      </div>
    </div>
  );
};

export default RecognitionResults;
