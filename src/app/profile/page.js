'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useToast } from '@/app/context/ToastContext';

function ProfilePageContent() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    favoriteExercise: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        favoriteExercise: userProfile.favoriteExercise || '',
      });
    }
  }, [userProfile]);

  const handlePhotoUploaded = async (photoURL) => {
    try {
      await updateUserProfile({ photoURL });
      showToast('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error updating photo:', error);
      showToast('Failed to update profile photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUserProfile(formData);
      showToast('Profile updated successfully!');
      router.push('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <button
              onClick={() => router.push('/home')}
              className="text-sm text-primary-color hover:underline"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <ProfilePhotoUpload
              currentPhotoURL={userProfile.photoURL}
              onPhotoUploaded={handlePhotoUploaded}
              userId={user.uid}
            />

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="input-underline"
                placeholder="Enter your display name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userProfile.email || ''}
                disabled
                className="input-underline opacity-60 cursor-not-allowed"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-color focus:ring-1 focus:ring-primary-color outline-none transition-all resize-none"
                placeholder="Tell us about yourself..."
                maxLength={200}
              />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>
                {formData.bio.length}/200
              </p>
            </div>

            {/* Favorite Exercise */}
            <div>
              <label
                htmlFor="favoriteExercise"
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Favorite Exercise
              </label>
              <input
                type="text"
                id="favoriteExercise"
                name="favoriteExercise"
                value={formData.favoriteExercise}
                onChange={handleChange}
                className="input-underline"
                placeholder="e.g., Deadlift, Running, Yoga"
              />
            </div>

            {/* Subscription Status */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Subscription Status</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Current plan: <span className="font-semibold capitalize">{userProfile.subscriptionTier || 'free'}</span>
                  </p>
                </div>
                {userProfile.subscriptionTier === 'free' && (
                  <button
                    type="button"
                    onClick={() => router.push('/settings')}
                    className="text-sm text-primary-color hover:underline font-medium"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex-1 py-3 px-6 rounded-full font-semibold transition-all text-primary-color hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}
