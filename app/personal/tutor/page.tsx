'use client'

import { useSearchParams } from 'next/navigation';
import { useState } from 'react'
import { Upload, Plus, Edit3, Trash2, Users, DollarSign, Eye, BarChart3, Clock, Star, CheckCircle, AlertCircle, FileText, Video, Image } from 'lucide-react'
import StatsCard from '@/components/StatsCard'

const TutorPage = () => {
  const searchParams = useSearchParams();
  const walletAddress = searchParams.get('address');

  const [activeTab, setActiveTab] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'design',
    difficulty: 'beginner',
    duration: '',
    price: ''
  })

  const stats = [
    { label: 'Courses Published', value: '8', icon: Upload, color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { label: 'Total Students', value: '1,247', icon: Users, color: 'bg-gradient-to-r from-green-500 to-teal-500' },
    { label: 'Total Earnings', value: '$3,892', icon: DollarSign, color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  ]

  var courses = [
    {
      id: 1,
      title: 'Advanced UI/UX Design',
      description: 'Learn advanced techniques in UI/UX design, including user research, prototyping, and usability testing.',
      category: 'design',
      difficulty: 'advanced',
      duration: '10 hours',
      materials: [
        { type: 'video', name: 'Introduction to UI/UX' },
        { type: 'document', name: 'UI/UX Best Practices' }
      ],
      students: 432,
      earnings: '$1,296',
      rating: 4.9,
      status: 'published',
      lastUpdated: '2024-01-15',
      price: 25,
      icon: '🎨'
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      description: 'Master JavaScript with this comprehensive course covering ES6, asynchronous programming, and modern frameworks.',
      category: 'programming',
      difficulty: 'intermediate',
      duration: '15 hours',
      materials: [
        { type: 'video', name: 'JavaScript Basics' },
        { type: 'document', name: 'ES6 Features' }
      ],
      students: 687,
      earnings: '$2,061',
      rating: 4.8,
      status: 'published',
      lastUpdated: '2024-01-10',
      price: 30,
      icon: '⚡'
    },
    {
      id: 3,
      title: 'Digital Photography Basics',
      description: 'A beginner-friendly course on digital photography, covering camera settings, composition, and editing techniques.',
      category: 'design',
      difficulty: 'beginner',
      duration: '8 hours',
      materials: [
        { type: 'video', name: 'Camera Settings' },
        { type: 'document', name: 'Composition Tips' }
      ],
      students: 128,
      earnings: '$384',
      rating: 4.7,
      status: 'published',
      lastUpdated: '2024-01-08',
      price: 20,
      icon: '📷'
    },
    {
      id: 4,
      title: 'React Development Course',
      description: 'Build dynamic web applications using React. Learn about components, state management, and hooks.',
      category: 'programming',
      difficulty: 'intermediate',
      duration: '12 hours',
      materials: [
        { type: 'video', name: 'React Components' },
        { type: 'document', name: 'State Management with Redux' }
      ],
      students: 0,
      earnings: '$0',
      rating: 0,
      status: 'draft',
      lastUpdated: '2024-01-05',
      price: 35,
      icon: '⚛️'
    }
  ]

  const [showEditModal, setShowEditModal] = useState<null | typeof courses[0]>(null);
  const [editForm, setEditForm] = useState({
    title: courses.title,
    description: '',
    category: 'design',
    difficulty: 'beginner',
    duration: '',
    price: ''
  })

  const [viewingCourse, setViewingCourse] = useState<null | typeof courses[0]>(null);



  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle course upload logic here
    console.log('Upload form data:', uploadForm)
    setShowUploadModal(false)
    // Reset form
    setUploadForm({
      title: '',
      description: '',
      category: 'design',
      difficulty: 'beginner',
      duration: '',
      price: ''
    })
  }

    const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle course upload logic here
    console.log('Edit form data:', editForm)
    setShowEditModal(false)
    // Reset form
    setEditForm({
      title: e.title,
      description: '',
      category: 'design',
      difficulty: 'beginner',
      duration: '',
      price: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your courses and track your teaching performance</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Upload New Course</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'courses', label: 'My Courses' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'earnings', label: 'Earnings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatsCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors text-center"
                >
                  <Upload size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="font-medium text-blue-600">Upload New Course</p>
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-center"
                  >
                    <BarChart3 size={24} className="mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-gray-700">View Analytics</p>
                </button>
                <button 
                  onClick={() => setActiveTab('earnings')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-center"
                >
                  <DollarSign size={24} className="mx-auto mb-2 text-gray-600" />
                  <p className="font-medium text-gray-700">Check Earnings</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <p className="text-gray-600">{courses.length} courses</p>
            </div>

            <div className="grid gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status === 'published' ? (
                              <>
                                <CheckCircle size={12} className="mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} className="mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>{course.students} students</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign size={16} />
                            <span>{course.earnings} earned</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={16} className="text-yellow-400 fill-current" />
                            <span>{course.rating || 'No ratings'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>Updated {course.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="View course details"
                        title="View course details"
                        onClick={() => setViewingCourse(course)} // Add this
                      >
                        <Eye size={20} />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        aria-label="Edit course"
                        title="Edit course"
                        onClick={() => setShowEditModal(course)} // Add this

                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete course"
                        title="Delete course"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Analytics</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600 text-center py-12">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600 text-center py-12">Earnings dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upload New Course</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Create Game Link</label>
                <input
                  type="text"
                  // value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value="https://app.genially.com/teams/6896ac9f0608d33fb783b038/spaces/6896ac9f0608d33fb783b04a/templates/games-and-challenges?subcategory=games-and-challenges-escape-breakouts"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game Link</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter game link..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your course..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    id="category"
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="design">Design</option>
                    <option value="programming">Programming</option>
                    <option value="business">Business</option>
                    <option value="language">Language</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    value={uploadForm.difficulty}
                    onChange={(e) => setUploadForm({ ...uploadForm, difficulty: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={uploadForm.duration}
                    onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8 hours"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (NFT Points)</label>
                  <input
                    type="number"
                    value={uploadForm.price}
                    onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Materials</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <FileText size={24} className="text-gray-400" />
                    <Video size={24} className="text-gray-400" />
                    <Image size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">Drag and drop your course materials here</p>
                  <p className="text-sm text-gray-500">Supports PDFs, videos, images, and documents</p>
                  <button
                    type="button"
                    className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
              </div> */}

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Edit Course</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game Link</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter game link..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe your course..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    id="category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="design">Design</option>
                    <option value="programming">Programming</option>
                    <option value="business">Business</option>
                    <option value="language">Language</option>
                    <option value="science">Science</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    id="difficulty"
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 8 hours"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (NFT Points)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Materials</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <FileText size={24} className="text-gray-400" />
                    <Video size={24} className="text-gray-400" />
                    <Image size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">Drag and drop your course materials here</p>
                  <p className="text-sm text-gray-500">Supports PDFs, videos, images, and documents</p>
                  <button
                    type="button"
                    className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Confirm Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Details Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Course Details</h2>
                <button
                  onClick={() => setViewingCourse(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Course Header */}
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-3xl">
                  {viewingCourse.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{viewingCourse.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                    viewingCourse.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {viewingCourse.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Course Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {viewingCourse.description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Course Materials</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingCourse.materials?.length > 0 ? (
                        viewingCourse.materials.map((material, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                          >
                            {material.type === 'video' && <Video size={14} className="mr-1" />}
                            {material.type === 'document' && <FileText size={14} className="mr-1" />}
                            {material.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No materials uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                      <p className="capitalize text-gray-700">
                        {viewingCourse.category}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Difficulty</h4>
                      <p className="capitalize text-gray-700">
                        {viewingCourse.difficulty}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                      <p className="text-gray-700">
                        {viewingCourse.duration || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                      <p className="text-lg font-semibold">
                        ${viewingCourse.price} NFT Points
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Users size={16} />
                        <span>{viewingCourse.students} students</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span>{viewingCourse.rating || 'No ratings'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setViewingCourse(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewingCourse(null);
                    setActiveTab('analytics');
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TutorPage