import React, { useState, useEffect } from 'react';
import {
    Box, Container, Paper, Typography, TextField, Button,
    Avatar, Chip, Alert, InputAdornment, Divider, FormControl,
    InputLabel, Select, MenuItem
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    CheckCircle,
    Phone as PhoneIcon,
    Email as EmailIcon,
    School as SchoolIcon,
    ManageAccounts as ManageIcon,
    GroupAdd as GroupAddIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
    const { user, login } = useAuth();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        devoteeType: user?.devoteeType || 'full_time_service'
    });

    const [selectedMentors, setSelectedMentors] = useState(user?.mentorId || []);

    const [availableMentors, setAvailableMentors] = useState([]);
    const [fetchingMentors, setFetchingMentors] = useState(false);

    useEffect(() => {
        // Fetch list of mentors for devotees
        if (user?.role === 'devotee') {
            const fetchMentorsList = async () => {
                try {
                    setFetchingMentors(true);
                    const res = await authAPI.getMentors();
                    setAvailableMentors(res.data || []);
                } catch (err) {
                    console.error("Failed to load mentors", err);
                } finally {
                    setFetchingMentors(false);
                }
            };
            fetchMentorsList();
        }
    }, [user?.role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const payload = { ...formData };
            if (user?.role === 'devotee') {
                payload.mentorIds = selectedMentors;
            }
            const res = await authAPI.updateProfile(payload);
            // Persist updated user to localStorage
            const current = JSON.parse(localStorage.getItem('user') || '{}');
            const updated = { ...current, ...res.data };
            localStorage.setItem('user', JSON.stringify(updated));
            // Force re-render by refreshing the page — simplest reliable approach
            // (AuthContext reads from localStorage on mount)
            setSuccess('Profile updated! Reloading...');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            devoteeType: user?.devoteeType || 'full_time_service'
        });
        setSelectedMentors(user?.mentorId || []);
        setEditing(false);
        setError('');
        setSuccess('');
    };

    const roleLabel = user?.role === 'mentor' ? 'Mentor' : 'Devotee';
    const typeLabel = user?.devoteeType === 'student' ? 'Student' : 'Full Time Service';
    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleMentorChange = (e) => {
        const newMentorId = e.target.value;
        if (newMentorId && !selectedMentors.includes(newMentorId)) {
            setSelectedMentors([...selectedMentors, newMentorId]);
        }
    };

    const handleRemoveMentor = (mentorIdToRemove) => {
        setSelectedMentors(selectedMentors.filter(id => id !== mentorIdToRemove));
    };

    // Get current mentor names by matching IDs
    const displayedMentorIds = editing ? selectedMentors : (user?.mentorId || []);
    const currentMentors = user?.role === 'devotee' && displayedMentorIds.length > 0
        ? displayedMentorIds.map(id => {
            const m = availableMentors.find(mentor => mentor._id === id);
            return { id, name: m ? m.name : 'Unknown Mentor' };
        })
        : [];

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pt: { xs: 0, sm: 4 }, pb: { xs: '90px', sm: 4 } }}>
            <Container maxWidth="sm" sx={{ px: { xs: 0, sm: 3 } }}>
                <Paper sx={{ borderRadius: { xs: 0, sm: 4 }, overflow: 'hidden', boxShadow: { xs: 'none', sm: '0 4px 20px rgba(0,0,0,0.1)' }, minHeight: { xs: '100vh', sm: 'auto' } }}>

                    {/* Header */}
                    <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 3, pt: 4, pb: 5, textAlign: 'center' }}>
                        <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.25)', color: 'white', border: '3px solid rgba(255,255,255,0.5)', mx: 'auto', mb: 2 }}>
                            {initials}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', fontFamily: "'Poppins', sans-serif" }}>
                            {user?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
                            <Chip label={roleLabel} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: '0.75rem' }} />
                            {user?.role === 'devotee' && (
                                <Chip
                                    icon={user?.devoteeType === 'student' ? <SchoolIcon sx={{ fontSize: '14px !important', color: 'white !important' }} /> : undefined}
                                    label={typeLabel}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* Card body */}
                    <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3, mt: -2, bgcolor: 'white', borderRadius: { xs: 0, sm: '0 0 16px 16px' } }}>

                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {/* Read-only info rows */}
                        {!editing && (
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <PersonIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Name</Typography>
                                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{user?.name}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <EmailIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Email</Typography>
                                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{user?.email}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <PhoneIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Phone</Typography>
                                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{user?.phone}</Typography>
                                        </Box>
                                    </Box>

                                    {user?.role === 'devotee' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                            <ManageIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Devotee Type</Typography>
                                                <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{typeLabel}</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Existing Mentors Display */}
                                    {user?.role === 'devotee' && (
                                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <GroupAddIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Your Mentors</Typography>
                                            </Box>
                                            {currentMentors.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                    {currentMentors.map((m, idx) => (
                                                        <Chip
                                                            key={m.id || idx}
                                                            label={m.name}
                                                            size="small"
                                                            onDelete={editing ? () => handleRemoveMentor(m.id) : undefined}
                                                            sx={{ fontWeight: 500, bgcolor: 'white', border: '1px solid #cbd5e1' }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', ml: 4 }}>No mentors assigned yet.</Typography>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ mb: 2.5 }} />

                                <Button fullWidth variant="contained" startIcon={<EditIcon />}
                                    onClick={() => setEditing(true)}
                                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600, textTransform: 'none', borderRadius: 2, py: 1.2 }}>
                                    Edit Profile
                                </Button>
                            </>
                        )}

                        {/* Edit form */}
                        {editing && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth label="Full Name" name="name"
                                    value={formData.name} onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                                />
                                <TextField
                                    fullWidth label="Phone" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    placeholder="+919876543210"
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                                />

                                {/* Email is read-only */}
                                <TextField fullWidth label="Email (cannot change)" value={user?.email} disabled
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#cbd5e1', fontSize: 20 }} /></InputAdornment> }}
                                />

                                {user?.role === 'devotee' && (
                                    <>
                                        <FormControl fullWidth>
                                            <InputLabel>Devotee Type</InputLabel>
                                            <Select name="devoteeType" value={formData.devoteeType} onChange={handleChange} label="Devotee Type">
                                                <MenuItem value="full_time_service">Full Time Service</MenuItem>
                                                <MenuItem value="student">Student</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {/* Existing Mentors Display in Edit Mode */}
                                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <GroupAddIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Selected Mentors (click X to remove)</Typography>
                                            </Box>
                                            {currentMentors.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                    {currentMentors.map((m, idx) => (
                                                        <Chip
                                                            key={m.id || idx}
                                                            label={m.name}
                                                            size="small"
                                                            onDelete={() => handleRemoveMentor(m.id)}
                                                            sx={{ fontWeight: 500, bgcolor: 'white', border: '1px solid #cbd5e1' }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', ml: 4 }}>No mentors assigned yet.</Typography>
                                            )}
                                        </Box>

                                        {/* Add Mentor Dropdown */}
                                        <FormControl fullWidth sx={{ mt: 1 }}>
                                            <InputLabel>Add a New Mentor</InputLabel>
                                            <Select
                                                value=""
                                                onChange={handleMentorChange}
                                                label="Add a New Mentor"
                                                disabled={fetchingMentors}
                                            >
                                                <MenuItem value=""><em>-- Select a Mentor to Add --</em></MenuItem>
                                                {availableMentors
                                                    // Filter out mentors the user already has
                                                    .filter(m => !selectedMentors.includes(m._id))
                                                    .map(mentor => (
                                                        <MenuItem key={mentor._id} value={mentor._id}>
                                                            {mentor.name} {mentor.email ? `(${mentor.email})` : ''}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            <Typography variant="caption" sx={{ color: '#64748b', mt: 1, ml: 1 }}>
                                                Select a mentor from the list and click Save to add them to your account.
                                            </Typography>
                                        </FormControl>
                                    </>
                                )}

                                <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                                    <Button fullWidth variant="outlined" onClick={handleCancel}
                                        sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 2, py: 1.2, color: '#64748b', borderColor: '#e2e8f0' }}>
                                        Cancel
                                    </Button>
                                    <Button fullWidth variant="contained" startIcon={<SaveIcon />}
                                        onClick={handleSave} disabled={loading}
                                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontWeight: 600, textTransform: 'none', borderRadius: 2, py: 1.2 }}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Profile;
