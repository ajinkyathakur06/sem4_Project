import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useSelector } from 'react-redux';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState({});
  const token = localStorage.getItem('token');
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/seller/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  if (!user) {
    return <Typography>Please log in as a seller to view orders</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af', mb: 1 }}>
          📦 My Orders
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Manage and track orders from customers
        </Typography>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '2px dashed #3b82f6'
        }}>
          <Typography variant="h6" sx={{ color: '#6b7280' }}>
            No orders yet
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(30, 64, 175, 0.1)'
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e40af' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e40af' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e40af' }}>Items</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1e40af' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e40af' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1e40af' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.05)' } }}>
                  <TableCell sx={{ color: '#1f2937', fontWeight: 500 }}>#{order.id}</TableCell>
                  <TableCell sx={{ color: '#1f2937' }}>
                    {order.first_name} {order.last_name}<br />
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {order.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#1f2937' }}>
                    {order.items && order.items.map((item, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: '#6b7280' }}>
                        {item.name} x{item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                    ₹{typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.toUpperCase()}
                      sx={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        sx={{
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e5e7eb',
                          '&:hover': {
                            borderColor: '#3b82f6'
                          }
                        }}
                      >
                        {/* Status hierarchy: pending -> confirmed -> shipped -> delivered */}
                        {order.status === 'pending' && (
                          <>
                            <MenuItem value="confirmed">✅ Confirm Order</MenuItem>
                            <MenuItem value="cancelled">❌ Cancel Order</MenuItem>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <>
                            <MenuItem value="shipped">📦 Mark as Shipped</MenuItem>
                            <MenuItem value="cancelled">❌ Cancel Order</MenuItem>
                          </>
                        )}
                        {order.status === 'shipped' && (
                          <MenuItem value="delivered">✔️ Mark as Delivered</MenuItem>
                        )}
                        {order.status === 'delivered' && (
                          <MenuItem value="delivered" disabled>✔️ Delivered (Final)</MenuItem>
                        )}
                        {order.status === 'cancelled' && (
                          <MenuItem value="cancelled" disabled>❌ Cancelled (Final)</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default SellerOrders;
