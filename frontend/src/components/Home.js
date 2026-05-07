import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';

const Home = () => {
  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
          color: 'white',
          py: { xs: 8, sm: 10, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 1, sm: 2 }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3.5rem' },
              color: '#ffffff'
            }}
          >
            Welcome to GetMarket
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4,
              opacity: 0.95,
              fontWeight: 300,
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            Where Shopping Meets Community - Discover, Connect, Share
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, justifyContent: 'center', flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
              variant="contained" 
              component={Link} 
              to="/products"
              sx={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                px: { xs: 2, sm: 4 },
                py: 1.5,
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                minHeight: '44px',
                '&:hover': { 
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              🛍️ Start Shopping
            </Button>
            <Button 
              variant="contained" 
              component={Link} 
              to="/feed"
              sx={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                px: { xs: 2, sm: 4 },
                py: 1.5,
                fontSize: { xs: '0.95rem', sm: '1.1rem' },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                minHeight: '44px',
                '&:hover': { 
                  boxShadow: '0 8px 24px rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              💬 View Feed
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            textAlign: 'center', 
            mb: 6,
            fontWeight: 'bold',
            color: '#1e40af'
          }}
        >
          Why Choose GetMarket?
        </Typography>

        <Grid container spacing={3}>
          {/* Social Features Card */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                color: 'white',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 50px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ fontSize: '3rem', mb: 2 }}>💬</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Social Features
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Post updates, like and comment, follow friends, and build your community. Share your shopping experiences and discover what others love.
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to="/feed" sx={{ color: 'white', fontWeight: 600 }}>
                  Explore Feed →
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* E-Commerce Card */}
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: 'white',
                boxShadow: '0 12px 40px rgba(6, 182, 212, 0.15)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 50px rgba(6, 182, 212, 0.3)'
                }
              }}
            >
              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ fontSize: '3rem', mb: 2 }}>🛒</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Smart Shopping
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  Browse curated products, add to cart, and complete secure purchases. Track orders and enjoy hassle-free delivery with real-time updates.
                </Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to="/products" sx={{ color: 'white', fontWeight: 600 }}>
                  Shop Now →
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ background: 'rgba(255,255,255,0.5)', py: 8, backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>✨</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Modern Design
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Beautiful, intuitive interface designed for seamless experience
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>🔒</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Secure & Safe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced security with JWT authentication and data protection
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>🚀</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Lightning Fast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Optimized performance for smooth browsing and checkout
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 3,
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 1 }}>📱</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Responsive
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Works perfectly on mobile, tablet, and desktop devices
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
            Join thousands of users shopping and connecting on GetMarket today
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              component={Link} 
              to="/register"
              sx={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                '&:hover': { 
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
                }
              }}
            >
              Create Account
            </Button>
            <Button 
              variant="contained" 
              component={Link} 
              to="/products"
              sx={{ 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                '&:hover': { 
                  boxShadow: '0 8px 24px rgba(255,255,255,0.3)'
                }
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;