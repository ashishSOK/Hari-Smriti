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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    AppBar,
    Toolbar,
    Chip
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAdd as SignupIcon,
    CheckCircle,
    Dashboard as DashboardIcon,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { validators, getPasswordStrength } from '../utils/validators';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'mentor',
        mentorId: [],
        devoteeType: 'full_time_service'
    });
    const [mentors, setMentors] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        fetchMentors();
    }, []);

    // Validate on change
    useEffect(() => {
        const errors = {};
        if (touched.name) {
            errors.name = validators.name(formData.name).error;
        }
        if (touched.email) {
            errors.email = validators.email(formData.email).error;
        }
        if (touched.phone) {
            errors.phone = validators.phone(formData.phone).error;
        }
        if (touched.password) {
            errors.password = validators.password(formData.password).error;
        }
        if (touched.mentorId && formData.role === 'devotee') {
            errors.mentorId = formData.mentorId.length === 0 ? 'Please select at least one mentor' : null;
        }
        setFieldErrors(errors);
    }, [formData, touched]);

    const fetchMentors = async () => {
        try {
            const response = await authAPI.getMentors();
            setMentors(response.data);
        } catch (error) {
            console.error('Failed to fetch mentors:', error);
        }
    };

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
        const nameValid = validators.name(formData.name).isValid;
        const emailValid = validators.email(formData.email).isValid;
        const phoneValid = validators.phone(formData.phone).isValid;
        const passwordValid = validators.password(formData.password).isValid;
        const mentorValid = formData.role === 'mentor' || formData.mentorId.length > 0;
        return nameValid && emailValid && phoneValid && passwordValid && mentorValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true,
            mentorId: true
        });

        if (!isFormValid()) {
            setError('Please fix the errors above');
            return;
        }

        setLoading(true);

        const result = await register(formData);

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

    const passwordStrength = getPasswordStrength(formData.password);

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
                    <Button size="small" onClick={() => navigate('/login')}
                        sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, textTransform: 'none', fontSize: '0.82rem' }}>
                        Login
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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: { xs: 2.5, sm: 3 } }}>
                            <Box sx={{
                                width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 },
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(102,126,234,0.25)',
                                mr: 2, flexShrink: 0
                            }}>
                                <SignupIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
                            </Box>
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: '#0f172a', lineHeight: 1.2, fontSize: { xs: '1.2rem', sm: '1.25rem' } }}>
                                    Join Hari Smriti
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                                    Start tracking your spiritual growth
                                </Typography>
                            </Box>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={() => handleBlur('name')}
                                required
                                sx={{ mb: 2 }}
                                variant="outlined"
                                color={getFieldColor('name')}
                                error={touched.name && !!fieldErrors.name}
                                helperText={touched.name && fieldErrors.name}
                                InputProps={{
                                    endAdornment: showSuccessIcon('name') && (
                                        <InputAdornment position="end">
                                            <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                required
                                sx={{ mb: 2 }}
                                variant="outlined"
                                color={getFieldColor('email')}
                                error={touched.email && !!fieldErrors.email}
                                helperText={touched.email && fieldErrors.email}
                                InputProps={{
                                    endAdornment: showSuccessIcon('email') && (
                                        <InputAdornment position="end">
                                            <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Phone (with country code)"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={() => handleBlur('phone')}
                                required
                                sx={{ mb: 2 }}
                                variant="outlined"
                                placeholder="+911234567890"
                                color={getFieldColor('phone')}
                                error={touched.phone && !!fieldErrors.phone}
                                helperText={touched.phone ? fieldErrors.phone : "e.g., +919876543210"}
                                InputProps={{
                                    endAdornment: showSuccessIcon('phone') && (
                                        <InputAdornment position="end">
                                            <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <TextField
                                fullWidth
                                size="small"
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                required
                                sx={{ mb: 1 }}
                                variant="outlined"
                                color={getFieldColor('password')}
                                error={touched.password && !!fieldErrors.password}
                                helperText={touched.password && fieldErrors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {showSuccessIcon('password') && (
                                                <CheckCircle sx={{ color: '#4caf50', mr: 1, fontSize: 20 }} />
                                            )}
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <Box sx={{ mb: 2, px: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(passwordStrength.strength / 5) * 100}
                                            sx={{
                                                flex: 1,
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: '#e0e0e0',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: passwordStrength.color,
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: passwordStrength.color,
                                                fontWeight: 600,
                                                minWidth: 50,
                                                fontSize: '0.7rem'
                                            }}
                                        >
                                            {passwordStrength.label}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <FormControl fullWidth size="small" sx={{ mb: formData.role === 'devotee' ? 2 : 3 }}>
                                <InputLabel>I am a</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    label="I am a"
                                    required
                                >
                                    <MenuItem value="devotee">Devotee</MenuItem>
                                    <MenuItem value="mentor">Mentor</MenuItem>
                                </Select>
                            </FormControl>

                            {formData.role === 'devotee' && (
                                <>
                                    <FormControl
                                        fullWidth
                                        size="small"
                                        sx={{ mb: 2 }}
                                        error={touched.mentorId && !!fieldErrors.mentorId}
                                    >
                                        <InputLabel>Select Mentor(s)</InputLabel>
                                        <Select
                                            name="mentorId"
                                            multiple
                                            value={formData.mentorId}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('mentorId')}
                                            label="Select Mentor(s)"
                                            required={formData.role === 'devotee'}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((id) => {
                                                        const mentor = mentors.find(m => m._id === id);
                                                        return (
                                                            <Chip
                                                                key={id}
                                                                label={mentor ? mentor.name : id}
                                                                size="small"
                                                                sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 600, fontSize: '0.72rem' }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            )}
                                        >
                                            {mentors.map((mentor) => (
                                                <MenuItem key={mentor._id} value={mentor._id}>
                                                    {mentor.name} ({mentor.email})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {touched.mentorId && fieldErrors.mentorId && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                {fieldErrors.mentorId}
                                            </Typography>
                                        )}
                                    </FormControl>

                                    <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                                        <InputLabel>Devotee Type</InputLabel>
                                        <Select
                                            name="devoteeType"
                                            value={formData.devoteeType}
                                            onChange={handleChange}
                                            label="Devotee Type"
                                        >
                                            <MenuItem value="full_time_service">Full Time Service</MenuItem>
                                            <MenuItem value="student">Student</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading || !isFormValid()}
                                sx={{
                                    py: 1.2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)',
                                    }
                                }}
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        fontWeight: 600,
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default Signup;
