import React, { useState, useEffect } from 'react';
import { Users, Camera, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentsStorage, AttendanceStorage } from '../../utils/storage';
import type { AttendanceRecord } from '../../types';

const DashboardScreen: React.FC = () => {
  const { state } = useApp();
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayPhotos, setTodayPhotos] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [recentActivity, setRecentActivity] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Load statistics
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Get total students
    const students = StudentsStorage.getAll();
    setTotalStudents(students.length);

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = AttendanceStorage.getByDate(today);

    // Count unique photos (sessions) today
    const uniquePhotos = new Set(todayAttendance.map((r) => r.photo)).size;
    setTodayPhotos(uniquePhotos);

    // Count unique students present today
    const uniqueStudentsPresent = new Set(todayAttendance.map((r) => r.studentId)).size;
    setTodayPresent(uniqueStudentsPresent);

    // Calculate attendance rate
    if (students.length > 0) {
      const rate = (uniqueStudentsPresent / students.length) * 100;
      setAttendanceRate(Math.round(rate));
    }

    // Get recent activity (last 5 records)
    setRecentActivity(todayAttendance.slice(0, 5));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {getGreeting()}, {state.school?.teacherName}! 👋
        </h2>
        <p className="text-gray-600">{state.school?.name}</p>
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        <div className="card text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{todayPresent}</p>
          <p className="text-sm text-gray-600">Present Today</p>
        </div>

        <div className="card text-center">
          <Camera className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{todayPhotos}</p>
          <p className="text-sm text-gray-600">Photos Today</p>
        </div>

        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
          <p className="text-sm text-gray-600">Attendance Rate</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>

        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No attendance activity today</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.studentName}</p>
                    <p className="text-xs text-gray-500">{record.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {record.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Class Summary */}
      {state.school?.classes && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Classes Overview</h3>
          <div className="space-y-2">
            {state.school.classes.map((className) => {
              const classStudents = StudentsStorage.getByClass(className);
              const todayAttendance = AttendanceStorage.getByDateAndClass(
                new Date().toISOString().split('T')[0],
                className
              );
              const presentCount = new Set(todayAttendance.map((r) => r.studentId)).size;

              return (
                <div
                  key={className}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{className}</p>
                    <p className="text-xs text-gray-600">
                      {classStudents.length} students enrolled
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {presentCount}/{classStudents.length}
                    </p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
