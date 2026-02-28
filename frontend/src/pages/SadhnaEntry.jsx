import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    InputAdornment
} from '@mui/material';
import { Save as SaveIcon, CheckCircle, School as SchoolIcon } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sadhnaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { validators } from '../utils/validators';
import { useLocation } from 'react-router-dom';

const BOOKS = [
    'Bhagavad-gītā As It Is',
    'Śrīmad-Bhāgavatam',
    'Śrī Caitanya-caritāmṛta',
    'Nectar of Instruction',
    'Kṛṣṇa, the Supreme Personality of Godhead',
    'The Nectar of Devotion',
    'Śrī Īśopaniṣad',
    'The Science of Self-Realization',
    'Beyond Birth and Death',
    'Bhakti: The Art of Eternal Love',
    'Śrī Brahma-saṁhitā',
    'Civilization and Transcendence',
    'The Journey of Self-Discovery',
    'On the Way to Kṛṣṇa',
    'The Path of Perfection',
    'The Perfection of Yoga',
    'Perfect Questions, Perfect Answers',
    'Rāja-vidyā: The King of Knowledge',
    'A Second Chance',
    'Teachings of Lord Caitanya',
    'Teachings of Lord Kapila',
    'Teachings of Queen Kuntī',
    'Light of the Bhāgavata',
    'Chant and be happy',
    'Śrīla Prabhupāda-līlāmṛta',
    'Rāmāyaṇa',
    'Mahābhārata - Retold by Kṛṣṇa Dharma dasa',
    'Other'
];

const SadhnaEntry = () => {
    const { user } = useAuth();
    const isStudent = user?.devoteeType === 'student';

    const location = useLocation();
    const editData = location.state?.editData;

    const [formData, setFormData] = useState({
        date: editData ? new Date(editData.date) : new Date(),
        wakeUpTime: editData?.wakeUpTime || '',
        sleepTime: editData?.sleepTime || '',
        roundsChanted: editData?.roundsChanted || '',
        bookName: editData?.bookName || 'Śrīmad-Bhāgavatam',
        readingDuration: editData?.readingDuration || '',
        serviceDuration: editData?.serviceDuration || '',
        serviceType: editData?.serviceType || '',
        hearingDuration: editData?.hearingDuration || '',
        studyDuration: editData?.studyDuration || '',
        studyTopic: editData?.studyTopic || ''
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const errors = {};
        if (touched.wakeUpTime) errors.wakeUpTime = validators.time(formData.wakeUpTime).error;
        if (touched.sleepTime) errors.sleepTime = validators.time(formData.sleepTime).error;
        if (touched.roundsChanted) errors.roundsChanted = validators.number(formData.roundsChanted, 0, 64, 'Rounds').error;
        if (touched.readingDuration) errors.readingDuration = validators.number(formData.readingDuration, 0, 600, 'Reading duration').error;
        if (touched.serviceDuration) errors.serviceDuration = validators.number(formData.serviceDuration, 0, 24, 'Service duration').error;
        if (touched.hearingDuration) errors.hearingDuration = validators.number(formData.hearingDuration, 0, 24, 'Hearing duration').error;
        if (isStudent && touched.studyDuration) errors.studyDuration = validators.number(formData.studyDuration, 0, 24, 'Study duration').error;
        setFieldErrors(errors);
    }, [formData, touched, isStudent]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleDateChange = (newDate) => setFormData({ ...formData, date: newDate });
    const handleBlur = (field) => setTouched({ ...touched, [field]: true });

    const isFormValid = () => {
        const wakeUpValid = validators.time(formData.wakeUpTime).isValid;
        const sleepValid = validators.time(formData.sleepTime).isValid;
        const roundsValid = validators.number(formData.roundsChanted, 0, 64).isValid;
        const readingValid = validators.number(formData.readingDuration, 0, 600).isValid;
        const serviceValid = validators.number(formData.serviceDuration, 0, 24).isValid;
        const hearingValid = validators.number(formData.hearingDuration, 0, 24).isValid;
        const studyValid = !isStudent || validators.number(formData.studyDuration, 0, 24).isValid;
        return wakeUpValid && sleepValid && roundsValid && readingValid && serviceValid && hearingValid && studyValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const touchedFields = { wakeUpTime: true, sleepTime: true, roundsChanted: true, readingDuration: true, serviceDuration: true, hearingDuration: true };
        if (isStudent) touchedFields.studyDuration = true;
        setTouched(touchedFields);

        if (!isFormValid()) { setError('Please fix the errors above'); return; }

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                _id: editData?._id,
                date: format(formData.date, 'yyyy-MM-dd'),
                roundsChanted: parseInt(formData.roundsChanted),
                readingDuration: parseFloat(formData.readingDuration),
                serviceDuration: parseFloat(formData.serviceDuration),
                hearingDuration: parseFloat(formData.hearingDuration),
                studyDuration: isStudent ? parseFloat(formData.studyDuration || 0) : 0,
                studyTopic: isStudent ? formData.studyTopic : ''
            };
            await sadhnaAPI.createOrUpdate(dataToSubmit);
            setSuccess('Sadhna entry saved successfully! Hare Krishna!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save entry');
        } finally {
            setLoading(false);
        }
    };

    const getFieldColor = (field) => {
        if (!touched[field]) return '';
        return fieldErrors[field] ? 'error' : 'success';
    };
    const showSuccessIcon = (field) => touched[field] && !fieldErrors[field] && formData[field];

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pt: { xs: 0, sm: 4 }, pb: { xs: '90px', sm: 4 } }}>
            <Container maxWidth="md" sx={{ px: { xs: 0, sm: 3 } }}>
                <Paper sx={{ p: { xs: 2, sm: 5 }, borderRadius: { xs: 0, sm: 4 }, boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.1)' }, minHeight: { xs: '100vh', sm: 'auto' } }}>

                    {/* Mobile header */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, mx: -2, mt: -2, mb: 2.5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 2, pt: 2.5, pb: 2 }}>
                        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.15rem', fontFamily: "'Poppins', sans-serif" }}>
                            Daily Sadhna Entry
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', mt: 0.3 }}>
                            Log your spiritual practice for today
                        </Typography>
                    </Box>

                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#333', mb: 3, display: { xs: 'none', sm: 'block' } }}>
                        Daily Sadhna Entry
                    </Typography>

                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={{ xs: 1.5, sm: 3 }}>

                            {/* Date */}
                            <Grid item xs={12}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Date"
                                        value={formData.date}
                                        onChange={handleDateChange}
                                        slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* Wake Up Time */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="Wake up Time" name="wakeUpTime" type="time"
                                    value={formData.wakeUpTime} onChange={handleChange} onBlur={() => handleBlur('wakeUpTime')}
                                    required InputLabelProps={{ shrink: true }}
                                    color={getFieldColor('wakeUpTime')}
                                    error={touched.wakeUpTime && !!fieldErrors.wakeUpTime}
                                    helperText={touched.wakeUpTime && fieldErrors.wakeUpTime}
                                    InputProps={{ endAdornment: showSuccessIcon('wakeUpTime') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Sleep Time */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="Slept at" name="sleepTime" type="time"
                                    value={formData.sleepTime} onChange={handleChange} onBlur={() => handleBlur('sleepTime')}
                                    required InputLabelProps={{ shrink: true }}
                                    color={getFieldColor('sleepTime')}
                                    error={touched.sleepTime && !!fieldErrors.sleepTime}
                                    helperText={touched.sleepTime && fieldErrors.sleepTime}
                                    InputProps={{ endAdornment: showSuccessIcon('sleepTime') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Rounds Chanted */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="No. of Rounds Chanted" name="roundsChanted" type="number"
                                    value={formData.roundsChanted} onChange={handleChange} onBlur={() => handleBlur('roundsChanted')}
                                    required inputProps={{ min: 0, max: 64, step: 1 }}
                                    color={getFieldColor('roundsChanted')}
                                    error={touched.roundsChanted && !!fieldErrors.roundsChanted}
                                    helperText={touched.roundsChanted ? fieldErrors.roundsChanted : 'Maximum 64 rounds'}
                                    InputProps={{ endAdornment: showSuccessIcon('roundsChanted') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Book Name */}
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Name of the book</InputLabel>
                                    <Select name="bookName" value={formData.bookName} onChange={handleChange}
                                        label="Name of the book" required
                                        MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}>
                                        {BOOKS.map(book => <MenuItem key={book} value={book}>{book}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Reading Duration */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="SP Book Reading Duration (minutes)" name="readingDuration" type="number"
                                    value={formData.readingDuration} onChange={handleChange} onBlur={() => handleBlur('readingDuration')}
                                    required inputProps={{ min: 0, max: 600, step: 0.5 }}
                                    color={getFieldColor('readingDuration')}
                                    error={touched.readingDuration && !!fieldErrors.readingDuration}
                                    helperText={touched.readingDuration ? fieldErrors.readingDuration : 'Maximum 600 minutes'}
                                    InputProps={{ endAdornment: showSuccessIcon('readingDuration') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Hearing Duration */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="Hearing Duration (hours)" name="hearingDuration" type="number"
                                    value={formData.hearingDuration} onChange={handleChange} onBlur={() => handleBlur('hearingDuration')}
                                    required inputProps={{ min: 0, max: 24, step: 0.1 }}
                                    color={getFieldColor('hearingDuration')}
                                    error={touched.hearingDuration && !!fieldErrors.hearingDuration}
                                    helperText={touched.hearingDuration ? fieldErrors.hearingDuration : 'Lectures / kirtan (max 24h)'}
                                    InputProps={{ endAdornment: showSuccessIcon('hearingDuration') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Service Duration — all devotees */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="Service Duration (hours)" name="serviceDuration" type="number"
                                    value={formData.serviceDuration} onChange={handleChange} onBlur={() => handleBlur('serviceDuration')}
                                    required inputProps={{ min: 0, max: 24, step: 0.1 }}
                                    color={getFieldColor('serviceDuration')}
                                    error={touched.serviceDuration && !!fieldErrors.serviceDuration}
                                    helperText={touched.serviceDuration ? fieldErrors.serviceDuration : 'Maximum 24 hours'}
                                    InputProps={{ endAdornment: showSuccessIcon('serviceDuration') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                />
                            </Grid>

                            {/* Service Type — all devotees */}
                            <Grid item xs={6}>
                                <TextField fullWidth label="Service type" name="serviceType"
                                    value={formData.serviceType} onChange={handleChange}
                                    placeholder="e.g., Temple cleaning, Book distribution..."
                                />
                            </Grid>

                            {/* Study fields — Students only */}
                            {isStudent && (
                                <Grid item xs={12}>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                                        <Typography sx={{ fontWeight: 700, color: '#0369a1', fontSize: '0.85rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <SchoolIcon sx={{ fontSize: 18 }} /> Study Fields
                                            <Typography component="span" sx={{ fontWeight: 400, fontSize: '0.75rem', color: '#64748b', ml: 0.5 }}>
                                                (10 pts/hr)
                                            </Typography>
                                        </Typography>
                                        <Grid container spacing={1.5}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Study Duration (hours)" name="studyDuration" type="number"
                                                    value={formData.studyDuration} onChange={handleChange} onBlur={() => handleBlur('studyDuration')}
                                                    required inputProps={{ min: 0, max: 24, step: 0.5 }}
                                                    color={getFieldColor('studyDuration')}
                                                    error={touched.studyDuration && !!fieldErrors.studyDuration}
                                                    helperText={touched.studyDuration ? fieldErrors.studyDuration : 'Academic / course study hours'}
                                                    InputProps={{ endAdornment: showSuccessIcon('studyDuration') && <InputAdornment position="end"><CheckCircle sx={{ color: '#4caf50' }} /></InputAdornment> }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Study Topic / Subject" name="studyTopic"
                                                    value={formData.studyTopic} onChange={handleChange}
                                                    placeholder="e.g., Mathematics, Sanskrit, etc."
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            )}

                            {/* Submit */}
                            <Grid item xs={12}>
                                <Button type="submit" fullWidth variant="contained" size="large"
                                    disabled={loading || !isFormValid()}
                                    startIcon={<SaveIcon />}
                                    sx={{
                                        py: 1.5,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', borderRadius: 2,
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                        '&:hover': { boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)' }
                                    }}>
                                    {loading ? 'Saving...' : 'Save Entry'}
                                </Button>
                            </Grid>

                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default SadhnaEntry;
