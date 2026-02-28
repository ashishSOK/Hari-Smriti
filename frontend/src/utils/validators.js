// Validation utility functions

export const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return { isValid: false, error: 'Email is required' };
        if (!emailRegex.test(value)) return { isValid: false, error: 'Invalid email format' };
        return { isValid: true, error: '' };
    },

    password: (value, minLength = 6) => {
        if (!value) return { isValid: false, error: 'Password is required' };
        if (value.length < minLength) return { isValid: false, error: `Password must be at least ${minLength} characters` };
        return { isValid: true, error: '' };
    },

    name: (value) => {
        if (!value) return { isValid: false, error: 'Name is required' };
        if (value.trim().length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
        if (!/^[a-zA-Z\s]+$/.test(value)) return { isValid: false, error: 'Name can only contain letters and spaces' };
        return { isValid: true, error: '' };
    },

    phone: (value) => {
        if (!value) return { isValid: false, error: 'Phone number is required' };
        if (!value.startsWith('+')) return { isValid: false, error: 'Phone must start with country code (e.g., +91)' };
        const digitsOnly = value.slice(1).replace(/\s/g, '');
        if (!/^\d{10,15}$/.test(digitsOnly)) return { isValid: false, error: 'Phone must have 10-15 digits after country code' };
        return { isValid: true, error: '' };
    },

    number: (value, min = 0, max = Infinity, fieldName = 'Value') => {
        if (value === '' || value === null || value === undefined) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        const num = parseFloat(value);
        if (isNaN(num)) return { isValid: false, error: `${fieldName} must be a number` };
        if (num < min) return { isValid: false, error: `${fieldName} must be at least ${min}` };
        if (num > max) return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
        return { isValid: true, error: '' };
    },

    required: (value, fieldName = 'This field') => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        return { isValid: true, error: '' };
    },

    time: (value) => {
        if (!value) return { isValid: false, error: 'Time is required' };
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
            return { isValid: false, error: 'Invalid time format (HH:MM)' };
        }
        return { isValid: true, error: '' };
    }
};

// Get password strength
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#f44336' };
    if (strength <= 3) return { strength, label: 'Fair', color: '#ff9800' };
    if (strength <= 4) return { strength, label: 'Good', color: '#2196f3' };
    return { strength, label: 'Strong', color: '#4caf50' };
};
