import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { ExemptionsDisplay } from '../components/ExemptionsDisplay';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  ssn: string;
  dob: string;
  phone?: string;
  address?: string;
  mfaEnabled: boolean;
  complianceStatus: string;
}

export const Profile = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await api.get(`/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
      setFormData({
        phone: response.data.phone || '',
        address: response.data.address || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response = await api.put(`/users/${user.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {profile && (
            <div className="space-y-6">
              {/* Read-Only Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">{profile.fullName}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">SSN</p>
                  <p className="text-lg font-medium text-gray-900">{profile.ssn}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(profile.dob).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Compliance Status */}
              <div
                className={`rounded-lg p-4 ${
                  profile.complianceStatus === 'Eligible'
                    ? 'bg-green-50 border border-green-200'
                    : profile.complianceStatus === 'Ineligible'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">Compliance Status</p>
                <p
                  className={`text-lg font-bold ${
                    profile.complianceStatus === 'Eligible'
                      ? 'text-green-700'
                      : profile.complianceStatus === 'Ineligible'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}
                >
                  {profile.complianceStatus}
                </p>
                {profile.complianceStatus === 'Pending Review' && (
                  <p className="text-sm text-yellow-600 mt-2">
                    Complete your profile to determine eligibility.
                  </p>
                )}
              </div>

              {/* Exemptions Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Exemption Eligibility</h2>
                <ExemptionsDisplay userId={user?.id} token={token} />
              </div>

              {/* Editable Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number {!profile.phone && '(required for eligibility)'}
                  </label>
                  {isEditing ? (
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1-555-123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profile.phone || <span className="text-gray-500">Not provided</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address {!profile.address && '(required for eligibility)'}
                  </label>
                  {isEditing ? (
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St, City, State 12345"
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {profile.address || <span className="text-gray-500">Not provided</span>}
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.address.length}/500 characters
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            phone: profile.phone || '',
                            address: profile.address || '',
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>

              {/* MFA Status */}
              <div className="bg-blue-50 rounded-lg p-4 mt-8">
                <p className="text-sm text-gray-600 mb-1">Two-Factor Authentication</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile.mfaEnabled ? (
                    <span className="text-green-600">✓ Enabled</span>
                  ) : (
                    <span className="text-orange-600">Not Enabled</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
