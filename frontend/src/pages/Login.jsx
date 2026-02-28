import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Link,
    Alert,
    InputAdornment,
    IconButton,
    AppBar,
    Toolbar
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, CheckCircle, Dashboard as DashboardIcon, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validators } from '../utils/validators';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    });
    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    // Validate on change
    useEffect(() => {
        const errors = {};
        if (touched.email) {
            const emailValidation = validators.email(formData.email);
            errors.email = emailValidation.error;
        }
        if (touched.password) {
            const passwordValidation = validators.password(formData.password);
            errors.password = passwordValidation.error;
        }
        setFieldErrors(errors);
    }, [formData, touched]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleBlur = (field) => {
        setTouched({
            ...touched,
            [field]: true
        });
    };

    const isFormValid = () => {
        const emailValid = validators.email(formData.email).isValid;
        const passwordValid = validators.password(formData.password).isValid;
        return emailValid && passwordValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Mark all fields as touched
        setTouched({ email: true, password: true });

        if (!isFormValid()) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const getFieldColor = (field) => {
        if (!touched[field]) return '';
        if (fieldErrors[field]) return 'error';
        return 'success';
    };

    const showSuccessIcon = (field) => {
        return touched[field] && !fieldErrors[field] && formData[field];
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Slim top bar (mobile only) */}
            <AppBar position="static" elevation={0} sx={{
                background: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                height: 52,
            }}>
                <Toolbar variant="dense" sx={{ minHeight: 52 }}>
                    <IconButton size="small" onClick={() => navigate('/')} sx={{ color: 'white', mr: 0.5 }}>
                        <ArrowBack sx={{ fontSize: 20 }} />
                    </IconButton>
                    <DashboardIcon sx={{ mr: 1, color: 'white', fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'white', flexGrow: 1 }}>
                        Hari Smriti
                    </Typography>
                    <Button size="small" onClick={() => navigate('/signup')}
                        sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'none', fontSize: '0.82rem' }}>
                        Sign Up
                    </Button>
                </Toolbar>
            </AppBar>
            {/* Center card in remaining space */}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, sm: 4 }, pb: { xs: '80px', sm: 4 }, px: { xs: 2, sm: 0 } }}>
                <Container maxWidth="xs" disableGutters sx={{ px: { xs: 2, sm: 0 } }}>
                    <Paper
                        elevation={10}
                        sx={{
                            p: { xs: 2.5, sm: 5 },
                            borderRadius: { xs: 3, sm: 4 },
                            background: 'rgba(255, 255, 255, 0.97)',
                            backdropFilter: 'blur(10px)',
                            width: '100%',
                            minHeight: { xs: 'auto', sm: 'auto' },
                        }}
                    >
                        <Box sx={{ textAlign: 'center', mb: { xs: 2.5, sm: 4 }, mt: { xs: 0, sm: 0 } }}>
                            <Box sx={{
                                width: { xs: 48, sm: 72 }, height: { xs: 48, sm: 72 },
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mx: 'auto', mb: { xs: 1.5, sm: 2 },
                                boxShadow: '0 4px 14px rgba(102,126,234,0.25)'
                            }}>
                                <LoginIcon sx={{ fontSize: { xs: 24, sm: 36 }, color: 'white' }} />
                            </Box>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{
                                    fontWeight: 800,
                                    fontFamily: "'Poppins', sans-serif",
                                    color: '#0f172a',
                                    fontSize: { xs: '1.25rem', sm: '1.6rem' }
                                }}
                            >
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.82rem', sm: '0.95rem' } }}>
                                Login to track your spiritual practice
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ mb: 2 }}
                                color={getFieldColor('email')}
                                error={touched.email && !!fieldErrors.email}
                                helperText={touched.email && fieldErrors.email}
                                InputProps={{
                                    endAdornment: showSuccessIcon('email') && (
                                        <InputAdornment position="end">
                                            <CheckCircle sx={{ color: '#4caf50' }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                required
                                margin="normal"
                                variant="outlined"
                                sx={{ mb: 3 }}
                                color={getFieldColor('password')}
                                error={touched.password && !!fieldErrors.password}
                                helperText={touched.password && fieldErrors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {showSuccessIcon('password') && (
                                                <CheckCircle sx={{ color: '#4caf50', mr: 1 }} />
                                            )}
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading || !isFormValid()}
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)',
                                    }
                                }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/signup')}
                                    sx={{
                                        fontWeight: 600,
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default Login;
