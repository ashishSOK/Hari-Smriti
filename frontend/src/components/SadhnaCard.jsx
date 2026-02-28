import React from 'react';
import {
    Card, CardContent, Typography, Grid, Chip, Box, IconButton, Tooltip,
    useTheme, useMediaQuery
} from '@mui/material';
import {
    WbSunny as WakeIcon, Bedtime as SleepIcon, AutoStories as BookIcon,
    Handshake as ServiceIcon, Headphones as HearingIcon,
    EmojiEvents as RoundsIcon, DeleteOutline as DeleteIcon,
    EditOutlined as EditIcon, WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

/* ─────────────────────────────────────────────
   MOBILE card — compact 3-column stat grid
───────────────────────────────────────────── */
const MobileCard = ({ entry, showUserName, onDelete, onEdit, onShare }) => {
    const stats = [
        { emoji: '⏰', label: 'Wake', value: entry.wakeUpTime || 'N/A' },
        { emoji: '🌙', label: 'Sleep', value: entry.sleepTime || 'N/A' },
        { emoji: '📿', label: 'Rounds', value: entry.roundsChanted },
        { emoji: '📖', label: 'Reading', value: `${entry.readingDuration}m` },
        { emoji: '🤝', label: 'Service', value: `${entry.serviceDuration}h` },
        { emoji: '🎧', label: 'Hearing', value: `${entry.hearingDuration}h` },
        ...(entry.studyDuration > 0 ? [{ emoji: '🎓', label: 'Study', value: `${entry.studyDuration}h` }] : []),
    ];

    const score = Math.round(entry.totalScore || 0);
    const scoreColor = score >= 200 ? '#16a34a' : score >= 100 ? '#d97706' : '#dc2626';
    const scoreBg = score >= 200 ? '#f0fdf4' : score >= 100 ? '#fffbeb' : '#fff1f2';

    return (
        <Card sx={{
            mb: 1.5,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(102,126,234,0.1)',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #667eea',
            overflow: 'hidden',
        }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>

                {/* ── Header ── */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.9rem' }}>
                            {format(new Date(entry.date), 'dd MMM yyyy')}
                        </Typography>
                        {showUserName && entry.userId?.name && (
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>· {entry.userId.name}</Typography>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {entry.totalScore && (
                            <Box sx={{
                                px: 1.2, py: 0.3, borderRadius: 1.5,
                                bgcolor: scoreBg, border: `1.5px solid ${scoreColor}20`,
                            }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: scoreColor }}>
                                    ⭐ {score}
                                </Typography>
                            </Box>
                        )}
                        {onShare && (
                            <IconButton size="small" onClick={() => onShare(entry)}
                                sx={{
                                    width: 26, height: 26, color: '#16a34a',
                                    bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' }
                                }}>
                                <WhatsAppIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        )}
                        {onEdit && (
                            <IconButton size="small" onClick={() => onEdit(entry)}
                                sx={{
                                    width: 26, height: 26, color: '#3b82f6',
                                    bgcolor: '#dbeafe', '&:hover': { bgcolor: '#bfdbfe' }
                                }}>
                                <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        )}
                        {onDelete && (
                            <IconButton size="small" onClick={() => onDelete(entry._id)}
                                sx={{
                                    width: 26, height: 26, color: '#ef4444',
                                    bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fca5a5' }
                                }}>
                                <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* ── Book + service pills ── */}
                {(entry.bookName || (entry.serviceType && entry.serviceType !== 'None') || (entry.studyTopic && entry.studyDuration > 0)) && (
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                        {entry.bookName && (
                            <Chip label={`📚 ${entry.bookName}`} size="small"
                                sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600, bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }} />
                        )}
                        {entry.serviceType && entry.serviceType !== 'None' && (
                            <Chip label={`🙌 ${entry.serviceType}`} size="small"
                                sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600, bgcolor: '#faf5ff', color: '#7c3aed', border: '1px solid #ddd6fe' }} />
                        )}
                        {entry.studyDuration > 0 && entry.studyTopic && (
                            <Chip label={`🎓 ${entry.studyTopic}`} size="small"
                                sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }} />
                        )}
                    </Box>
                )}

                {/* ── 3-col stat tiles (uniform indigo-tinted) ── */}
                <Grid container spacing={0.75}>
                    {stats.map(s => (
                        <Grid item xs={4} key={s.label}>
                            <Box sx={{
                                bgcolor: '#f5f3ff',
                                borderRadius: 2,
                                border: '1px solid #e0e7ff',
                                px: 0.75, py: 0.7,
                                textAlign: 'center',
                            }}>
                                <Typography sx={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 600, lineHeight: 1.2 }}>
                                    {s.emoji} {s.label}
                                </Typography>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', mt: 0.15 }}>
                                    {s.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

/* ─────────────────────────────────────────────
   DESKTOP card — original design
───────────────────────────────────────────── */
const DesktopCard = ({ entry, showUserName, onDelete, onEdit, onShare }) => {
    const formatTime = (t) => t || 'N/A';

    return (
        <Card sx={{
            mb: 2, borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                        📅 {format(new Date(entry.date), 'dd MMM yyyy')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {entry.totalScore && (
                            <Chip label={`Score: ${entry.totalScore.toFixed(0)}`} color="primary" sx={{ fontWeight: 600 }} />
                        )}
                        {onShare && (
                            <Tooltip title="Share this entry">
                                <IconButton size="small" onClick={() => onShare(entry)}
                                    sx={{ color: '#16a34a', bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' } }}>
                                    <WhatsAppIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onEdit && (
                            <Tooltip title="Edit this entry">
                                <IconButton size="small" onClick={() => onEdit(entry)}
                                    sx={{ color: '#3b82f6', bgcolor: '#dbeafe', '&:hover': { bgcolor: '#bfdbfe' } }}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onDelete && (
                            <Tooltip title="Delete this entry">
                                <IconButton size="small" onClick={() => onDelete(entry._id)}
                                    sx={{ color: '#ef4444', bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fca5a5' } }}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {showUserName && entry.userId?.name && (
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        🧑🏻‍💼 {entry.userId.name}
                    </Typography>
                )}

                <Grid container spacing={2}>
                    {[
                        { icon: <WakeIcon sx={{ color: '#FFA726' }} />, label: 'Wake up', value: formatTime(entry.wakeUpTime) },
                        { icon: <SleepIcon sx={{ color: '#5C6BC0' }} />, label: 'Slept at', value: formatTime(entry.sleepTime) },
                        { icon: <RoundsIcon sx={{ color: '#FFD700' }} />, label: 'Rounds chanted', value: entry.roundsChanted },
                        { icon: <BookIcon sx={{ color: '#66BB6A' }} />, label: 'Book', value: entry.bookName },
                        { icon: <BookIcon sx={{ color: '#42A5F5' }} />, label: 'Reading', value: `${entry.readingDuration} min` },
                        { icon: <ServiceIcon sx={{ color: '#AB47BC' }} />, label: 'Service', value: `${entry.serviceDuration} hrs` },
                    ].map(({ icon, label, value }) => (
                        <Grid item xs={12} sm={6} key={label}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                {icon}
                                <Typography variant="body2" color="text.secondary">
                                    <strong>{label}:</strong> {value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                    {entry.serviceType && (
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Service Type:</strong> {entry.serviceType}
                            </Typography>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HearingIcon sx={{ color: '#26A69A' }} />
                            <Typography variant="body2" color="text.secondary">
                                <strong>Hearing:</strong> {entry.hearingDuration} hrs
                            </Typography>
                        </Box>
                    </Grid>
                    {entry.studyDuration > 0 && (
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: 18 }}>🎓</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Study Duration:</strong> {entry.studyDuration} hrs
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    {entry.studyDuration > 0 && entry.studyTopic && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Study Topic:</strong> {entry.studyTopic}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

/* ─────────────────────────────────────────────
   Main export — picks layout based on screen
───────────────────────────────────────────── */
const SadhnaCard = (props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    return isMobile ? <MobileCard {...props} /> : <DesktopCard {...props} />;
};

export default SadhnaCard;
