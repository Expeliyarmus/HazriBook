import React, { useState } from 'react';
import { Camera, School, User, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { School as SchoolType } from '../../types';

const LoginScreen: React.FC = () => {
  const { login, setError } = useApp();
  const [formData, setFormData] = useState({
    schoolName: '',
    teacherName: '',
    classes: [''],
  });

  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Login Debug] ${message}`, data || '');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClassChange = (index: number, value: string) => {
    const newClasses = [...formData.classes];
    newClasses[index] = value;
    setFormData((prev) => ({
      ...prev,
      classes: newClasses,
    }));
  };

  const addClassField = () => {
    setFormData((prev) => ({
      ...prev,
      classes: [...prev.classes, ''],
    }));
  };

  const removeClassField = (index: number) => {
    if (formData.classes.length > 1) {
      setFormData((prev) => ({
        ...prev,
        classes: prev.classes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.schoolName.trim() || !formData.teacherName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const validClasses = formData.classes.filter((cls) => cls.trim()).map((cls) => cls.trim());
    if (validClasses.length === 0) {
      setError('Please add at least one class');
      return;
    }

    setIsLoading(true);
    debugLog('Submitting login form', formData);

    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const school: SchoolType = {
        id: `school-${Date.now()}`,
        name: formData.schoolName.trim(),
        teacherName: formData.teacherName.trim(),
        classes: validClasses,
        createdAt: new Date(),
      };

      debugLog('Created school object', school);
      login(school);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to setup school. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md mx-auto w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HazriBook</h1>
          <h2 className="text-xl font-semibold text-primary-600 mb-1">Smart attendance tracking for rural schools</h2>
          <p className="text-gray-600 text-sm">Smart attendance tracking for rural schools</p>
        </div>

        {/* Setup Form */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <School className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">School Setup</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your school name"
                required
              />
            </div>

            {/* Teacher Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => handleInputChange('teacherName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classes You Teach *
              </label>
              <div className="space-y-3">
                {formData.classes.map((className, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => handleClassChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder={`Class ${index + 1} (e.g., Grade 5A, Class 10B)`}
                    />

                    {formData.classes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClassField(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addClassField}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Class</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-all transform ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98]'
              } text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Setting up...</span>
                </div>
              ) : (
                'Start Using App'
              )}
            </button>
          </form>

          {/* Info Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>📝 Note:</strong> Your data will be stored locally on this device. Make sure
              to backup important attendance records.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Built for rural schools with ❤️</p>
          <p className="mt-1">SIH 2025 Project</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
