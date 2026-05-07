import React, { useEffect, useState } from 'react';
import { Container, Card, CardContent, Button, Typography, Box, Alert, Snackbar, TextField, CircularProgress, Grid, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const AppointmentBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Please login to book an appointment</Alert>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Container>
    );
  }

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);

    if (date) {
      setSlotLoading(true);
      try {
        // First generate slots for this date
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/services/${serviceId}/generate-slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ date })
        });

        // Then fetch available slots
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}/slots?date=${date}`);
        if (response.ok) {
          const data = await response.json();
          setSlots(data);
        }
      } catch (error) {
        setNotification({ open: true, message: 'Error loading slots: ' + error.message, type: 'error' });
      } finally {
        setSlotLoading(false);
      }
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDate) {
      setNotification({ open: true, message: 'Please select a date and time slot', type: 'error' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: serviceId,
          slot_id: selectedSlot.id,
          appointment_date: selectedDate,
          notes
        })
      });

      if (response.ok) {
        setNotification({ open: true, message: 'Appointment booked successfully!', type: 'success' });
        setTimeout(() => {
          navigate('/appointments/my-bookings');
        }, 1500);
      } else {
        const error = await response.json();
        setNotification({ open: true, message: error.error || 'Failed to book appointment', type: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: 'Error: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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

      <Card elevation={3} sx={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af', mb: 4 }}>
            📅 Book an Appointment
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Date Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon /> Select Date
              </Typography>
              <TextField
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '44px'
                  }
                }}
              />
            </Box>

            {/* Time Slots */}
            {selectedDate && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon /> Select Time Slot
                </Typography>

                {slotLoading ? (
                  <CircularProgress />
                ) : slots.length === 0 ? (
                  <Alert severity="info">No available slots for this date</Alert>
                ) : (
                  <Grid container spacing={1.5}>
                    {slots.map(slot => (
                      <Grid item xs={6} sm={4} key={slot.id}>
                        <Paper
                          onClick={() => setSelectedSlot(slot)}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: selectedSlot?.id === slot.id ? '#3b82f6' : '#f5f5f5',
                            color: selectedSlot?.id === slot.id ? 'white' : '#333',
                            border: selectedSlot?.id === slot.id ? '2px solid #3b82f6' : '1px solid #ddd',
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: 2,
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {slot.start_time.substring(0, 5)}
                          </Typography>
                          <Typography variant="caption">
                            to {slot.end_time.substring(0, 5)}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {/* Notes */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Additional Notes (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>

            {/* Selected Slot Summary */}
            {selectedSlot && (
              <Paper sx={{ p: 2, bgcolor: '#ecf0f1' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ✓ Selected: {selectedDate} from {selectedSlot.start_time.substring(0, 5)} to {selectedSlot.end_time.substring(0, 5)}
                </Typography>
              </Paper>
            )}

            {/* Book Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleBookAppointment}
              disabled={!selectedSlot || loading}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                textTransform: 'none',
                fontWeight: 600,
                minHeight: '48px',
                fontSize: '1rem',
                mt: 2
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} /> : ''}
              Confirm Booking
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AppointmentBooking;
