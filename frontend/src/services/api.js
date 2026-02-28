import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    getMentors: () => api.get('/auth/mentors'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Sadhna API
export const sadhnaAPI = {
    createOrUpdate: (data) => api.post('/sadhna', data),
    getMyEntries: (params) => api.get('/sadhna/my-entries', { params }),
    getDevoteesEntries: (params) => api.get('/sadhna/devotees-entries', { params }),
    getWeeklyWinner: () => api.get('/sadhna/weekly-winner'),
    getMonthlyWinner: (params) => api.get('/sadhna/monthly-winner', { params }),
    getDevoteeHistory: (userId) => api.get(`/sadhna/devotee-history/${userId}`),
    deleteEntry: (id) => api.delete(`/sadhna/${id}`),
    getMissingSubmissions: (params) => api.get('/sadhna/missing-submissions', { params }),
    getWeeklyAttendance: (params) => api.get('/sadhna/weekly-attendance', { params }),
    getMonthlyAttendance: (params) => api.get('/sadhna/monthly-attendance', { params }),
    // Peer-view (devotee only)
    getPeerDevotees: () => api.get('/sadhna/peer-devotees'),
    getPeerDevoteesEntries: (params) => api.get('/sadhna/peer-entries', { params }),
    getPeerDevoteeHistory: (userId) => api.get(`/sadhna/peer-history/${userId}`),
};

export default api;
