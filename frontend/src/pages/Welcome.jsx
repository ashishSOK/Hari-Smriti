import React from 'react';
import { Box, Button, Container, Typography, Grid, Paper, Stack, AppBar, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MenuBook, SelfImprovement, Favorite, Dashboard as DashboardIcon } from '@mui/icons-material';

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* ── Slim top bar ── */}
            <AppBar position="static" elevation={0} sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: 52
            }}>
                <Toolbar variant="dense" sx={{ minHeight: 52 }}>
                    <DashboardIcon sx={{ mr: 1, color: 'white', fontSize: 22 }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.3px', color: 'white', flexGrow: 1 }}>
                        Hari Smriti
                    </Typography>
                    <Button size="small" onClick={() => navigate('/login')}
                        sx={{ color: 'white', fontWeight: 600, textTransform: 'none', mr: 0.5, fontSize: '0.82rem' }}>
                        Login
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => navigate('/signup')}
                        sx={{
                            color: 'white', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 600,
                            textTransform: 'none', fontSize: '0.82rem',
                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                        }}>
                        Sign Up
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                pt: { xs: 4, md: 12 },
                pb: { xs: 8, md: 12 },
                borderRadius: { xs: '0 0 40% 5% / 0 0 5% 10%', md: '0 0 50% 10% / 0 0 10% 20%' },
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Container maxWidth="md">
                    <Stack spacing={{ xs: 1.5, md: 4 }} alignItems="center" textAlign="center">
                        <Typography variant="h2" component="h1" fontWeight="800" sx={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                            fontSize: { xs: '2.2rem', sm: '2.5rem', md: '3.5rem' },
                            lineHeight: 1.1,
                            letterSpacing: '-1px'
                        }}>
                            Hari Smriti
                        </Typography>
                        <Typography variant="h6" sx={{
                            opacity: 0.9, fontWeight: 300,
                            maxWidth: '800px',
                            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                            px: { xs: 2, md: 0 },
                            lineHeight: 1.4
                        }}>
                            Your companion for spiritual growth, guided by the timeless wisdom of ISKCON.
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1.5, sm: 2 }} pt={{ xs: 2, md: 4 }}
                            sx={{ width: { xs: '100%', sm: 'auto' }, px: { xs: 3, sm: 0 } }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#764ba2',
                                    px: { xs: 0, sm: 5 },
                                    py: { xs: 1.25, md: 1.5 },
                                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                    fontWeight: 'bold',
                                    width: { xs: '100%', sm: 'auto' },
                                    borderRadius: 3,
                                    '&:hover': { bgcolor: '#f0f0f0' }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/signup')}
                                sx={{
                                    borderColor: 'white',
                                    color: 'white',
                                    px: { xs: 0, sm: 5 },
                                    py: { xs: 1.25, md: 1.5 },
                                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                    fontWeight: '600',
                                    width: { xs: '100%', sm: 'auto' },
                                    borderRadius: 3,
                                    '&:hover': { borderColor: '#f0f0f0', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Create Account
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Features/Philosophy Section */}
            <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -8 }, mb: { xs: 3, md: 10 }, position: 'relative', zIndex: 2, px: { xs: 2, md: 3 } }}>
                <Grid container spacing={{ xs: 2, md: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{
                            p: { xs: 2.5, md: 4 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            borderRadius: { xs: 3, md: 4 },
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': { transform: 'translateY(-8px)' }
                        }}>
                            <Box sx={{
                                p: { xs: 1.5, md: 2 },
                                borderRadius: '50%',
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                mb: { xs: 1.5, md: 2 }
                            }}>
                                <MenuBook sx={{ fontSize: { xs: 28, md: 36 } }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                Bhagavad Gita
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                                Rooted in the discipline and teachings of the Bhagavad Gita, helping you regulate your daily habits.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{
                            p: { xs: 2.5, md: 4 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            borderRadius: { xs: 3, md: 4 },
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': { transform: 'translateY(-8px)' }
                        }}>
                            <Box sx={{
                                p: { xs: 1.5, md: 2 },
                                borderRadius: '50%',
                                bgcolor: '#f3e5f5',
                                color: '#9c27b0',
                                mb: { xs: 1.5, md: 2 }
                            }}>
                                <SelfImprovement sx={{ fontSize: { xs: 28, md: 36 } }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                Daily Sadhna
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                                Track your Japa, reading, and service effortlessly. Consistency is the key to spiritual advancement.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{
                            p: { xs: 2.5, md: 4 },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            borderRadius: { xs: 3, md: 4 },
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': { transform: 'translateY(-8px)' }
                        }}>
                            <Box sx={{
                                p: { xs: 1.5, md: 2 },
                                borderRadius: '50%',
                                bgcolor: '#ffebee',
                                color: '#e91e63',
                                mb: { xs: 1.5, md: 2 }
                            }}>
                                <Favorite sx={{ fontSize: { xs: 28, md: 36 } }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                                Bhakti Yoga
                            </Typography>
                            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}>
                                Cultivate devotion through structured practice under the umbrella of ISKCON values.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Footer */}
            <Box component="footer" sx={{
                py: { xs: 2.5, sm: 3 },
                px: 2,
                mt: 'auto',
                backgroundColor: '#f8fafc',
                textAlign: 'center',
                borderTop: '1px solid #e2e8f0'
            }}>
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                        © {new Date().getFullYear()} Hari Smriti. All rights reserved.
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        Hare Krishna Hare Krishna Krishna Krishna Hare Hare | Hare Rama Hare Rama Rama Rama Hare Hare
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Welcome;
