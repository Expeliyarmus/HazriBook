// Student interface
export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  faceDescriptor?: Float32Array; // For face recognition
  photo?: string; // Base64 encoded photo
  createdAt: Date;
  updatedAt: Date;
}

// School/Teacher interface
export interface School {
  id: string;
  name: string;
  teacherName: string;
  classes: string[];
  createdAt: Date;
}

// Attendance record
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  confidence: number; // Face recognition confidence (0-1)
  photo: string; // Base64 encoded class photo
  isPresent: boolean;
  isManuallyMarked: boolean;
  createdAt: Date;
}

// Face detection result
export interface FaceDetectionResult {
  detection: {
    box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    score: number;
  };
  descriptor?: Float32Array;
  studentMatch?: {
    student: Student;
    confidence: number;
  };
}

// Class session for taking attendance
export interface ClassSession {
  id: string;
  className: string;
  date: string;
  time: string;
  photo: string;
  detectedFaces: FaceDetectionResult[];
  confirmedAttendance: AttendanceRecord[];
  totalStudents: number;
  presentStudents: number;
  status: 'in-progress' | 'completed' | 'cancelled';
}

// Navigation types
export type NavScreen = 'dashboard' | 'attendance' | 'students' | 'reports';

// App state
export interface AppState {
  isAuthenticated: boolean;
  school: School | null;
  currentSession: ClassSession | null;
  loading: boolean;
  error: string | null;
}

// Local storage keys
export const STORAGE_KEYS = {
  SCHOOL: 'class-photo-school',
  STUDENTS: 'class-photo-students',
  ATTENDANCE: 'class-photo-attendance',
  SETTINGS: 'class-photo-settings',
} as const;

// API Response types for error handling
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
