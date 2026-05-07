import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, CardActions, Button, Typography, Box, CircularProgress, Chip, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';

const ServicesList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (serviceId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/services/${serviceId}/book`);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Services & Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/seller/create-service')}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
            textTransform: 'none',
            fontWeight: 600,
            minHeight: '44px'
          }}
        >
          Create Service
        </Button>
      </Box>

      {services.length === 0 ? (
        <Alert severity="info">No services available yet. Create one to get started!</Alert>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {services.map(service => (
            <Grid item key={service.id} xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
              <Card
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: { md: 'translateY(-4px)' }
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Chip
                    label={service.category}
                    size="small"
                    sx={{ bgcolor: '#3b82f6', color: 'white', mb: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    {service.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {service.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      ₹{service.price}
                    </Typography>
                    <Chip label={`${service.duration_minutes} min`} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ⏰ {service.start_time} - {service.end_time}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Slot Interval: {service.slot_interval_minutes} min
                  </Typography>
                </CardContent>

                <CardActions sx={{ pt: 1, gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleBookAppointment(service.id)}
                    sx={{
                      bgcolor: '#10b981',
                      '&:hover': { bgcolor: '#059669' },
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Book Appointment
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ServicesList;
