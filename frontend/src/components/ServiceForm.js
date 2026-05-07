import React, { useState } from 'react';
import { Box, Button, TextField, Container, Typography, Paper, Dialog, Alert, Snackbar, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ServiceForm = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Consulting',
    duration_minutes: 60,
    start_time: '09:00',
    end_time: '21:00',
    slot_interval_minutes: 60
  });
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ open: true, message: 'Service created successfully!', type: 'success' });
        setTimeout(() => {
          navigate('/seller/services');
        }, 1500);
      } else {
        const error = await response.json();
        setNotification({ open: true, message: error.error || 'Failed to create service', type: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Error: ' + error.message, type: 'error' });
    }
  };

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Only sellers can create services. Please upgrade to seller account.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 1, sm: 2 } }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)' }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1e40af', mb: 4 }}>
          Create a New Service
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            fullWidth
            placeholder="e.g., Web Design Consultation"
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '44px'
              }
            }}
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            placeholder="Describe your service..."
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '120px'
              }
            }}
          />

          <TextField
            label="Price (₹)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            fullWidth
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '44px'
              }
            }}
          />

          <TextField
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: '44px'
              }
            }}
          >
            <MenuItem value="Consulting">Consulting</MenuItem>
            <MenuItem value="Design">Design</MenuItem>
            <MenuItem value="Development">Development</MenuItem>
            <MenuItem value="Photography">Photography</MenuItem>
            <MenuItem value="Writing">Writing</MenuItem>
            <MenuItem value="Marketing">Marketing</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e40af', mt: 2 }}>
            Appointment Schedule
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Start Time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px'
                }
              }}
            />
            <TextField
              label="End Time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px'
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Service Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={handleChange}
              inputProps={{ min: '15', step: '15' }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px'
                }
              }}
            />
            <TextField
              label="Slot Interval (minutes)"
              name="slot_interval_minutes"
              type="number"
              value={formData.slot_interval_minutes}
              onChange={handleChange}
              inputProps={{ min: '15', step: '15' }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px'
                }
              }}
            />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            💡 Tip: Set working hours (e.g., 9 AM to 9 PM), service duration (default 1 hour), and slot interval to auto-generate appointment slots.
            For example: 9 AM to 9 PM with 1-hour intervals creates slots at 9 AM, 10 AM, 11 AM, etc.
          </Typography>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              minHeight: '44px',
              fontSize: '1rem'
            }}
          >
            Create Service
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ServiceForm;
