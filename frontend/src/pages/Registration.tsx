import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { validateForm, formatSSN, FieldErrors } from '../utils/validators';
import { useAuthStore } from '../store/authStore';

export const Registration = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    ssn: '',
    dob: '',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      strength = 'strong';
    } else if (password.length >= 10 && /[A-Z]/.test(password)) {
      strength = 'medium';
    }

    setPasswordStrength(strength);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format SSN as user types
    if (name === 'ssn') {
      processedValue = formatSSN(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(processedValue);
    }

    // Clear field error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        ssn: formData.ssn,
        dob: formData.dob,
      });

      const { user, token } = response.data;
      setAuth(user, token);
      navigate('/profile');
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      if (errorData?.fields) {
        setErrors(errorData.fields);
      } else {
        setApiError(errorData?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !isLoading && passwordStrength === 'strong' && Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join SSS Modernization System</p>
        </div>

        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-600 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-red-600 text-sm mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* SSN */}
          <div>
            <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-1">
              Social Security Number *
            </label>
            <input
              id="ssn"
              type="text"
              name="ssn"
              value={formData.ssn}
              onChange={handleChange}
              placeholder="123-45-6789"
              maxLength={11}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.ssn ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.ssn}
              aria-describedby={errors.ssn ? 'ssn-error' : undefined}
            />
            {errors.ssn && (
              <p id="ssn-error" className="text-red-600 text-sm mt-1">
                {errors.ssn}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              id="dob"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.dob}
              aria-describedby={errors.dob ? 'dob-error' : undefined}
            />
            {errors.dob && (
              <p id="dob-error" className="text-red-600 text-sm mt-1">
                {errors.dob}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 12 characters"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {passwordStrength && (
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'strong'
                        ? 'w-full bg-green-500'
                        : passwordStrength === 'medium'
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-1/3 bg-red-500'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength === 'strong'
                      ? 'text-green-600'
                      : passwordStrength === 'medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {passwordStrength}
                </span>
              </div>
            )}
            <ul className="text-xs text-gray-600 mt-2 list-disc list-inside space-y-1">
              <li className={formData.password.length >= 12 ? 'text-green-600' : ''}>
                ✓ At least 12 characters
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Uppercase letter
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Number
              </li>
              <li className={/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Special character (!@#$%^&*)
              </li>
            </ul>
            {errors.password && (
              <p id="password-error" className="text-red-600 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-red-600 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-lg font-medium text-white transition-colors ${
              isFormValid
                ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;
