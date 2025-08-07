'use client'

import { useState } from 'react'
import { User, Wallet, Copy, ExternalLink, Edit3, Save, X, Shield, Calendar, Mail, Trophy, Star } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { formatSuiAddress, getSuiExplorerUrl, copyToClipboard, formatTimestamp, getTimeAgo } from '@/lib/utils/wallet'

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const handleCopyAddress = async () => {
    if (user?.address) {
      try {
        await copyToClipboard(user.address)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy address:', error)
      }
    }
  }

  const handleViewOnExplorer = () => {
    if (user?.address) {
      const explorerUrl = getSuiExplorerUrl(user.address)
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSaveProfile = () => {
    updateUser({
      name: editForm.name,
      email: editForm.email
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    })
    setIsEditing(false)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Logged In</h2>
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Basic Info */}
          <div className="lg:col-span-1">
            <div className="text-center">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  {user.loginType === 'zklogin' && <Shield className="text-green-500" size={16} />}
                  <span className="text-sm font-medium text-gray-600">
                    {user.loginType === 'zklogin' ? 'zkLogin User' : 'Wallet User'}
                  </span>
                </div>
                {user.admin && (
                  <div className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star size={12} />
                    <span>Admin</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    id="name-input"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="text-gray-400" size={16} />
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                )}
              </div>

              {user.email && (
                <div>
                  <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      id="email-input"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      disabled={user.loginType === 'zklogin'} // Disable for zkLogin users
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="text-gray-400" size={16} />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NFT Points</label>
                <div className="flex items-center space-x-2">
                  <Trophy className="text-yellow-500" size={16} />
                  <span className="text-gray-900 font-semibold">{user.nftPoints}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-400" size={16} />
                  <span className="text-gray-900">{formatTimestamp(user.createdAt)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400" size={16} />
                <span className="text-gray-900">{getTimeAgo(user.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Wallet Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sui Wallet Address</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-800 break-all">
                  {user.address}
                </code>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    title="Copy address"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleViewOnExplorer}
                    className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    title="View on Sui Explorer"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              {showCopied && (
                <p className="text-green-600 text-xs mt-2">Address copied to clipboard!</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Formatted Address</label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="font-mono text-gray-800">{formatSuiAddress(user.address)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">NFT Points</p>
              <p className="text-2xl font-bold">{user.nftPoints}</p>
            </div>
            <Trophy size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Account Type</p>
              <p className="text-lg font-semibold capitalize">{user.loginType}</p>
            </div>
            <Shield size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Status</p>
              <p className="text-lg font-semibold">Active</p>
            </div>
            <User size={32} className="text-green-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage