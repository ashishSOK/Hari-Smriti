import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Box, Typography, Paper, CircularProgress,
    Card, CardContent, Avatar, Button, Chip,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip, Divider, Tab, Tabs, IconButton
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    TableChart as ExcelIcon,
    PictureAsPdf as PdfIcon,
    Star as StarIcon,
    CheckCircle as OkIcon,
    TrendingUp as ImproveIcon,
    DateRange as WeekIcon,
    CalendarMonth as MonthIcon,
    ChevronLeft as PrevIcon,
    ChevronRight as NextIcon,
} from '@mui/icons-material';
import { sadhnaAPI } from '../services/api';
import { format, addWeeks, subWeeks } from 'date-fns';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const medalColors = [
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',  // Indigo - 1st
    'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',  // Silver - 2nd
    'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', // Purple - 3rd
];
const medalEmoji = ['🥇', '🥈', '🥉'];

const ASPECT_META = {
    Sleep: { emoji: '😴', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
    Reading: { emoji: '📖', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
    Hearing: { emoji: '🎧', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
    Service: { emoji: '🙏', color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
};

const SuggestionChips = ({ avgStats }) => {
    if (!avgStats) return (
        <Chip size="small" label="No entries"
            sx={{ bgcolor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
    );

    const items = [
        { aspect: 'Sleep', cur: `${avgStats.avgSleepHrs}h`, target: '≤7h', ok: avgStats.avgSleepHrs <= 7 },
        { aspect: 'Reading', cur: `${avgStats.avgReadingMin}m`, target: '30m', ok: avgStats.avgReadingMin >= 30 },
        { aspect: 'Hearing', cur: `${avgStats.avgHearingHrs}h`, target: '1h', ok: avgStats.avgHearingHrs >= 1 },
        { aspect: 'Service', cur: `${avgStats.avgServiceHrs}h`, target: '1h', ok: avgStats.avgServiceHrs >= 1 },
    ];

    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {items.map(item => {
                const meta = ASPECT_META[item.aspect];
                return (
                    <Tooltip key={item.aspect} arrow
                        title={item.ok
                            ? `${item.aspect}: ✓ On track! (avg ${item.cur})`
                            : `${item.aspect}: avg ${item.cur} — target is ${item.target}. Needs improvement!`
                        }>
                        <Chip
                            size="small"
                            icon={item.ok
                                ? <OkIcon sx={{ fontSize: '13px !important', color: `${meta.color} !important` }} />
                                : <ImproveIcon sx={{ fontSize: '13px !important', color: '#ea580c !important' }} />
                            }
                            label={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span>{meta.emoji}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>{item.cur}</span>
                                    {!item.ok && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>/{item.target}</span>}
                                </Box>
                            }
                            sx={{
                                height: 22,
                                bgcolor: item.ok ? meta.bg : '#fff7ed',
                                border: `1px solid ${item.ok ? meta.border : '#fdba74'}`,
                                color: item.ok ? meta.color : '#c2410c',
                                '& .MuiChip-label': { px: 0.75 },
                                cursor: 'default',
                            }}
                        />
                    </Tooltip>
                );
            })}
        </Box>
    );
};

/* ─── LEADERBOARD TABLE ─────────────────────────────────────────────────── */
const LeaderboardTable = ({ rankings, totalDays, tab }) => {
    return (
        <>
            {/* Mobile View */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2, p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
                {rankings.map((rank, idx) => {
                    const isTopThree = idx < 3;
                    return (
                        <Box key={rank.user._id} sx={{
                            p: { xs: 2.5, sm: 3 },
                            bgcolor: isTopThree ? ['#fffbeb', '#f0f9ff', '#fff7ed'][idx] : 'white',
                            borderRadius: 3,
                            boxShadow: isTopThree ? '0 4px 12px rgba(0,0,0,0.06)' : '0 1px 6px rgba(0,0,0,0.04)',
                            border: '1px solid',
                            borderColor: isTopThree ? ['#fde68a', '#bae6fd', '#fed7aa'][idx] : '#e2e8f0',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {isTopThree && <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: medalColors[idx] }} />}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <Box sx={{ width: 40, textAlign: 'center', mr: 1, flexShrink: 0 }}>
                                    {isTopThree ? (
                                        <Box sx={{
                                            width: 34, height: 34, borderRadius: '50%', background: medalColors[idx], margin: '0 auto',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                        }}>{medalEmoji[idx]}</Box>
                                    ) : (
                                        <Typography sx={{ fontWeight: 800, color: '#64748b', fontSize: '1rem' }}>#{idx + 1}</Typography>
                                    )}
                                </Box>
                                <Avatar sx={{ width: 42, height: 42, mr: 1.5, background: isTopThree ? medalColors[idx] : 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                    {rank.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', lineHeight: 1.2 }}>{rank.user.name}</Typography>
                                    <Typography noWrap variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{rank.user.email}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', ml: 1, pl: 1.5, borderLeft: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: isTopThree ? '#4f46e5' : '#1e293b', lineHeight: 1, letterSpacing: '-0.5px' }}>
                                        {Math.round(rank.totalScore)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: isTopThree ? '#6366f1' : '#94a3b8', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Score</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap', pl: { xs: 0, sm: '66px' } }}>
                                <Chip label={`Days: ${rank.daysSubmitted}/${totalDays}`} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700, bgcolor: rank.daysSubmitted / totalDays >= 0.85 ? '#dcfce7' : rank.daysSubmitted / totalDays >= 0.57 ? '#fef3c7' : '#fee2e2', color: rank.daysSubmitted / totalDays >= 0.85 ? '#16a34a' : rank.daysSubmitted / totalDays >= 0.57 ? '#d97706' : '#dc2626' }} />
                                <Chip label={`Avg: ${rank.avgScorePerDay}/day`} size="small" sx={{ height: 24, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }} />
                            </Box>
                            <Box sx={{ pl: { xs: 0, sm: '66px' } }}>
                                <SuggestionChips avgStats={rank.avgStats} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Desktop View */}
            <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: tab === 0 ? '#4f46e5' : '#7c3aed' }}>
                            {['Rank', 'Student', 'Days', 'Total Score', 'Avg/Day', 'Improvements'].map(h => (
                                <TableCell key={h} sx={{
                                    color: 'white', fontWeight: 700, fontSize: '0.82rem', borderBottom: 'none',
                                    ...(h === 'Student' ? { minWidth: 200 } : h === 'Improvements' ? { minWidth: 220 } : {})
                                }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rankings.map((rank, idx) => {
                            const isTopThree = idx < 3;
                            return (
                                <TableRow key={rank.user._id} sx={{
                                    bgcolor: isTopThree ? ['#fffbeb', '#f8fafc', '#fff7ed'][idx] : idx % 2 === 0 ? 'white' : '#f8fafc',
                                    '&:hover': { bgcolor: '#eef2ff' }, transition: 'background 0.12s',
                                    '&:last-child td': { borderBottom: 'none' }
                                }}>
                                    <TableCell sx={{ width: 70 }}>
                                        {isTopThree ? (
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: '50%', background: medalColors[idx],
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                                            }}>
                                                {medalEmoji[idx]}
                                            </Box>
                                        ) : (
                                            <Typography sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.95rem', ml: 0.5 }}>#{idx + 1}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{
                                                width: 38, height: 38,
                                                background: isTopThree ? medalColors[idx] : 'linear-gradient(135deg,#667eea,#764ba2)',
                                                fontSize: '0.9rem', fontWeight: 700
                                            }}>
                                                {rank.user.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.2 }}>
                                                    {rank.user.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>{rank.user.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip label={`${rank.daysSubmitted}/${totalDays}`} size="small"
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: rank.daysSubmitted / totalDays >= 0.85 ? '#dcfce7' : rank.daysSubmitted / totalDays >= 0.57 ? '#fef3c7' : '#fee2e2',
                                                color: rank.daysSubmitted / totalDays >= 0.85 ? '#16a34a' : rank.daysSubmitted / totalDays >= 0.57 ? '#d97706' : '#dc2626',
                                                border: '1px solid currentColor',
                                            }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: isTopThree ? '#4f46e5' : '#1e293b' }}>
                                            {Math.round(rank.totalScore)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                                            {rank.avgScorePerDay > 0 ? rank.avgScorePerDay : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <SuggestionChips avgStats={rank.avgStats} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

/* ─── WINNER CARD ───────────────────────────────────────────────────────── */
const WinnerCard = ({ winner, totalDays }) => (
    <Card sx={{
        mb: 3, background: 'linear-gradient(135deg,#312e81 0%,#4f46e5 50%,#7c3aed 100%)',
        color: 'white', borderRadius: 4, boxShadow: '0 12px 40px rgba(79,70,229,0.35)'
    }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrophyIcon sx={{ fontSize: 48 }} />
                <Box>
                    <Typography variant="overline" sx={{ opacity: 0.85, fontWeight: 600, letterSpacing: 2 }}>Champion</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{winner.user.name}</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total Score', value: Math.round(winner.totalScore) },
                    { label: 'Days Submitted', value: `${winner.daysSubmitted}/${totalDays}` },
                    { label: 'Avg Score/Day', value: winner.avgScorePerDay },
                ].map(item => (
                    <Box key={item.label} sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, px: 2.5, py: 1.5, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{item.value}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.85 }}>{item.label}</Typography>
                    </Box>
                ))}
            </Box>
        </CardContent>
    </Card>
);

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
const WeeklyWinner = () => {
    const [tab, setTab] = useState(0); // 0=Weekly, 1=Monthly
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Week navigation
    const [weekBase, setWeekBase] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);

    // Month navigation
    const now = new Date();
    const [selYear, setSelYear] = useState(now.getFullYear());
    const [selMonth, setSelMonth] = useState(now.getMonth() + 1);

    const fetchWeekly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sadhnaAPI.getWeeklyWinner({ weekStart: format(weekBase, 'yyyy-MM-dd') });
            setWeeklyData(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [weekBase]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sadhnaAPI.getMonthlyWinner({ year: selYear, month: selMonth });
            setMonthlyData(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [selYear, selMonth]);

    useEffect(() => { if (tab === 0) fetchWeekly(); }, [tab, fetchWeekly]);
    useEffect(() => { if (tab === 1) fetchMonthly(); }, [tab, fetchMonthly]);

    const goWeek = (dir) => {
        setWeekBase(prev => dir === -1 ? subWeeks(prev, 1) : addWeeks(prev, 1));
        setWeekOffset(prev => prev + dir);
    };
    const goMonth = (dir) => {
        const d = new Date(selYear, selMonth - 1 + dir, 1);
        setSelYear(d.getFullYear()); setSelMonth(d.getMonth() + 1);
    };

    const activeData = tab === 0 ? weeklyData : monthlyData;
    const hasData = activeData?.rankings?.length > 0;

    const weekLabel = weeklyData
        ? `${format(new Date(weeklyData.weekStart), 'dd MMM')} – ${format(new Date(weeklyData.weekEnd), 'dd MMM yyyy')}`
        : '...';
    const monthLabel = `${MONTH_NAMES[selMonth - 1]} ${selYear}`;
    const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth() + 1;
    const totalDays = tab === 0 ? 7 : (monthlyData?.totalDays || 30);

    /* ── Exports ── */
    const buildRows = () => {
        if (!activeData) return { headers: [], rows: [] };
        const headers = ['Rank', 'Name', 'Email', 'Days', 'Total Score', 'Avg/Day', '😴Sleep', '📖Reading', '🎧Hearing', '🙏Service'];
        const rows = activeData.rankings.map((rank, i) => [
            i + 1, rank.user.name, rank.user.email,
            `${rank.daysSubmitted}/${totalDays}`,
            Math.round(rank.totalScore), rank.avgScorePerDay,
            rank.avgStats ? `${rank.avgStats.avgSleepHrs}h` : '—',
            rank.avgStats ? `${rank.avgStats.avgReadingMin}m` : '—',
            rank.avgStats ? `${rank.avgStats.avgHearingHrs}h` : '—',
            rank.avgStats ? `${rank.avgStats.avgServiceHrs}h` : '—',
        ]);
        return { headers, rows };
    };

    const filename = tab === 0
        ? `weekly_champion_${weeklyData ? format(new Date(weeklyData.weekStart), 'dd-MMM-yyyy') : ''}`
        : `monthly_champion_${MONTH_NAMES[selMonth - 1]}_${selYear}`;

    const periodLabel = tab === 0 ? weekLabel : monthLabel;

    const exportExcel = async () => {
        if (!hasData) return;
        const XLSX = await import('xlsx');
        const { headers, rows } = buildRows();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tab === 0 ? 'Weekly' : 'Monthly');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportPdf = async () => {
        if (!hasData) return;
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const { headers, rows } = buildRows();
        const accent = tab === 0 ? [79, 70, 229] : [124, 58, 237];
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFillColor(...accent);
        doc.rect(0, 0, doc.internal.pageSize.width, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
        doc.text(`🏆 Hari Smriti — ${tab === 0 ? 'Weekly' : 'Monthly'} Champions`, 14, 10);
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${periodLabel}`, 14, 17);
        doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, doc.internal.pageSize.width - 14, 17, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        autoTable(doc, {
            head: [headers], body: rows, startY: 28,
            headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
            styles: { fontSize: 8, halign: 'center', cellPadding: 2 },
            columnStyles: { 1: { halign: 'left' }, 2: { halign: 'left' } },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell(hook) {
                if (hook.section === 'body' && hook.column.index === 4) hook.cell.styles.fontStyle = 'bold';
            },
            didDrawPage(d) {
                doc.setFontSize(7); doc.setTextColor(150, 150, 150);
                doc.text(`Page ${d.pageNumber} | Hari Smriti`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
            }
        });
        doc.save(`${filename}.pdf`);
    };

    return (
        <Box sx={{ background: 'linear-gradient(180deg,#f0f4ff 0%,#f8fafc 100%)', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Box sx={{ width: 4, height: 32, borderRadius: 2, background: 'linear-gradient(180deg,#f59e0b,#667eea)' }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: '#1e293b', letterSpacing: '-0.5px' }}>
                                Champions Board
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', ml: 2 }}>
                            {tab === 0 ? weekLabel : monthLabel}
                        </Typography>
                    </Box>
                    {hasData && (
                        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                            <Button variant="contained" fullWidth startIcon={<ExcelIcon />} onClick={exportExcel}
                                sx={{ bgcolor: '#16a34a', fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(22,163,74,0.3)', '&:hover': { bgcolor: '#15803d' } }}>
                                Excel
                            </Button>
                            <Button variant="contained" fullWidth startIcon={<PdfIcon />} onClick={exportPdf}
                                sx={{ bgcolor: '#dc2626', fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(220,38,38,0.3)', '&:hover': { bgcolor: '#b91c1c' } }}>
                                PDF
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Tabs + Navigation */}
                <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)}
                            variant="fullWidth"
                            sx={{
                                borderBottom: { xs: '1px solid #e2e8f0', md: 'none' },
                                '& .MuiTab-root': { fontWeight: 600, py: { xs: 1.5, md: 1.8 }, px: { xs: 1, md: 3 } },
                                '& .Mui-selected': { color: tab === 0 ? '#4f46e5' : '#7c3aed' },
                                '& .MuiTabs-indicator': { bgcolor: tab === 0 ? '#4f46e5' : '#7c3aed', height: 3 }
                            }}>
                            <Tab icon={<WeekIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Weekly" />
                            <Tab icon={<MonthIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Monthly" />
                        </Tabs>

                        {/* Nav controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, p: { xs: 1.5, md: 0 }, pr: { md: 2 } }}>
                            <IconButton size="small" onClick={() => tab === 0 ? goWeek(-1) : goMonth(-1)}
                                sx={{ bgcolor: tab === 0 ? '#eef2ff' : '#f5f3ff', color: tab === 0 ? '#4f46e5' : '#7c3aed' }}>
                                <PrevIcon />
                            </IconButton>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { xs: 160, sm: 220 } }}>
                                <Typography sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'center', fontSize: '0.88rem' }}>
                                    {tab === 0 ? weekLabel : monthLabel}
                                </Typography>
                                {((tab === 0 && weekOffset !== 0) || (tab === 1 && !isCurrentMonth)) && (
                                    <Button size="small" variant="text"
                                        onClick={() => tab === 0 ? (setWeekBase(new Date()), setWeekOffset(0)) : (setSelYear(now.getFullYear()), setSelMonth(now.getMonth() + 1))}
                                        sx={{ color: tab === 0 ? '#4f46e5' : '#7c3aed', fontWeight: 600, fontSize: '0.7rem', textTransform: 'none', p: 0, minHeight: 0, mt: 0.5 }}>
                                        Back to Today
                                    </Button>
                                )}
                            </Box>
                            <IconButton size="small"
                                onClick={() => tab === 0 ? goWeek(1) : goMonth(1)}
                                disabled={tab === 0 ? weekOffset >= 0 : isCurrentMonth}
                                sx={{ bgcolor: tab === 0 ? '#eef2ff' : '#f5f3ff', color: tab === 0 ? '#4f46e5' : '#7c3aed' }}>
                                <NextIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 14 }}>
                        <CircularProgress sx={{ color: '#4f46e5' }} size={40} />
                    </Box>
                ) : !hasData ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h2">🙏</Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>No entries for this period yet.</Typography>
                    </Paper>
                ) : (
                    <>
                        {activeData.winner && <WinnerCard winner={activeData.winner} totalDays={totalDays} />}

                        <Paper sx={{ borderRadius: 3, mb: { xs: '80px', sm: 0 }, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #e2e8f0' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    📊 Full Leaderboard
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Rounds×10 + Reading×0.5/min + Service×20/hr + Hearing×15/hr + Wake≤4am: +50
                                </Typography>
                            </Box>

                            <LeaderboardTable rankings={activeData.rankings} totalDays={totalDays} tab={tab} />

                            {/* Legend */}
                            <Box sx={{ px: 3, py: 1.5, pb: { xs: '86px', sm: 1.5 }, bgcolor: '#f8faff', borderTop: '1px solid #e8ecf8', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {['Rounds × 10 pts', 'Reading × 0.5/min', 'Service × 20/hr', 'Hearing × 15/hr', 'Wake ≤4am: +50'].map(f => (
                                    <Chip key={f} label={f} size="small" icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                                        sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 500, fontSize: '0.72rem' }} />
                                ))}
                            </Box>
                        </Paper>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default WeeklyWinner;
