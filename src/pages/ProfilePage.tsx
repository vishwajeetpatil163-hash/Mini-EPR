import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateSession, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SALES':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'WAREHOUSE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACCOUNTS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Frontend pre-validation
    if (!currentPassword) {
      setErrorMsg('Current password is required to confirm profile updates.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setErrorMsg('New password must be at least 8 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirm password do not match.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await api.updateProfile({
        name,
        email,
        currentPassword,
        newPassword: newPassword ? newPassword : undefined,
        confirmPassword: confirmPassword ? confirmPassword : undefined,
      });

      setSuccessMsg(res.message || 'Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (res.emailChanged) {
        setSuccessMsg(
          'Email address changed successfully! Signing you out to re-authenticate with your new credentials...'
        );
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        updateSession(res.user, res.token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <KeyRound className="h-6 w-6 text-blue-600" />
            <span>My Account & Security</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your user details, email address, and account password
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
              user?.role
            )}`}
          >
            <Shield className="h-3.5 w-3.5 mr-1" />
            <span>Role: {user?.role || 'User'}</span>
          </span>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3 shadow-sm animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Update Failed</p>
            <p className="mt-0.5 text-xs text-red-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="mt-0.5 text-xs text-emerald-700">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
            <div className="relative inline-block mx-auto mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg ring-4 ring-blue-50">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" title="Active Session"></span>
            </div>

            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium text-gray-400">User ID:</span>
                <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium text-gray-400">Assigned Role:</span>
                <span className="font-semibold text-gray-900">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium text-gray-400">Auth Method:</span>
                <span className="text-gray-700 flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span>JWT Session</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 rounded-xl border border-blue-100 p-4 text-xs text-blue-900 space-y-2">
            <div className="font-semibold flex items-center space-x-1 text-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Security Note</span>
            </div>
            <p className="text-blue-700/90 leading-relaxed">
              Your current password is required for any profile change to ensure authorized access. Changing your email address will automatically log you out for re-authentication.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Editable Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <span>Personal Information</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your display name and email address used for portal login
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rajesh@wholesale.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Password Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Leave new password fields blank if you only want to update your name or email address
              </p>
            </div>

            <div className="space-y-4">
              {/* New Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Password Verification */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Enter your existing password to verify ownership before saving any changes.
                </p>
                <div className="relative max-w-sm">
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setName(user?.name || '');
                setEmail(user?.email || '');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Account Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
