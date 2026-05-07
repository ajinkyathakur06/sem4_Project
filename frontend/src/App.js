import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, Badge, Container, IconButton, Drawer, Divider } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import PostFeed from './components/PostFeed';
import CreatePost from './components/CreatePost';
import SellerDashboard from './components/SellerDashboard';
import SellerOrders from './components/SellerOrders';
import AdminDashboard from './components/AdminDashboard';
import Notifications from './components/Notifications';
import ServiceForm from './components/ServiceForm';
import ServicesList from './components/ServicesList';
import AppointmentBooking from './components/AppointmentBooking';

function App() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      fetch('http://localhost:5000/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      const interval = setInterval(() => {
        fetch('http://localhost:5000/api/notifications/unread/count', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setUnreadCount(data.unreadCount))
        .catch(() => {});
      }, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    handleClose();
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="sticky"
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1, sm: 1.5 }, px: { xs: 1, sm: 2 } }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ 
                background: 'rgba(255,255,255,0.15)',
                padding: { xs: '4px 8px', sm: '6px 12px' },
                borderRadius: '50px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  GetMarket
                </Typography>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center', flex: 1, justifyContent: 'center', mx: 2 }}>
              {isAuthenticated && (
                <>
                  <Notifications unreadCount={unreadCount} />
                  <Button 
                    color="inherit" 
                    startIcon={<ShoppingCartIcon />}
                    component={Link}
                    to="/cart"
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2
                      },
                      minHeight: '44px'
                    }}
                  >
                    <Badge badgeContent={items.length} sx={{ ml: 1 }} color="error">
                      Cart
                    </Badge>
                  </Button>
                </>
              )}
              <Button 
                color="inherit" 
                component={Link} 
                to="/feed"
                sx={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  transition: 'all 0.3s ease',
                  minHeight: '44px'
                }}
              >
                Feed
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/products"
                sx={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  transition: 'all 0.3s ease',
                  minHeight: '44px'
                }}
              >
                Shop
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/services"
                sx={{ 
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  transition: 'all 0.3s ease',
                  minHeight: '44px'
                }}
              >
                📅 Services
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, alignItems: 'center' }}>
              {isAuthenticated && <Notifications unreadCount={unreadCount} />}
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ minHeight: '44px', minWidth: '44px' }}
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Box>

            {/* Desktop User Menu */}
            {isAuthenticated ? (
              <>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Button 
                    color="inherit" 
                    onClick={handleMenu}
                    sx={{ 
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      px: 2,
                      py: 1,
                      borderRadius: '50px',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': { background: 'rgba(255,255,255,0.3)' },
                      minHeight: '44px'
                    }}
                  >
                    {user?.first_name || 'User'}
                  </Button>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      borderRadius: 2
                    }
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                    👤 Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/orders" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                    📦 My Orders
                  </MenuItem>
                  <MenuItem component={Link} to="/create-post" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                    ✍️ Create Post
                  </MenuItem>
                  {user?.role === 'seller' && (
                    <>
                      <MenuItem component={Link} to="/seller" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                        🏪 Seller Dashboard
                      </MenuItem>
                      <MenuItem component={Link} to="/seller-orders" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                        📦 Seller Orders
                      </MenuItem>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <MenuItem component={Link} to="/admin" onClick={handleClose} sx={{ fontWeight: 500, minHeight: '44px' }}>
                      ⚙️ Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ fontWeight: 500, color: '#d32f2f', minHeight: '44px' }}>
                    🚪 Logout
                  </MenuItem>
                </Menu>

                {/* Mobile Drawer */}
                <Drawer
                  anchor="top"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  sx={{ display: { xs: 'block', md: 'none' } }}
                >
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                      width: '100%',
                      p: { xs: 1, sm: 2 },
                      maxHeight: '90vh',
                      overflowY: 'auto'
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      width: '100%'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        Menu
                      </Typography>
                      <IconButton 
                        onClick={handleDrawerToggle} 
                        sx={{ 
                          color: 'white',
                          padding: { xs: '8px', sm: '12px' },
                          flexShrink: 0
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button 
                        fullWidth
                        component={Link} 
                        to="/feed"
                        onClick={handleDrawerToggle}
                        sx={{ 
                          color: 'white',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          fontSize: '1rem',
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        📰 Feed
                      </Button>
                      <Button 
                        fullWidth
                        component={Link} 
                        to="/products"
                        onClick={handleDrawerToggle}
                        sx={{ 
                          color: 'white',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          fontSize: '1rem',
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        🛍️ Shop
                      </Button>
                      {isAuthenticated && (
                        <>
                          <Button 
                            fullWidth
                            component={Link} 
                            to="/cart"
                            onClick={handleDrawerToggle}
                            sx={{ 
                              color: 'white',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            🛒 Cart ({items.length})
                          </Button>
                          <Button 
                            fullWidth
                            component={Link} 
                            to="/profile"
                            onClick={handleDrawerToggle}
                            sx={{ 
                              color: 'white',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            👤 Profile
                          </Button>
                          <Button 
                            fullWidth
                            component={Link} 
                            to="/orders"
                            onClick={handleDrawerToggle}
                            sx={{ 
                              color: 'white',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            📦 My Orders
                          </Button>
                          <Button 
                            fullWidth
                            component={Link} 
                            to="/create-post"
                            onClick={handleDrawerToggle}
                            sx={{ 
                              color: 'white',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            ✍️ Create Post
                          </Button>
                          <Button 
                            fullWidth
                            component={Link} 
                            to="/services"
                            onClick={handleDrawerToggle}
                            sx={{ 
                              color: 'white',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            📅 Services & Appointments
                          </Button>
                          {user?.role === 'seller' && (
                            <>
                              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                              <Button 
                                fullWidth
                                component={Link} 
                                to="/seller"
                                onClick={handleDrawerToggle}
                                sx={{ 
                                  color: 'white',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  fontSize: '1rem',
                                  py: 1.5,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                              >
                                🏪 Seller Dashboard
                              </Button>
                              <Button 
                                fullWidth
                                component={Link} 
                                to="/seller-orders"
                                onClick={handleDrawerToggle}
                                sx={{ 
                                  color: 'white',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  fontSize: '1rem',
                                  py: 1.5,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                              >
                                📦 Seller Orders
                              </Button>
                              <Button 
                                fullWidth
                                component={Link} 
                                to="/seller/create-service"
                                onClick={handleDrawerToggle}
                                sx={{ 
                                  color: 'white',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  fontSize: '1rem',
                                  py: 1.5,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                              >
                                ➕ Create Service
                              </Button>
                            </>
                          )}
                          {user?.role === 'admin' && (
                            <>
                              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                              <Button 
                                fullWidth
                                component={Link} 
                                to="/admin"
                                onClick={handleDrawerToggle}
                                sx={{ 
                                  color: 'white',
                                  textAlign: 'left',
                                  justifyContent: 'flex-start',
                                  fontSize: '1rem',
                                  py: 1.5,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                              >
                                ⚙️ Admin Dashboard
                              </Button>
                            </>
                          )}
                          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                          <Button 
                            fullWidth
                            onClick={() => { handleLogout(); handleDrawerToggle(); }}
                            sx={{ 
                              color: '#ff6b6b',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              fontSize: '1rem',
                              py: 1.5,
                              textTransform: 'none',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                          >
                            🚪 Logout
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    minHeight: '44px'
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  component={Link} 
                  to="/register"
                  sx={{ 
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                    borderRadius: '50px',
                    px: 2,
                    minHeight: '44px',
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/feed" element={<PostFeed />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller-orders" element={<SellerOrders />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/services" element={<ServicesList />} />
            <Route path="/seller/create-service" element={<ServiceForm />} />
            <Route path="/services/:serviceId/book" element={<AppointmentBooking />} />
          </Routes>
        </Box>

        {/* Modern Footer */}
        <Box 
          component="footer"
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
            color: 'white',
            py: 4,
            mt: 6,
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Container>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                GetMarket - E-Commerce Social Platform
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                © 2026 All rights reserved. Connect, Shop, Share.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
