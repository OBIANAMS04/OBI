export interface FieldErrors {
  [key: string]: string;
}

export const validators = {
  email: (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 12) return 'Password must be at least 12 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a digit';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain a special character (!@#$%^&*)';
    return null;
  },

  confirmPassword: (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return 'Confirm password is required';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  fullName: (fullName: string): string | null => {
    if (!fullName) return 'Full name is required';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    return null;
  },

  ssn: (ssn: string): string | null => {
    if (!ssn) return 'SSN is required';
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(ssn)) return 'Invalid SSN format (XXX-XX-XXXX)';
    return null;
  },

  dob: (dob: string): string | null => {
    if (!dob) return 'Date of birth is required';
    const date = new Date(dob);
    if (isNaN(date.getTime())) return 'Invalid date format';

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return `Must be at least 18 years old (currently ${age - 1})`;
    }

    if (age < 18) return `Must be at least 18 years old (currently ${age})`;
    if (age > 120) return 'Please enter a valid date of birth';

    return null;
  },
};

export const validateForm = (formData: {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  ssn?: string;
  dob?: string;
}): FieldErrors => {
  const errors: FieldErrors = {};

  if (formData.email) {
    const emailError = validators.email(formData.email);
    if (emailError) errors.email = emailError;
  }

  if (formData.password) {
    const passwordError = validators.password(formData.password);
    if (passwordError) errors.password = passwordError;
  }

  if (formData.confirmPassword && formData.password) {
    const confirmError = validators.confirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;
  }

  if (formData.fullName) {
    const nameError = validators.fullName(formData.fullName);
    if (nameError) errors.fullName = nameError;
  }

  if (formData.ssn) {
    const ssnError = validators.ssn(formData.ssn);
    if (ssnError) errors.ssn = ssnError;
  }

  if (formData.dob) {
    const dobError = validators.dob(formData.dob);
    if (dobError) errors.dob = dobError;
  }

  return errors;
};

export const formatSSN = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
};
