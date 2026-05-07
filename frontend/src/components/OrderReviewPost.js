import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import ImageUploadIcon from '@mui/icons-material/CloudUpload';

const OrderReviewPost = ({ open, onClose, onSuccess }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter delivered orders only
        const deliveredOrders = data.filter(order => order.status === 'delivered');
        setOrders(deliveredOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePostReview = async () => {
    if (!selectedOrder) {
      setError('Please select an order');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a review title');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a review description');
      return;
    }

    setPosting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/posts/order-review', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          rating,
          title,
          description,
          images
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Review posted successfully!');
        setTimeout(() => {
          resetForm();
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to post review');
      }
    } catch (err) {
      console.error('Error posting review:', err);
      setError('Error posting review');
    }
    setPosting(false);
  };

  const resetForm = () => {
    setSelectedOrder(null);
    setRating(5);
    setTitle('');
    setDescription('');
    setImages([]);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1e40af' }}>
        📝 Post Order Review
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {orders.length === 0 ? (
          <Alert severity="info">
            You don't have any delivered orders yet. Complete an order to leave a review.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Order Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Select Order
              </Typography>
              <Grid container spacing={2}>
                {orders.map(order => (
                  <Grid item xs={12} key={order.id}>
                    <Paper
                      onClick={() => setSelectedOrder(order)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedOrder?.id === order.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        backgroundColor: selectedOrder?.id === order.id ? 'rgba(59, 130, 246, 0.1)' : 'white',
                        transition: 'all 0.3s',
                        '&:hover': { boxShadow: 2, borderColor: '#3b82f6' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Order #{order.id}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                            Ordered: {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {order.items?.map((item, idx) => (
                              <Chip
                                key={idx}
                                label={`${item.name} x${item.quantity}`}
                                size="small"
                                sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
                          ₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {selectedOrder && (
              <>
                {/* Rating */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Rating
                      value={rating}
                      onChange={(e, value) => setRating(value)}
                      size="large"
                      sx={{ color: '#f59e0b' }}
                    />
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {rating} / 5 stars
                    </Typography>
                  </Box>
                </Box>

                {/* Review Title */}
                <TextField
                  label="Review Title"
                  placeholder="e.g., Amazing product, highly recommend!"
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />

                {/* Review Description */}
                <TextField
                  label="Review Description"
                  placeholder="Share your experience with this product..."
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />

                {/* Image Upload */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Add Images (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageUploadIcon />}
                    sx={{
                      borderColor: '#3b82f6',
                      color: '#3b82f6',
                      textTransform: 'none',
                      '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                    }}
                  >
                    Upload Images
                    <input
                      hidden
                      accept="image/*"
                      multiple
                      type="file"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {images.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      {images.map((img, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={img}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#6b7280' }}>
          Cancel
        </Button>
        <Button
          onClick={handlePostReview}
          variant="contained"
          disabled={!selectedOrder || posting}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
            textTransform: 'none'
          }}
        >
          {posting ? 'Posting...' : 'Post Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderReviewPost;
