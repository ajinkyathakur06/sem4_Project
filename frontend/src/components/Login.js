import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Paper, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        alert('Login failed: ' + response.statusText);
        return;
      }
      
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
        navigate('/');
      } else {
        alert('Login failed: Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Connection error. Backend server may not be running.');
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      px: { xs: 1, sm: 2 }
    }}>
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold',
                color: '#1e40af',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your GetMarket account
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: '44px',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: '44px',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                minHeight: '44px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.05rem',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              Sign In
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link 
                  to="/register"
                  style={{ 
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;