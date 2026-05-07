import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputAdornment
} from '@mui/material';
import { useSelector } from 'react-redux';
import ImageUploadIcon from '@mui/icons-material/CloudUpload';

const SellerProductPost = ({ open, onClose, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promotionText, setPromotionText] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (open) {
      fetchSellerProducts();
    }
  }, [open]);

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load your products');
    }
    setLoading(false);
  };

  const handlePostPromotion = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }
    if (!promotionText.trim()) {
      setError('Please enter promotion text');
      return;
    }

    setPosting(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/posts/product-promo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          promotionText,
          discountPercentage: parseFloat(discountPercentage) || 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Product promotion posted successfully!');
        setTimeout(() => {
          resetForm();
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to post promotion');
      }
    } catch (err) {
      console.error('Error posting promotion:', err);
      setError('Error posting promotion');
    }
    setPosting(false);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setPromotionText('');
    setDiscountPercentage(0);
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
        📢 Promote Your Product
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {products.length === 0 ? (
          <Alert severity="info">
            You don't have any products yet. Create a product first to promote it.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Product Selection */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Select Product to Promote
              </Typography>
              <Grid container spacing={2}>
                {products.map(product => (
                  <Grid item xs={12} key={product.id}>
                    <Paper
                      onClick={() => setSelectedProduct(product)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedProduct?.id === product.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        backgroundColor: selectedProduct?.id === product.id ? 'rgba(59, 130, 246, 0.1)' : 'white',
                        transition: 'all 0.3s',
                        '&:hover': { boxShadow: 2, borderColor: '#3b82f6' }
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Product Image */}
                        {product.images && JSON.parse(product.images)?.[0] && (
                          <Grid item xs={3} sm={2}>
                            <Box
                              component="img"
                              src={JSON.parse(product.images)[0]}
                              sx={{
                                width: '100%',
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                          </Grid>
                        )}
                        {/* Product Details */}
                        <Grid item xs={product.images ? 9 : 12} sm={product.images ? 10 : 12}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                                {product.description?.substring(0, 100)}...
                              </Typography>
                              <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 'bold' }}>
                                  ₹{product.price}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                  Stock: {product.stock_quantity}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {selectedProduct && (
              <>
                {/* Promotion Text */}
                <TextField
                  label="Promotion Message"
                  placeholder="E.g., Special offer! Get this amazing product at an unbeatable price. Limited time only!"
                  fullWidth
                  multiline
                  rows={3}
                  value={promotionText}
                  onChange={(e) => setPromotionText(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                  helperText="Write a compelling message to attract customers"
                />

                {/* Discount Percentage */}
                <TextField
                  label="Discount Percentage (Optional)"
                  type="number"
                  inputProps={{ min: 0, max: 100, step: 0.5 }}
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#3b82f6' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                />

                {/* Preview */}
                <Card sx={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid #e5e7eb' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Preview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {selectedProduct.images && JSON.parse(selectedProduct.images)?.[0] && (
                        <Box
                          component="img"
                          src={JSON.parse(selectedProduct.images)[0]}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedProduct.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                          ₹{selectedProduct.price}
                          {discountPercentage > 0 && (
                            <>
                              {' → '}
                              <Typography component="span" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                                ₹{(selectedProduct.price * (1 - discountPercentage / 100)).toFixed(2)}
                              </Typography>
                              {' '}
                              <Typography component="span" sx={{ color: '#ef4444' }}>
                                -{discountPercentage}%
                              </Typography>
                            </>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 2, color: '#4b5563' }}>
                      {promotionText}
                    </Typography>
                  </CardContent>
                </Card>
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
          onClick={handlePostPromotion}
          variant="contained"
          disabled={!selectedProduct || posting}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
            textTransform: 'none'
          }}
        >
          {posting ? 'Posting...' : 'Post Promotion'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellerProductPost;
