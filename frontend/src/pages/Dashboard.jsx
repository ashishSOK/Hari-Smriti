import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    TrendingUp as TrendingIcon,
    CalendarToday as CalendarIcon,
    Add as AddIcon,
    WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sadhnaAPI } from '../services/api';
import SadhnaCard from '../components/SadhnaCard';
import { format, subDays } from 'date-fns';

const Dashboard = () => {
    const { user, isMentor } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEntries: 0,
        avgRounds: 0,
        avgScore: 0
    });

    // Deletion state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const response = await sadhnaAPI.getMyEntries({ limit: 10 });
            setEntries(response.data);

            // Calculate stats
            if (response.data.length > 0) {
                const avgRounds = response.data.reduce((sum, e) => sum + e.roundsChanted, 0) / response.data.length;
                const avgScore = response.data.reduce((sum, e) => sum + e.totalScore, 0) / response.data.length;
                setStats({
                    totalEntries: response.data.length,
                    avgRounds: avgRounds.toFixed(1),
                    avgScore: avgScore.toFixed(0)
                });
            }
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await sadhnaAPI.deleteEntry(entryToDelete);
            setDeleteDialogOpen(false);
            setEntryToDelete(null);
            fetchEntries(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    };

    const handleCloseDelete = () => {
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
    };

    const handleShare = (entry) => {
        if (!entry) return;
        let text = `🙏 *Hari Smriti — My Sadhna*\n\n👤 *Name:* ${user?.name}\n\n`;
        const dateStr = format(new Date(entry.date), 'dd MMM yyyy');
        text += `📅 *Date:* ${dateStr}\n`;
        text += `⭐ *Score:* ${Math.round(entry.totalScore)}\n`;
        text += `⏰ *Wake Up:* ${entry.wakeUpTime || 'N/A'}\n`;
        text += `🛏️ *Sleep:* ${entry.sleepTime || 'N/A'}\n`;
        text += `📿 *Rounds:* ${entry.roundsChanted}\n`;
        text += `📖 *Reading:* ${entry.readingDuration} mins\n`;
        if (entry.bookName) text += `📚 *Book:* ${entry.bookName}\n`;
        text += `🎧 *Hearing:* ${entry.hearingDuration} hrs\n`;
        text += `🙏 *Service:* ${entry.serviceDuration} hrs\n`;
        if (entry.serviceType && entry.serviceType !== 'None') {
            text += `🙌 *Service Type:* ${entry.serviceType}\n`;
        }
        if (entry.studyDuration > 0) {
            text += `🎓 *Study:* ${entry.studyDuration} hrs\n`;
            if (entry.studyTopic) text += `   ${entry.studyTopic}\n`;
        }
        text += `\nHare Krishna! 🌸`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        if (entries && entries.length > 0) {
            handleShare(entries[0]);
        } else {
            let text = `🙏 *Hari Smriti — My Sadhna*\n\n👤 *Name:* ${user?.name}\n\nNo recent entries found.\n\nHare Krishna! 🌸`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const handleEditClick = (entry) => {
        navigate('/sadhna-entry', { state: { editData: entry } });
    };

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pt: { xs: 0, sm: 4 }, pb: { xs: '80px', sm: 4 } }}>
            <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
                {/* Welcome Section */}
                <Box sx={{ mb: { xs: 2.5, sm: 4 }, pt: { xs: 2, sm: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box sx={{ width: 4, height: { xs: 24, sm: 32 }, borderRadius: 2, background: 'linear-gradient(180deg,#667eea,#764ba2)', flexShrink: 0 }} />
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                fontFamily: "'Poppins', sans-serif",
                                color: '#1e293b',
                                fontSize: { xs: '1.4rem', sm: '2rem' },
                                letterSpacing: '-0.5px'
                            }}
                        >
                            Hare Krishna, {user?.name}!
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#64748b', ml: { xs: 2, sm: 2.5 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                        {isMentor
                            ? 'Welcome to your mentor dashboard. Track your devotees\' progress and guide them.'
                            : 'Track your spiritual practice and stay consistent on your path.'}
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={{ xs: 1, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
                    <Grid item xs={4} sm={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <CalendarIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 28 } }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '1.1rem' } }}>
                                        Total Entries
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', sm: '3rem' } }}>
                                    {stats.totalEntries}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={4} sm={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
                            }}
                        >
                            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <TrendingIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 28 } }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '1.1rem' } }}>
                                        Avg Rounds
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', sm: '3rem' } }}>
                                    {stats.avgRounds}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={4} sm={4}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
                            }}
                        >
                            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <TrendingIcon sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 28 } }} />
                                    <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '1.1rem' } }}>
                                        Avg Score
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.4rem', sm: '3rem' } }}>
                                    {stats.avgScore}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>



                {/* Recent Entries */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    {/* Recent Entries header */}
                    <Box sx={{ mb: 3 }}>
                        {/* Title row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingIcon sx={{ color: '#4f46e5' }} />
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700, color: '#1e293b', m: 0, fontSize: { xs: '1.1rem', sm: '1.5rem' }, letterSpacing: '-0.5px' }}
                                >
                                    Recent Entries
                                </Typography>
                            </Box>
                            {/* Desktop buttons — inline */}
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5 }}>
                                <Button variant="outlined" startIcon={<WhatsAppIcon />} onClick={shareOnWhatsApp}
                                    sx={{ borderColor: '#25d366', color: '#25d366', fontWeight: 600, textTransform: 'none', borderRadius: 2, fontSize: '0.85rem', '&:hover': { bgcolor: '#25d366', color: 'white', borderColor: '#25d366' } }}>
                                    Share Sadhna
                                </Button>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/sadhna-entry')}
                                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 600, textTransform: 'none', borderRadius: 2, boxShadow: '0 4px 12px rgba(102,126,234,0.3)', '&:hover': { boxShadow: '0 6px 16px rgba(102,126,234,0.5)' } }}>
                                    Add Today's Entry
                                </Button>
                            </Box>
                        </Box>

                        {/* Mobile buttons — premium card style */}
                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1.5 }}>

                            {/* WhatsApp Share card-button */}
                            <Box
                                onClick={shareOnWhatsApp}
                                sx={{
                                    flex: 1,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(145deg, #25d366 0%, #075E54 100%)',
                                    borderRadius: 3,
                                    p: '9px 10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.6,
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(37,211,102,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    '&:active': { transform: 'scale(0.97)', boxShadow: '0 3px 10px rgba(37,211,102,0.4)' },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '-30%', left: '-20%',
                                        width: '80px', height: '80px',
                                        background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                                        borderRadius: '50%'
                                    }
                                }}
                            >
                                <WhatsAppIcon sx={{ fontSize: 26, color: 'white', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
                                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, letterSpacing: 0.2 }}>Share</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 500, lineHeight: 1 }}>via WhatsApp</Typography>
                            </Box>

                            {/* Add Entry card-button */}
                            <Box
                                onClick={() => navigate('/sadhna-entry')}
                                sx={{
                                    flex: 1,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(145deg, #667eea 0%, #4c35b5 100%)',
                                    borderRadius: 3,
                                    p: '9px 10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.6,
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(102,126,234,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    '&:active': { transform: 'scale(0.97)', boxShadow: '0 3px 10px rgba(102,126,234,0.4)' },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '-30%', right: '-20%',
                                        width: '80px', height: '80px',
                                        background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
                                        borderRadius: '50%'
                                    }
                                }}
                            >
                                <AddIcon sx={{ fontSize: 26, color: 'white', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
                                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, letterSpacing: 0.2 }}>Add Entry</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 500, lineHeight: 1 }}>Any day's entry</Typography>
                            </Box>

                        </Box>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : entries.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                            <CalendarIcon sx={{ fontSize: 56, color: '#e2e8f0', mb: 1.5 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#64748b' }}>
                                No entries yet
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                Start your spiritual journey by adding your first daily sadhna entry.
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            {entries.map((entry) => (
                                <SadhnaCard
                                    key={entry._id}
                                    entry={entry}
                                    onDelete={handleDeleteClick}
                                    onEdit={handleEditClick}
                                    onShare={handleShare}
                                />
                            ))}
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDelete}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Delete Sadhna Entry?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#475569' }}>
                        Are you sure you want to delete this spiritual practice entry? This action cannot be undone and will permanently remove it from your history.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleCloseDelete}
                        sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            fontWeight: 600,
                            borderRadius: 2
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default Dashboard;
