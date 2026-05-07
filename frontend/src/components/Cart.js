import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Card, CardContent, Button, Grid, Box, TextField, IconButton, CircularProgress, CardActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, loading } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch({ type: 'LOADING_CART' });
      fetch('http://localhost:5000/api/cart', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => dispatch({ type: 'FETCH_CART', payload: data }));
    }
  }, [dispatch, isAuthenticated]);

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        dispatch({ type: 'UPDATE_CART_ITEM', payload: { itemId, quantity } });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Please login to view your cart</Typography>
      </Container>
    );
  }

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', py: 4 }}>
      <Container sx={{ mt: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Typography 
          variant="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: '#1e40af',
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' }
          }}
        >
          🛒 Shopping Cart
        </Typography>

        {items.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              px: { xs: 2, sm: 4 },
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
              Add some amazing products to get started!
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/products')}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: '44px'
              }}
            >
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <>
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
              <Grid item xs={12} lg={8}>
                {items.map(item => (
                  <Card
                    key={item.id}
                    sx={{
                      mb: 2,
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                        transform: { md: 'translateY(-2px)' }
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₹{item.price} each
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              background: '#f5f5f5',
                              borderRadius: 1,
                              p: 0.5
                            }}
                          >
                            <Button
                              size="small"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              sx={{ minWidth: 32, p: 0.5 }}
                            >
                              −
                            </Button>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                              inputProps={{ min: 1, style: { textAlign: 'center', width: '40px' } }}
                              variant="standard"
                              sx={{ mx: 1 }}
                            />
                            <Button
                              size="small"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              sx={{ minWidth: 32, p: 0.5 }}
                            >
                              +
                            </Button>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3b82f6', minWidth: '100px', textAlign: 'right' }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          <IconButton 
                            onClick={() => handleRemoveItem(item.id)} 
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
                    position: 'sticky',
                    top: 100
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                      Order Summary
                    </Typography>
                    {items.map(item => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, opacity: 0.9 }}>
                        <Typography variant="body2">
                          {item.name} (×{item.quantity})
                        </Typography>
                        <Typography variant="body2">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', pt: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Subtotal:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{total.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Shipping:</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>FREE</Typography>
                      </Box>
                      <Box sx={{ background: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>₹{total.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ pt: 2, px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleCheckout}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        py: 1.5,
                        borderRadius: '50px',
                        '&:hover': {
                          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                        }
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Cart;