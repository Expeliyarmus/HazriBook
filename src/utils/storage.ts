import { Student, School, AttendanceRecord, STORAGE_KEYS } from '../types';

// Debug utility - can be toggled for debugging
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Storage Debug] ${message}`, data || '');
  }
};

// Generic storage utility with error handling
class StorageUtil {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        debugLog(`No item found for key: ${key}`);
        return null;
      }
      const parsed = JSON.parse(item);
      debugLog(`Retrieved item for key: ${key}`, parsed);
      return parsed;
    } catch (error) {
      console.error(`Error getting item from storage (key: ${key}):`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      debugLog(`Stored item for key: ${key}`, value);
      return true;
    } catch (error) {
      console.error(`Error storing item (key: ${key}):`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      debugLog(`Removed item for key: ${key}`);
      return true;
    } catch (error) {
      console.error(`Error removing item (key: ${key}):`, error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      localStorage.clear();
      debugLog('Cleared all storage');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

// School management
export const SchoolStorage = {
  get(): School | null {
    return StorageUtil.get<School>(STORAGE_KEYS.SCHOOL);
  },

  set(school: School): boolean {
    return StorageUtil.set(STORAGE_KEYS.SCHOOL, school);
  },

  clear(): boolean {
    return StorageUtil.remove(STORAGE_KEYS.SCHOOL);
  },
};

// Students management
export const StudentsStorage = {
  getAll(): Student[] {
    return StorageUtil.get<Student[]>(STORAGE_KEYS.STUDENTS) || [];
  },

  setAll(students: Student[]): boolean {
    return StorageUtil.set(STORAGE_KEYS.STUDENTS, students);
  },

  add(student: Student): boolean {
    const students = this.getAll();
    const existingIndex = students.findIndex((s) => s.id === student.id);

    if (existingIndex >= 0) {
      students[existingIndex] = student;
      debugLog('Updated existing student', student);
    } else {
      students.push(student);
      debugLog('Added new student', student);
    }

    return this.setAll(students);
  },

  remove(studentId: string): boolean {
    const students = this.getAll();
    const filteredStudents = students.filter((s) => s.id !== studentId);
    debugLog(`Removed student with ID: ${studentId}`);
    return this.setAll(filteredStudents);
  },

  getByClass(className: string): Student[] {
    const students = this.getAll();
    return students.filter((s) => s.class === className);
  },

  getById(studentId: string): Student | null {
    const students = this.getAll();
    return students.find((s) => s.id === studentId) || null;
  },
};

// Attendance management
export const AttendanceStorage = {
  getAll(): AttendanceRecord[] {
    return StorageUtil.get<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE) || [];
  },

  setAll(records: AttendanceRecord[]): boolean {
    return StorageUtil.set(STORAGE_KEYS.ATTENDANCE, records);
  },

  add(record: AttendanceRecord): boolean {
    const records = this.getAll();
    records.push(record);
    debugLog('Added attendance record', record);
    return this.setAll(records);
  },

  addBulk(records: AttendanceRecord[]): boolean {
    const existingRecords = this.getAll();
    const allRecords = [...existingRecords, ...records];
    debugLog(`Added ${records.length} attendance records`);
    return this.setAll(allRecords);
  },

  getByDate(date: string): AttendanceRecord[] {
    const records = this.getAll();
    return records.filter((r) => r.date === date);
  },

  getByClass(className: string): AttendanceRecord[] {
    const records = this.getAll();
    return records.filter((r) => r.class === className);
  },

  getByDateAndClass(date: string, className: string): AttendanceRecord[] {
    const records = this.getAll();
    return records.filter((r) => r.date === date && r.class === className);
  },
};

// Debugging helper functions
export const DebugStorage = {
  logAllData() {
    console.group('📊 Storage Debug Data');
    console.log('School:', SchoolStorage.get());
    console.log('Students:', StudentsStorage.getAll());
    console.log('Attendance:', AttendanceStorage.getAll());
    console.groupEnd();
  },

  clearAllData() {
    const confirm = window.confirm(
      'Are you sure you want to clear all data? This cannot be undone.'
    );
    if (confirm) {
      SchoolStorage.clear();
      StudentsStorage.setAll([]);
      AttendanceStorage.setAll([]);
      console.log('🗑️ All data cleared');
    }
  },

  exportData() {
    const data = {
      school: SchoolStorage.get(),
      students: StudentsStorage.getAll(),
      attendance: AttendanceStorage.getAll(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('📤 Data exported');
  },
};

// Make debug functions available globally in development
if (DEBUG) {
  (window as any).debugStorage = DebugStorage;
  console.log('🔧 Debug storage functions available via window.debugStorage');
}
