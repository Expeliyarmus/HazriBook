import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, User } from 'lucide-react';
import { Student } from '../../types';
import { StudentsStorage } from '../../utils/storage';
import StudentRegistration from './StudentRegistration';
import { useApp } from '../../context/AppContext';

const StudentsScreen: React.FC = () => {
  const { state } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [showRegistration, setShowRegistration] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students when search or class changes
  useEffect(() => {
    let filtered = [...students];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter((s) => s.class === selectedClass);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.name.toLowerCase().includes(query) || s.rollNumber.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, selectedClass, students]);

  const loadStudents = () => {
    const allStudents = StudentsStorage.getAll();
    setStudents(allStudents);
  };

  // Filtering is handled in useEffect above

  const handleStudentAdded = (_student: Student) => {
    loadStudents();
    setShowRegistration(false);
    setEditingStudent(null);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowRegistration(true);
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      StudentsStorage.remove(studentId);
      loadStudents();
    }
  };

  const groupedStudents = filteredStudents.reduce(
    (acc, student) => {
      if (!acc[student.class]) {
        acc[student.class] = [];
      }
      acc[student.class].push(student);
      return acc;
    },
    {} as Record<string, Student[]>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <p className="text-sm text-gray-600 mt-1">Total: {students.length} students registered</p>
        </div>
        <button onClick={() => setShowRegistration(true)} className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Classes</option>
          {state.school?.classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery || selectedClass !== 'all'
              ? 'No students found matching your criteria'
              : 'No students registered yet'}
          </p>
          {students.length === 0 && (
            <p className="text-sm text-gray-400 mt-1">Add students to start tracking attendance</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedStudents).map(([className, classStudents]) => (
            <div key={className}>
              <h3 className="font-semibold text-gray-900 mb-3">
                {className} ({classStudents.length} students)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classStudents.map((student) => (
                  <div key={student.id} className="card flex items-center space-x-3">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      <p className="text-xs text-gray-500">{student.class}</p>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(student)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showRegistration && (
        <StudentRegistration
          onClose={() => {
            setShowRegistration(false);
            setEditingStudent(null);
          }}
          onSuccess={handleStudentAdded}
          editStudent={editingStudent}
        />
      )}
    </div>
  );
};

export default StudentsScreen;
