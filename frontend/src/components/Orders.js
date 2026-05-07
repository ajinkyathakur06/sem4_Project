import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Card, CardContent, Chip, Box, CircularProgress, Grid } from '@mui/material';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.orders);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch({ type: 'LOADING_ORDERS' });
      fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => {
        const orders = Array.isArray(data) ? data : (data.orders || []);
        dispatch({ type: 'FETCH_ORDERS', payload: orders });
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        dispatch({ type: 'FETCH_ORDERS', payload: [] });
      });
    }
  }, [dispatch, isAuthenticated]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Please login to view your orders</Typography>
      </Container>
    );
  }

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Typography variant="h6" color="text.secondary">
          You haven't placed any orders yet
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map(order => (
            <Grid item xs={12} key={order.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Order #{order.id}
                    </Typography>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)} 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ordered on: {new Date(order.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total: ₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount?.toFixed(2)}
                  </Typography>

                  {order.items && order.items.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Items:
                      </Typography>
                      {order.items.map((item, index) => (
                        <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                          {item.name} (x{item.quantity}) - ₹{typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price?.toFixed(2)}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {order.shipping_address && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Shipping Address:
                      </Typography>
                      <Typography variant="body2">
                        {(() => {
                          const addr = typeof order.shipping_address === 'string' 
                            ? JSON.parse(order.shipping_address) 
                            : order.shipping_address;
                          return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
                        })()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;