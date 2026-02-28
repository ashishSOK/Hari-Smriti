import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    Divider,
    Grid
} from '@mui/material';
import { Send as SendIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { sadhnaAPI, whatsappAPI } from '../services/api';
import { format } from 'date-fns';

const WhatsAppMessaging = () => {
    const [missingDevotees, setMissingDevotees] = useState([]);
    const [selectedDevotees, setSelectedDevotees] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        fetchMissingSubmissions();
    }, [selectedDate]);

    useEffect(() => {
        // Set default message template
        setMessage(`Hare Krishna {name},\n\nThis is a gentle reminder to submit your Sadhna report for ${format(new Date(selectedDate), 'dd MMM yyyy')}. Please fill in your spiritual practice details at your earliest convenience.\n\nYour servant`);
    }, [selectedDate]);

    const fetchMissingSubmissions = async () => {
        try {
            setLoading(true);
            const response = await sadhnaAPI.getMissingSubmissions({ date: selectedDate });
            setMissingDevotees(response.data.missingDevotees || []);
            setSelectedDevotees(response.data.missingDevotees?.map(d => d._id) || []);
        } catch (error) {
            console.error('Failed to fetch missing submissions:', error);
            setError('Failed to load devotees list');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDevotee = (devoteeId) => {
        setSelectedDevotees(prev =>
            prev.includes(devoteeId)
                ? prev.filter(id => id !== devoteeId)
                : [...prev, devoteeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDevotees.length === missingDevotees.length) {
            setSelectedDevotees([]);
        } else {
            setSelectedDevotees(missingDevotees.map(d => d._id));
        }
    };

    const handleSendMessages = async () => {
        if (selectedDevotees.length === 0) {
            setError('Please select at least one devotee');
            return;
        }

        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        try {
            setSending(true);
            setError('');
            setSuccess('');

            const devotees = missingDevotees.filter(d => selectedDevotees.includes(d._id));

            const response = await whatsappAPI.sendReminder({
                devotees,
                customMessage: message
            });

            setSuccess(`✅ Messages sent successfully! (${response.data.successCount}/${response.data.totalSent})`);

            // Refresh the list
            setTimeout(() => {
                fetchMissingSubmissions();
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send messages. Please check your Twilio configuration.');
        } finally {
            setSending(false);
        }
    };

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        fontFamily: "'Poppins', sans-serif",
                        color: '#333',
                        mb: 3
                    }}
                >
                    💬 WhatsApp Messaging
                </Typography>

                <Grid container spacing={3}>
                    {/* Left Panel - Devotees List */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Missing Submissions
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchMissingSubmissions}
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                            </Box>

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    fontSize: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    marginBottom: '16px',
                                    width: '100%'
                                }}
                            />

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress size={30} />
                                </Box>
                            ) : missingDevotees.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        🎉 All devotees have submitted!
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Button
                                        size="small"
                                        onClick={handleSelectAll}
                                        sx={{ mb: 2 }}
                                    >
                                        {selectedDevotees.length === missingDevotees.length ? 'Deselect All' : 'Select All'}
                                    </Button>

                                    <List>
                                        {missingDevotees.map((devotee, index) => (
                                            <React.Fragment key={devotee._id}>
                                                {index > 0 && <Divider />}
                                                <ListItem
                                                    dense
                                                    button
                                                    onClick={() => handleToggleDevotee(devotee._id)}
                                                >
                                                    <Checkbox
                                                        edge="start"
                                                        checked={selectedDevotees.includes(devotee._id)}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                    <ListItemText
                                                        primary={devotee.name}
                                                        secondary={devotee.phone}
                                                    />
                                                </ListItem>
                                            </React.Fragment>
                                        ))}
                                    </List>

                                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                                        Selected: {selectedDevotees.length} / {missingDevotees.length}
                                    </Typography>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Panel - Message Composer */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Compose Message
                            </Typography>

                            {success && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {success}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Alert severity="info" sx={{ mb: 2 }}>
                                💡 Use {'{name}'} in your message to personalize it for each devotee
                            </Alert>

                            <TextField
                                fullWidth
                                multiline
                                rows={12}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                variant="outlined"
                                sx={{ mb: 3 }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<SendIcon />}
                                onClick={handleSendMessages}
                                disabled={sending || selectedDevotees.length === 0}
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(37, 211, 102, 0.6)',
                                    }
                                }}
                            >
                                {sending ? 'Sending...' : `Send to ${selectedDevotees.length} Devotee(s)`}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default WhatsAppMessaging;
