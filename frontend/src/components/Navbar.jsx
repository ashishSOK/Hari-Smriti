import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    useTheme,
    useMediaQuery,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Fab,
    Tooltip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Logout as LogoutIcon,
    Groups as GroupsIcon,
    EmojiEvents as TrophyIcon,
    CalendarMonth as AttendanceIcon,
    Add as AddIcon,
    AccountCircle as ProfileIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isMentor } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Desktop nav items
    const desktopNavItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Add Entry', path: '/sadhna-entry' },
        { label: isMentor ? 'Devotees' : 'Group View', path: '/devotees' },
        ...(isMentor ? [
            { label: 'Champions Board', path: '/weekly-winner' },
            { label: 'Attendance', path: '/attendance' },
        ] : []),
    ];

    // Mobile bottom nav items (no Add Entry — FAB handles that)
    const mobileNavItems = [
        { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { label: isMentor ? 'Devotees' : 'Group', path: '/devotees', icon: <GroupsIcon /> },
        ...(isMentor ? [
            { label: 'Champions', path: '/weekly-winner', icon: <TrophyIcon /> },
            { label: 'Attendance', path: '/attendance', icon: <AttendanceIcon /> },
        ] : []),
        { label: 'Logout', path: '__logout__', icon: <LogoutIcon /> },
    ];

    const currentBottomNavValue = mobileNavItems.findIndex(
        item => item.path === location.pathname
    );

    const handleBottomNavChange = (_, idx) => {
        const item = mobileNavItems[idx];
        if (item.path === '__logout__') {
            handleLogout();
        } else {
            navigate(item.path);
        }
    };

    return (
        <>
            {/* Top AppBar */}
            <AppBar
                position="sticky"
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar sx={{ minHeight: { xs: 52, sm: 64 } }}>
                    <DashboardIcon sx={{ mr: 1.5, fontSize: { xs: 24, sm: 32 } }} />
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 700,
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                    >
                        Hari Smriti
                    </Typography>

                    {user && (
                        <>
                            {/* Desktop nav */}
                            {!isMobile && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {desktopNavItems.map((item) => (
                                        <Button
                                            key={item.path}
                                            color="inherit"
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                                                borderRadius: 0,
                                                fontWeight: location.pathname === item.path ? 600 : 400
                                            }}
                                        >
                                            {item.label}
                                        </Button>
                                    ))}
                                    {/* User Profile Badge */}
                                    <Box
                                        onClick={() => navigate('/profile')}
                                        sx={{
                                            ml: 1,
                                            px: 1.5,
                                            py: 0.75,
                                            bgcolor: location.pathname === '/profile' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                                        }}
                                    >
                                        <ProfileIcon sx={{ fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {user.name} ({isMentor ? 'Mentor' : 'Devotee'})
                                        </Typography>
                                    </Box>

                                    <Button
                                        color="inherit"
                                        onClick={handleLogout}
                                        startIcon={<LogoutIcon />}
                                        sx={{ ml: 1 }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            )}
                            {/* Mobile: tappable name chip -> Profile */}
                            {isMobile && (
                                <Box
                                    onClick={() => navigate('/profile')}
                                    sx={{
                                        px: 1.5, py: 0.5,
                                        bgcolor: location.pathname === '/profile' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        maxWidth: 120,
                                        overflow: 'hidden',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                    }}
                                >
                                    <ProfileIcon sx={{ fontSize: 16, color: 'white' }} />
                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.name.split(' ')[0]}
                                    </Typography>
                                </Box>
                            )}
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Bottom Navigation */}
            {user && isMobile && (
                <>
                    {/* FAB — floating add button */}
                    <Tooltip title="Add Sadhna Entry" placement="left">
                        <Fab
                            onClick={() => navigate('/sadhna-entry')}
                            sx={{
                                position: 'fixed',
                                bottom: 72,
                                right: 20,
                                zIndex: 1300,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                boxShadow: '0 6px 20px rgba(102,126,234,0.5)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a3d94 100%)',
                                    boxShadow: '0 8px 24px rgba(102,126,234,0.65)',
                                },
                                '&:active': { transform: 'scale(0.95)' },
                                transition: 'all 0.2s ease',
                                width: 56,
                                height: 56,
                            }}
                        >
                            <AddIcon sx={{ fontSize: 28 }} />
                        </Fab>
                    </Tooltip>

                    {/* Bottom navigation bar */}
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1200,
                            borderTop: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '16px 16px 0 0',
                            overflow: 'hidden',
                        }}
                    >
                        <BottomNavigation
                            value={currentBottomNavValue === -1 ? false : currentBottomNavValue}
                            onChange={handleBottomNavChange}
                            showLabels
                            sx={{
                                height: 62,
                                bgcolor: 'white',
                                '& .MuiBottomNavigationAction-root': {
                                    minWidth: 0,
                                    py: 1,
                                    color: '#94a3b8',
                                    fontSize: '0.65rem',
                                    '&.Mui-selected': {
                                        color: '#667eea',
                                    },
                                },
                                '& .MuiBottomNavigationAction-label': {
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    '&.Mui-selected': {
                                        fontSize: '0.65rem',
                                    },
                                },
                            }}
                        >
                            {mobileNavItems.map((item) => (
                                <BottomNavigationAction
                                    key={item.path}
                                    label={item.label}
                                    icon={item.icon}
                                    sx={item.path === '__logout__' ? {
                                        color: '#ef4444 !important',
                                        '&.Mui-selected': { color: '#ef4444 !important' }
                                    } : {}}
                                />
                            ))}
                        </BottomNavigation>
                    </Paper>

                </>
            )}
        </>
    );
};

export default Navbar;
