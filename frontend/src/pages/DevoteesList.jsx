import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Paper, CircularProgress,
    Avatar, Chip, LinearProgress, Divider, Tooltip,
    FormControl, InputLabel, Select, MenuItem, Grid, Tabs, Tab, TextField,
    useMediaQuery, useTheme
} from '@mui/material';
import {
    CalendarToday as DateIcon,
    History as HistoryIcon,
    PersonSearch as PersonSearchIcon,
    Groups as GroupsIcon
} from '@mui/icons-material';
import { sadhnaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import SadhnaCard from '../components/SadhnaCard';

/* ── Performance helpers ─────────────────────────────────────────── */
const MAX_SCORE = 320;
const perfLevel = (score) => {
    const pct = Math.min((score / MAX_SCORE) * 100, 100);
    if (pct >= 65) return { label: 'Excellent', color: '#16a34a', bg: '#dcfce7', border: '#86efac', bar: '#16a34a' };
    if (pct >= 35) return { label: 'Good', color: '#d97706', bg: '#fef3c7', border: '#fcd34d', bar: '#f59e0b' };
    return { label: 'Needs Work', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', bar: '#ef4444' };
};

const calcSleepHrs = (wakeUp, sleep) => {
    if (!wakeUp || !sleep) return null;
    const toMin = t => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]);
    let d = toMin(wakeUp) - toMin(sleep);
    if (d < 0) d += 24 * 60;
    return Math.round(d / 60 * 10) / 10;
};

/* ── Entry card ─────────────────────────────────────────────────── */
const EntryCard = ({ entry }) => {
    const perf = perfLevel(entry.totalScore);
    const sleepH = calcSleepHrs(entry.wakeUpTime, entry.sleepTime);

    const stats = [
        { label: '⏰ Wake', val: entry.wakeUpTime, ok: entry.wakeUpTime <= '04:00' },
        { label: '🛌 Sleep', val: sleepH !== null ? `${sleepH}h` : '—', ok: sleepH !== null ? sleepH <= 7 : null },
        { label: '📿 Rounds', val: entry.roundsChanted, ok: entry.roundsChanted >= 16 },
        { label: '📖 Reading', val: `${entry.readingDuration}m`, ok: entry.readingDuration >= 30 },
        { label: '🎧 Hearing', val: `${entry.hearingDuration}h`, ok: entry.hearingDuration >= 1 },
        { label: '🙏 Service', val: `${entry.serviceDuration}h`, ok: entry.serviceDuration >= 1 },
        ...(entry.studyDuration > 0 ? [{ label: '🎓 Study', val: `${entry.studyDuration}h`, ok: entry.studyDuration >= 1 }] : []),
    ];

    return (
        <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 }, mb: 1.5, borderRadius: 2.5,
            border: `1.5px solid ${perf.border}`, bgcolor: perf.bg,
            transition: 'transform 0.12s', '&:hover': { transform: 'translateX(4px)' }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: '#1e293b', wordBreak: 'break-word' }}>
                        {format(parseISO(entry.date.split('T')[0]), 'EEE, dd MMM yyyy')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        📚 {entry.bookName}
                        {entry.serviceType ? ` · ${entry.serviceType}` : ''}
                        {entry.studyDuration > 0 ? ` · 🎓 ${entry.studyDuration}h study` : ''}
                        {entry.studyDuration > 0 && entry.studyTopic ? ` (${entry.studyTopic})` : ''}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: perf.color, lineHeight: 1 }}>
                        {Math.round(entry.totalScore)}
                    </Typography>
                    <Chip label={perf.label} size="small" sx={{
                        bgcolor: 'white', color: perf.color, border: `1px solid ${perf.border}`,
                        fontWeight: 700, fontSize: '0.65rem', height: 18, mt: 0.25
                    }} />
                </Box>
            </Box>

            <LinearProgress variant="determinate"
                value={Math.min((entry.totalScore / MAX_SCORE) * 100, 100)}
                sx={{
                    height: 5, borderRadius: 3, mb: 1, bgcolor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: perf.bar }
                }}
            />

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {stats.map(s => (
                    <Box key={s.label} sx={{
                        display: 'flex', alignItems: 'center', gap: 0.5,
                        bgcolor: 'rgba(255,255,255,0.75)', borderRadius: 1.5, px: 0.8, py: 0.3,
                        border: `1px solid ${s.ok === null ? '#e2e8f0' : s.ok ? '#86efac' : '#fca5a5'}`,
                        color: s.ok === null ? '#475569' : s.ok ? '#16a34a' : '#dc2626',
                    }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.65rem', opacity: 0.8 }}>{s.label}</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.7rem' }}>{s.val}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

/* ── DailyReport Tab ────────────────────────────────────────────── */
const DailyReport = ({ fetchEntries: fetchFn, apiParamKey = 'date' }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => { load(); }, [selectedDate]);

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetchFn({ [apiParamKey]: selectedDate });
            setEntries(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        Daily Submissions
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {entries.length} {entries.length === 1 ? 'devotee' : 'devotees'} submitted on {format(parseISO(selectedDate), 'MMM d, yyyy')}
                    </Typography>
                </Box>
                <TextField
                    type="date"
                    size="small"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    sx={{
                        bgcolor: 'white',
                        width: { xs: '100%', sm: 180 },
                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : entries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    <PersonSearchIcon sx={{ fontSize: 56, color: '#e2e8f0', mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#64748b' }}>
                        No daily submissions found
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        There are no sadhna entries recorded for {format(parseISO(selectedDate), 'MMM d, yyyy')}.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ pb: { xs: '80px', sm: 0 } }}>
                    {entries.map(entry => <SadhnaCard key={entry._id} entry={entry} showUserName={true} />)}
                </Box>
            )}
        </Box>
    );
};

/* ── DevoteeHistory Tab ─────────────────────────────────────────── */
const DevoteeHistory = ({ devoteeList, historyFetcher }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedId, setSelectedId] = useState('');
    const [histData, setHistData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = async (id) => {
        setSelectedId(id);
        if (!id) { setHistData(null); return; }
        setLoading(true);
        try {
            const res = await historyFetcher(id);
            setHistData(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const entries = histData?.entries || [];
    const excellent = entries.filter(e => perfLevel(e.totalScore).label === 'Excellent').length;
    const good = entries.filter(e => perfLevel(e.totalScore).label === 'Good').length;
    const needs = entries.filter(e => perfLevel(e.totalScore).label === 'Needs Work').length;
    const avgScore = entries.length ? Math.round(entries.reduce((s, e) => s + e.totalScore, 0) / entries.length) : 0;

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <FormControl size="small" sx={{ mb: 3, width: { xs: '100%', sm: 320 } }}>
                <InputLabel>Select Devotee</InputLabel>
                <Select value={selectedId} label="Select Devotee"
                    onChange={e => handleChange(e.target.value)}
                    sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <MenuItem value=""><em>— Choose a devotee —</em></MenuItem>
                    {devoteeList.map(d => (
                        <MenuItem key={d._id} value={d._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{
                                    width: 24, height: 24, fontSize: '0.72rem',
                                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', fontWeight: 700
                                }}>
                                    {d.name.charAt(0).toUpperCase()}
                                </Avatar>
                                {d.name}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#7c3aed' }} /></Box>}

            {!loading && !histData && (
                <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    <PersonSearchIcon sx={{ fontSize: 56, color: '#c4b5fd', mb: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#64748b' }}>
                        Select a devotee from above
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        View complete sadhna history and performance
                    </Typography>
                </Box>
            )}

            {!loading && histData && entries.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                    <HistoryIcon sx={{ fontSize: 56, color: '#e2e8f0', mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#64748b' }}>
                        No history found
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        This devotee hasn&apos;t recorded any sadhna entries yet.
                    </Typography>
                </Box>
            )}

            {!loading && entries.length > 0 && (
                <>
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                        {[
                            { label: 'Total Entries', val: entries.length, color: '#4f46e5', bg: '#eef2ff' },
                            { label: 'Avg Score', val: avgScore, color: '#0369a1', bg: '#e0f2fe' },
                            { label: '🟢 Excellent', val: excellent, color: '#16a34a', bg: '#dcfce7' },
                            { label: '🟡 Good', val: good, color: '#d97706', bg: '#fef3c7' },
                            { label: '🔴 Needs Work', val: needs, color: '#dc2626', bg: '#fee2e2' },
                        ].map(s => (
                            <Grid item xs={6} sm={2.4} key={s.label}>
                                <Box sx={{ bgcolor: s.bg, borderRadius: 2.5, p: { xs: 1, sm: 1.5 }, textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: s.color }}>{s.val}</Typography>
                                    <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: '#64748b', fontWeight: 600 }}>{s.label}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Excellent (≥65%)', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
                            { label: 'Good (35–65%)', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
                            { label: 'Needs Work (<35%)', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
                        ].map(l => (
                            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: l.bg, border: `1.5px solid ${l.border}` }} />
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{l.label}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ maxHeight: { xs: 400, sm: 540 }, overflowY: 'auto', pr: 0.5, pb: { xs: '76px', sm: 0 } }}>
                        {entries.map(e => <EntryCard key={e._id} entry={e} />)}
                    </Box>
                </>
            )}
        </Box>
    );
};

/* ── Mentor View ────────────────────────────────────────────────── */
const MentorView = ({ devoteeList }) => {
    const [tab, setTab] = useState(0);
    return (
        <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': { fontWeight: 600, py: 1.8, px: { xs: 1, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
                        '& .Mui-selected': { color: tab === 0 ? '#4f46e5' : '#7c3aed' },
                        '& .MuiTabs-indicator': { bgcolor: tab === 0 ? '#4f46e5' : '#7c3aed', height: 3 }
                    }}>
                    <Tab icon={<DateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Daily Report" />
                    <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Devotee History" />
                </Tabs>
            </Box>
            {tab === 0 && <DailyReport fetchEntries={sadhnaAPI.getDevoteesEntries} />}
            {tab === 1 && <DevoteeHistory devoteeList={devoteeList} historyFetcher={sadhnaAPI.getDevoteeHistory} />}
        </Paper>
    );
};

/* ── Devotee Peer View ──────────────────────────────────────────── */
const DevoteePeerView = () => {
    const [tab, setTab] = useState(0);
    const [peerList, setPeerList] = useState([]);

    useEffect(() => {
        sadhnaAPI.getPeerDevotees()
            .then(res => setPeerList(res.data || []))
            .catch(console.error);
    }, []);

    return (
        <Paper sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Info banner */}
            <Box sx={{
                px: { xs: 2, sm: 3 }, py: 1.5,
                background: 'linear-gradient(135deg, #f0f4ff, #faf5ff)',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 1
            }}>
                <GroupsIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 600 }}>
                    Your Group&apos;s Sadhna — {peerList.length} devotee{peerList.length !== 1 ? 's' : ''} in your group
                </Typography>
            </Box>

            <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': { fontWeight: 600, py: 1.8, px: { xs: 1, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } },
                        '& .Mui-selected': { color: tab === 0 ? '#4f46e5' : '#7c3aed' },
                        '& .MuiTabs-indicator': { bgcolor: tab === 0 ? '#4f46e5' : '#7c3aed', height: 3 }
                    }}>
                    <Tab icon={<DateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Daily Report" />
                    <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Group History" />
                </Tabs>
            </Box>
            {tab === 0 && <DailyReport fetchEntries={sadhnaAPI.getPeerDevoteesEntries} />}
            {tab === 1 && <DevoteeHistory devoteeList={peerList} historyFetcher={sadhnaAPI.getPeerDevoteeHistory} />}
        </Paper>
    );
};

/* ── Main Page ───────────────────────────────────────────────────── */
const DevoteesList = () => {
    const { isMentor } = useAuth();
    const [devoteeList, setDevoteeList] = useState([]);

    useEffect(() => {
        if (isMentor) {
            sadhnaAPI.getWeeklyWinner()
                .then(res => setDevoteeList((res.data?.rankings || []).map(r => r.user)))
                .catch(console.error);
        }
    }, [isMentor]);

    return (
        <Box sx={{ background: 'linear-gradient(180deg,#f0f4ff 0%,#f8fafc 100%)', minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
            <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>

                {/* Page header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2.5, sm: 4 } }}>
                    <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg,#f59e0b,#4f46e5)', flexShrink: 0 }} />
                    <Box>
                        <Typography variant="h5" sx={{
                            fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: '#1e293b',
                            letterSpacing: '-0.5px', fontSize: { xs: '1.2rem', sm: '1.5rem' }
                        }}>
                            {isMentor ? "Devotees' Sadhna Reports" : 'Group Sadhna'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25 }}>
                            {isMentor ? "Monitor your devotees' daily sadhna progress" : 'See how your group is doing spiritually'}
                        </Typography>
                    </Box>
                </Box>

                {isMentor ? <MentorView devoteeList={devoteeList} /> : <DevoteePeerView />}
            </Container>
        </Box>
    );
};

export default DevoteesList;
