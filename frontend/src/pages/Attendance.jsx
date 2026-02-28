import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Box, Typography, Paper, CircularProgress,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Tooltip, Chip, LinearProgress,
    IconButton, Tab, Tabs, Avatar, Divider
} from '@mui/material';
import {
    ChevronLeft as PrevIcon,
    ChevronRight as NextIcon,
    TableChart as ExcelIcon,
    PictureAsPdf as PdfIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    CalendarMonth as MonthIcon,
    DateRange as WeekIcon,
    TrendingUp as TrendUpIcon,
    People as PeopleIcon,
    CheckCircleOutline as OnTrackIcon,
    Warning as WarnIcon,
} from '@mui/icons-material';
import { sadhnaAPI } from '../services/api';
import { format, addWeeks, subWeeks, parseISO } from 'date-fns';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pctColor = (p) => p >= 85 ? '#16a34a' : p >= 60 ? '#d97706' : '#dc2626';
const pctBg = (p) => p >= 85 ? '#dcfce7' : p >= 60 ? '#fef3c7' : '#fee2e2';

/* ─── ATOMS ──────────────────────────────────────────────────────────────── */
const StatusDot = ({ submitted, compact = false }) => (
    <Tooltip title={submitted ? 'Submitted' : 'Not submitted'} arrow>
        <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: compact ? 18 : 26, height: compact ? 18 : 26,
            borderRadius: '50%',
            bgcolor: submitted ? '#dcfce7' : '#fef2f2',
            border: `1.5px solid ${submitted ? '#86efac' : '#fca5a5'}`,
        }}>
            {submitted
                ? <CheckIcon sx={{ color: '#16a34a', fontSize: compact ? 12 : 16 }} />
                : <CancelIcon sx={{ color: '#ef4444', fontSize: compact ? 12 : 16 }} />
            }
        </Box>
    </Tooltip>
);

const PctBadge = ({ pct }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: pctColor(pct), lineHeight: 1 }}>
            {pct}%
        </Typography>
        <LinearProgress variant="determinate" value={pct}
            sx={{
                width: 54, height: 5, borderRadius: 3, bgcolor: '#e5e7eb',
                '& .MuiLinearProgress-bar': { bgcolor: pctColor(pct), borderRadius: 3 }
            }} />
    </Box>
);

/* ─── STAT CARDS ─────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, iconColor, iconBg, value, label, subtitle }) => (
    <Paper sx={{
        flex: 1, minWidth: 0, borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'stretch' },
    }}>
        <Box sx={{ width: { xs: '100%', sm: 6 }, height: { xs: 4, sm: 'auto' }, bgcolor: iconColor, flexShrink: 0, borderRadius: '0' }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 0.5, sm: 2 }, p: { xs: 1, sm: 2 }, flex: 1, justifyContent: 'center', width: '100%' }}>
            <Box sx={{
                width: { xs: 26, sm: 48 }, height: { xs: 26, sm: 48 }, borderRadius: { xs: 1.5, sm: 2.5 }, bgcolor: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <Icon sx={{ color: iconColor, fontSize: { xs: 14, sm: 26 } }} />
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, width: '100%', minWidth: 0, overflow: 'hidden' }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.6rem' }, lineHeight: 1, color: '#1e293b' }}>
                    {value}
                </Typography>
                <Typography noWrap variant="body2" sx={{ color: '#475569', fontWeight: 600, lineHeight: 1.2, fontSize: { xs: '0.55rem', sm: '0.875rem' }, mt: { xs: 0.5, sm: 0 } }}>
                    {label}
                </Typography>
                {subtitle && (
                    <Typography noWrap variant="caption" sx={{ color: '#94a3b8', fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: { xs: 'none', lg: 'block' } }}>{subtitle}</Typography>
                )}
            </Box>
        </Box>
    </Paper>
);

const SummaryCards = ({ attendance, totalDays }) => {
    if (!attendance?.length) return null;
    const avg = Math.round(attendance.reduce((s, r) => s + r.percentage, 0) / attendance.length);
    const onTrack = attendance.filter(r => r.percentage >= 85).length;
    const needsAttn = attendance.filter(r => r.percentage >= 60 && r.percentage < 85).length;
    const critical = attendance.filter(r => r.percentage < 60).length;

    return (
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1.5 }, mb: { xs: 2, sm: 3 }, width: '100%' }}>
            <StatCard icon={TrendUpIcon} iconColor="#667eea" iconBg="#eef2ff"
                value={`${avg}%`} label="Avg" subtitle="across all" />
            <StatCard icon={PeopleIcon} iconColor="#0ea5e9" iconBg="#e0f2fe"
                value={attendance.length} label="Total" />
            <StatCard icon={OnTrackIcon} iconColor="#16a34a" iconBg="#dcfce7"
                value={onTrack} label="On Track" subtitle="≥85%" />
            <StatCard icon={WarnIcon} iconColor="#d97706" iconBg="#fef3c7"
                value={needsAttn} label="Review" subtitle="60–84%" />
            <StatCard icon={CancelIcon} iconColor="#dc2626" iconBg="#fee2e2"
                value={critical} label="Critical" subtitle="<60%" />
        </Box>
    );
};

/* ─── TABLE HEADER STYLE ─────────────────────────────────────────────────── */
const th = (extra = {}) => ({
    fontWeight: 700, color: 'white', py: 1.5, fontSize: '0.8rem',
    bgcolor: 'transparent', borderBottom: 'none',
    ...extra
});

/* ─── WEEKLY VIEW ────────────────────────────────────────────────────────── */
const WeeklyView = ({ data }) => (
    <>
        {/* Mobile View */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2, p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
            {data.attendance.map((row) => (
                <Box key={row.devotee._id} sx={{
                    p: { xs: 2.5, sm: 3 },
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: pctColor(row.percentage) }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pl: 1 }}>
                        <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg,#667eea,#764ba2)', mr: 1.5, fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(102,126,234,0.3)' }}>
                            {row.devotee.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.2 }}>
                                {row.devotee.name}
                            </Typography>
                            <Typography noWrap variant="caption" sx={{ color: '#64748b' }}>{row.devotee.email}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <PctBadge pct={row.percentage} />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', p: 1.5, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1, justifyContent: 'space-between' }}>
                            {row.dailyStatus.map((day, i) => (
                                <Box key={day.date} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 12%' }}>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.5 }}>{DAY_LABELS[i]}</Typography>
                                    <StatusDot submitted={day.submitted} compact />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ mt: 1.5, textAlign: 'left' }}>
                        <Chip label={`${row.daysSubmitted}/7 Days`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: pctBg(row.percentage), color: pctColor(row.percentage) }} />
                    </Box>
                </Box>
            ))}
        </Box>

        {/* Desktop View */}
        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: '#4f46e5 !important' } }}>
                        <TableCell sx={th({ minWidth: 210 })}>Student</TableCell>
                        {data.days.map((day, i) => (
                            <TableCell key={day} align="center" sx={th({ minWidth: 58 })}>
                                {DAY_LABELS[i]}
                                <Typography variant="caption" display="block" sx={{ opacity: 0.75, fontWeight: 400, fontSize: '0.68rem' }}>
                                    {format(parseISO(day), 'dd/MM')}
                                </Typography>
                            </TableCell>
                        ))}
                        <TableCell align="center" sx={th({ minWidth: 68 })}>Days</TableCell>
                        <TableCell align="center" sx={th({ minWidth: 80 })}>Rate</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.attendance.map((row, idx) => (
                        <TableRow key={row.devotee._id} sx={{
                            bgcolor: idx % 2 === 0 ? '#fff' : '#fafafa',
                            '&:hover': { bgcolor: '#eef2ff' }, transition: 'background 0.12s',
                            '&:last-child td': { borderBottom: 'none' }
                        }}>
                            <TableCell sx={{ py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: '0.9rem', fontWeight: 700 }}>
                                        {row.devotee.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.2 }}>
                                            {row.devotee.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{row.devotee.email}</Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            {row.dailyStatus.map((day) => (
                                <TableCell key={day.date} align="center" sx={{ py: 1 }}>
                                    <StatusDot submitted={day.submitted} />
                                </TableCell>
                            ))}
                            <TableCell align="center">
                                <Chip label={`${row.daysSubmitted}/7`} size="small" sx={{
                                    fontWeight: 700, fontSize: '0.78rem',
                                    bgcolor: pctBg(row.percentage), color: pctColor(row.percentage),
                                    border: `1px solid ${pctColor(row.percentage)}44`,
                                }} />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1 }}>
                                <PctBadge pct={row.percentage} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>
);

/* ─── MONTHLY VIEW ───────────────────────────────────────────────────────── */
const MonthlyView = ({ data }) => {
    const dayNums = data.days.map(d => parseInt(d.split('-')[2]));
    return (
        <>
            {/* Mobile View */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2, p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
                {data.attendance.map((row) => (
                    <Box key={row.devotee._id} sx={{
                        p: { xs: 2.5, sm: 3 },
                        bgcolor: 'white',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: pctColor(row.percentage) }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pl: 1 }}>
                            <Avatar sx={{ width: 42, height: 42, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', mr: 1.5, fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(124,58,237,0.3)' }}>
                                {row.devotee.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.2 }}>
                                    {row.devotee.name}
                                </Typography>
                                <Typography noWrap variant="caption" sx={{ color: '#64748b' }}>{row.devotee.email}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', ml: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <PctBadge pct={row.percentage} />
                            </Box>
                        </Box>

                        <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, overflowX: 'auto', '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 } }}>
                            <Box sx={{ display: 'flex', gap: 0.5, minWidth: 'max-content', pb: 0.5 }}>
                                {row.dailyStatus.map((day, i) => (
                                    <Box key={day.date} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 26 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.25 }}>{dayNums[i]}</Typography>
                                        <StatusDot submitted={day.submitted} compact />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ mt: 1.5, textAlign: 'left' }}>
                            <Chip label={`${row.daysSubmitted}/${data.totalDays} Days`} size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: pctBg(row.percentage), color: pctColor(row.percentage) }} />
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Desktop View */}
            <TableContainer sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                <Table stickyHeader size="small" sx={{ minWidth: data.days.length * 26 + 260 }}>
                    <TableHead>
                        <TableRow sx={{ '& th': { bgcolor: '#7c3aed !important' } }}>
                            <TableCell sx={th({ minWidth: 180, position: 'sticky', left: 0, zIndex: 5 })}>Student</TableCell>
                            {dayNums.map((d, i) => (
                                <TableCell key={data.days[i]} align="center"
                                    sx={th({ width: 26, minWidth: 26, px: 0.25, fontSize: '0.72rem' })}>
                                    {d}
                                </TableCell>
                            ))}
                            <TableCell align="center" sx={th({ minWidth: 68 })}>Days</TableCell>
                            <TableCell align="center" sx={th({ minWidth: 80 })}>Rate</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.attendance.map((row, idx) => {
                            const rowBg = idx % 2 === 0 ? '#fff' : '#fafafa';
                            return (
                                <TableRow key={row.devotee._id} sx={{
                                    bgcolor: rowBg, '&:hover': { bgcolor: '#f5f3ff' },
                                    transition: 'background 0.12s', '&:last-child td': { borderBottom: 'none' }
                                }}>
                                    <TableCell sx={{ py: 1, position: 'sticky', left: 0, bgcolor: rowBg, zIndex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {row.devotee.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1e293b' }}>
                                                {row.devotee.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    {row.dailyStatus.map((day) => (
                                        <TableCell key={day.date} align="center" sx={{ py: 0.5, px: 0.2 }}>
                                            <StatusDot submitted={day.submitted} compact />
                                        </TableCell>
                                    ))}
                                    <TableCell align="center">
                                        <Chip label={`${row.daysSubmitted}/${data.totalDays}`} size="small" sx={{
                                            fontWeight: 700, fontSize: '0.72rem',
                                            bgcolor: pctBg(row.percentage), color: pctColor(row.percentage),
                                            border: `1px solid ${pctColor(row.percentage)}44`,
                                        }} />
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 1 }}>
                                        <PctBadge pct={row.percentage} />
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

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
const Attendance = () => {
    const [tab, setTab] = useState(0);
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weekBase, setWeekBase] = useState(new Date());
    const [weekOffset, setWeekOffset] = useState(0);
    const now = new Date();
    const [selYear, setSelYear] = useState(now.getFullYear());
    const [selMonth, setSelMonth] = useState(now.getMonth() + 1);

    const fetchWeekly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sadhnaAPI.getWeeklyAttendance({ weekStart: format(weekBase, 'yyyy-MM-dd') });
            setWeeklyData(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [weekBase]);

    const fetchMonthly = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sadhnaAPI.getMonthlyAttendance({ year: selYear, month: selMonth });
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

    const weekLabel = weeklyData
        ? `${format(parseISO(weeklyData.days[0]), 'dd MMM')} – ${format(parseISO(weeklyData.days[6]), 'dd MMM yyyy')}`
        : '...';
    const monthLabel = `${MONTH_NAMES[selMonth - 1]} ${selYear}`;
    const isCurrentMonth = selYear === now.getFullYear() && selMonth === now.getMonth() + 1;

    const activeData = tab === 0 ? weeklyData : monthlyData;
    const hasData = activeData?.attendance?.length > 0;

    /* ── EXPORTS ── */
    const buildRows = ({ plain = false } = {}) => {
        const d = activeData;
        if (!d) return { headers: [], rows: [] };
        const total = tab === 0 ? 7 : d.totalDays;
        const dayHeaders = tab === 0
            ? d.days.map((day, i) => `${DAY_LABELS[i]} (${format(parseISO(day), 'dd/MM')})`)
            : d.days.map(day => parseInt(day.split('-')[2]).toString());
        const headers = ['Student', 'Phone', 'Days Submitted', '%', 'Status', ...dayHeaders];

        // Excel gets emoji, PDF gets plain text (jsPDF can't render emoji)
        const getMsg = (pct) => plain
            ? (pct > 90 ? 'Good, Keep it up!' : pct >= 75 ? 'Try to improve' : 'Needs too much improvement')
            : (pct > 90 ? '\u2705 Good, Keep it up!' : pct >= 75 ? '\u26a0\ufe0f Try to improve' : '\ud83d\udd34 Needs too much improvement');

        const rows = d.attendance.map(row => [
            row.devotee.name,
            row.devotee.phone || '—',
            `${row.daysSubmitted}/${total}`,
            `${row.percentage}%`,
            getMsg(row.percentage),
            ...row.dailyStatus.map(s => s.submitted ? 'YES' : 'NO'),
        ]);
        return { headers, rows, total };
    };

    const filename = tab === 0
        ? `attendance_week_${weeklyData ? format(parseISO(weeklyData.days[0]), 'dd-MMM-yyyy') : ''}`
        : `attendance_${MONTH_NAMES[selMonth - 1]}_${selYear}`;

    const exportExcel = async () => {
        if (!hasData) return;
        const XLSX = await import('xlsx');
        const { headers, rows } = buildRows();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Column widths
        const colWidths = headers.map((h, i) => {
            if (i === 0) return { wch: 24 };   // Name
            if (i === 1) return { wch: 16 };   // Phone
            if (i === 2) return { wch: 16 };   // Days Submitted
            if (i === 3) return { wch: 7 };    // %
            if (i === 4) return { wch: 26 };   // Status message
            return { wch: 6 };                 // day cols
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, tab === 0 ? 'Weekly Attendance' : 'Monthly Attendance');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportPdf = async () => {
        if (!hasData) return;
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const { headers, rows } = buildRows({ plain: true });

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });

        // Title block
        const accentColor = tab === 0 ? [79, 70, 229] : [124, 58, 237];
        doc.setFillColor(...accentColor);
        doc.rect(0, 0, doc.internal.pageSize.width, 22, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('📅 Hari Smriti — Attendance Report', 14, 10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Period: ${tab === 0 ? weekLabel : monthLabel}`, 14, 17);
        doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, doc.internal.pageSize.width - 14, 17, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        // Summary row
        if (activeData?.attendance?.length) {
            const avg = Math.round(activeData.attendance.reduce((s, r) => s + r.percentage, 0) / activeData.attendance.length);
            const onTrack = activeData.attendance.filter(r => r.percentage >= 85).length;
            const critical = activeData.attendance.filter(r => r.percentage < 60).length;
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`Students: ${activeData.attendance.length}   Avg: ${avg}%   On Track (≥85%): ${onTrack}   Critical (<60%): ${critical}`, 14, 28);
            doc.setTextColor(0, 0, 0);
        }

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 32,
            styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
            headStyles: {
                fillColor: accentColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 },   // Name
                1: { halign: 'left', cellWidth: 24 },                       // Phone
                2: { halign: 'center', cellWidth: 18 },                     // Days
                3: { halign: 'center', cellWidth: 12 },                     // %
                4: { halign: 'left', cellWidth: 42 },                       // Status message
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell(data) {
                const val = data.cell.raw;
                if (data.section !== 'body') return;

                // YES / NO coloring
                if (val === 'YES') { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fontStyle = 'bold'; }
                if (val === 'NO') { data.cell.styles.textColor = [220, 38, 38]; }

                // % column (index 3): color by value
                if (data.column.index === 3) {
                    const pct = parseInt(val);
                    if (!isNaN(pct)) {
                        data.cell.styles.fontStyle = 'bold';
                        if (pct > 90) { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fillColor = [220, 252, 231]; }
                        else if (pct >= 75) { data.cell.styles.textColor = [161, 98, 7]; data.cell.styles.fillColor = [254, 243, 199]; }
                        else { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fillColor = [254, 226, 226]; }
                    }
                }

                // Status / Message column (index 4): color by content
                if (data.column.index === 4) {
                    data.cell.styles.fontStyle = 'bold';
                    if (val.includes('Good')) { data.cell.styles.textColor = [22, 163, 74]; data.cell.styles.fillColor = [220, 252, 231]; }
                    else if (val.includes('Try')) { data.cell.styles.textColor = [161, 98, 7]; data.cell.styles.fillColor = [254, 243, 199]; }
                    else { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fillColor = [254, 226, 226]; }
                }
            },
            didDrawPage(hookData) {
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${hookData.pageNumber}  |  Hari Smriti`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: 'center' });
            }
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <Box sx={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 3 } }}>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' }, mb: { xs: 2.5, sm: 4 }, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ px: { xs: 1, sm: 0 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Box sx={{ width: 4, height: { xs: 24, sm: 32 }, borderRadius: 2, background: 'linear-gradient(180deg,#667eea,#764ba2)' }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: '#1e293b', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '2.125rem' } }}>
                                Attendance Tracker
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', ml: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            Monitor your devotees&apos; sadhna submission consistency
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, px: { xs: 1, sm: 0 } }}>
                        <Button variant="contained" fullWidth={false} startIcon={<ExcelIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} onClick={exportExcel}
                            disabled={!hasData}
                            sx={{
                                flex: 1, py: { xs: 1, sm: 1 }, fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                bgcolor: '#16a34a', fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                                '&:hover': { bgcolor: '#15803d', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }
                            }}>
                            Excel
                        </Button>
                        <Button variant="contained" fullWidth={false} startIcon={<PdfIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} onClick={exportPdf}
                            disabled={!hasData}
                            sx={{
                                flex: 1, py: { xs: 1, sm: 1 }, fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                bgcolor: '#dc2626', fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                                '&:hover': { bgcolor: '#b91c1c', boxShadow: '0 4px 12px rgba(220,38,38,0.4)' }
                            }}>
                            PDF
                        </Button>
                    </Box>
                </Box>

                {/* Tabs + Nav */}
                <Paper sx={{ borderRadius: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, p: { xs: 1.5, md: 0 }, px: { md: 2 }, borderBottom: { xs: 'none', md: 'none' } }}>
                            <IconButton onClick={() => tab === 0 ? goWeek(-1) : goMonth(-1)} size="small"
                                sx={{
                                    bgcolor: tab === 0 ? '#eef2ff' : '#f5f3ff', color: tab === 0 ? '#4f46e5' : '#7c3aed',
                                    '&:hover': { bgcolor: tab === 0 ? '#e0e7ff' : '#ede9fe' }
                                }}>
                                <PrevIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            </IconButton>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: { xs: 140, sm: 220 } }}>
                                <Typography sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'center', fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                                    {tab === 0 ? weekLabel : monthLabel}
                                </Typography>
                                {((tab === 0 && weekOffset !== 0) || (tab === 1 && !isCurrentMonth)) && (
                                    <Button size="small" variant="text"
                                        onClick={() => tab === 0 ? (setWeekBase(new Date()), setWeekOffset(0)) : (setSelYear(now.getFullYear()), setSelMonth(now.getMonth() + 1))}
                                        sx={{ color: tab === 0 ? '#4f46e5' : '#7c3aed', fontWeight: 600, fontSize: '0.65rem', textTransform: 'none', p: 0, minHeight: 0, mt: 0.25 }}>
                                        Back to Today
                                    </Button>
                                )}
                            </Box>
                            <IconButton
                                onClick={() => tab === 0 ? goWeek(1) : goMonth(1)}
                                disabled={tab === 0 ? weekOffset >= 0 : isCurrentMonth}
                                size="small"
                                sx={{
                                    bgcolor: tab === 0 ? '#eef2ff' : '#f5f3ff', color: tab === 0 ? '#4f46e5' : '#7c3aed',
                                    '&:hover': { bgcolor: tab === 0 ? '#e0e7ff' : '#ede9fe' }
                                }}>
                                <NextIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            </IconButton>
                        </Box>

                        <Tabs value={tab} onChange={(_, v) => setTab(v)}
                            variant="fullWidth"
                            sx={{
                                borderBottom: { xs: '1px solid #f1f5f9', md: 'none' },
                                borderLeft: { xs: 'none', md: '1px solid #f1f5f9' },
                                '& .MuiTab-root': { fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' }, py: { xs: 1.25, md: 1.8 }, px: { xs: 1, md: 3 }, minHeight: { xs: 44, sm: 48 } },
                                '& .Mui-selected': { color: '#4f46e5' },
                                '& .MuiTabs-indicator': { bgcolor: '#4f46e5', height: { xs: 2, sm: 3 } }
                            }}>
                            <Tab icon={<WeekIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />} iconPosition="start" label="Weekly" />
                            <Tab icon={<MonthIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />} iconPosition="start" label="Monthly" />
                        </Tabs>
                    </Box>
                </Paper>

                {/* Summary Cards */}
                {!loading && hasData && <SummaryCards attendance={activeData.attendance} totalDays={activeData.totalDays} />}

                {/* Table */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 14 }}>
                        <CircularProgress sx={{ color: '#4f46e5' }} size={40} />
                    </Box>
                ) : !hasData ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h2" gutterBottom>🙏</Typography>
                        <Typography variant="h6" color="text.secondary">No devotees found under your account.</Typography>
                    </Paper>
                ) : (
                    <Paper sx={{ borderRadius: 3, mb: { xs: '80px', sm: 0 }, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        {tab === 0 ? <WeeklyView data={weeklyData} /> : <MonthlyView data={monthlyData} />}

                        {/* Legend */}
                        <Box sx={{
                            px: 3, py: 1.5, pb: { xs: '86px', sm: 1.5 }, bgcolor: '#f8faff', borderTop: '1px solid #e8ecf8',
                            display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center'
                        }}>
                            {[
                                { color: '#16a34a', bg: '#dcfce7', border: '#86efac', label: 'Submitted' },
                                { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', label: 'Not submitted' },
                            ].map(item => (
                                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: item.bg, border: `1.5px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{item.label}</Typography>
                                </Box>
                            ))}
                            <Divider orientation="vertical" flexItem />
                            {[['#16a34a', '≥85% On Track'], ['#d97706', '60–84% Needs Attention'], ['#dc2626', '<60% Critical']].map(([c, l]) => (
                                <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />
                                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>{l}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                )}
            </Container>
        </Box>
    );
};

export default Attendance;
