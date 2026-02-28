import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar.jsx';

// Pages
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SadhnaEntry from './pages/SadhnaEntry.jsx';
import DevoteesList from './pages/DevoteesList.jsx';
import WeeklyWinner from './pages/WeeklyWinner.jsx';
import Attendance from './pages/Attendance.jsx';
import Welcome from './pages/Welcome.jsx';
import Profile from './pages/Profile.jsx';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#667eea',
        },
        secondary: {
            main: '#764ba2',
        },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
    },
    shape: {
        borderRadius: 8,
    },
});

// Protected Route Component
const ProtectedRoute = ({ children, mentorOnly = false }) => {
    const { isAuthenticated, isMentor, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (mentorOnly && !isMentor) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {isAuthenticated && <Navbar />}
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/sadhna-entry"
                    element={
                        <ProtectedRoute>
                            <SadhnaEntry />
                        </ProtectedRoute>
                    }
                />

                {/* Devotees / Group View - accessible to all authenticated users */}
                <Route
                    path="/devotees"
                    element={
                        <ProtectedRoute>
                            <DevoteesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/weekly-winner"
                    element={
                        <ProtectedRoute mentorOnly={true}>
                            <WeeklyWinner />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute mentorOnly={true}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                {/* Welcome Page - shows to unauthenticated users, redirects logged-in users to dashboard */}
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Welcome />
                        </PublicRoute>
                    }
                />

                {/* Catch-all: redirect to home page */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
