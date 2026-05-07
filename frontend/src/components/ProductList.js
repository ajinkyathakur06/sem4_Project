import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Card, CardMedia, CardContent, CardActions, Button, CircularProgress, Chip, Box, Typography, Rating, TextField, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    dispatch({ type: 'LOADING_PRODUCTS' });
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        dispatch({ type: 'FETCH_PRODUCTS', payload: data });
        setFilteredProducts(data);
      });
  }, [dispatch]);

  useEffect(() => {
    let filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (response.ok) {
        alert('Product added to cart!');
        dispatch({ type: 'LOADING_CART' });
        fetch('http://localhost:5000/api/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => dispatch({ type: 'FETCH_CART', payload: data }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' } }}>
          Explore Products
        </Typography>
        
        {/* Search and Filter Bar */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            sx={{ 
              flex: 1, 
              minWidth: { xs: '100%', sm: 'auto' },
              '& .MuiInputBase-root': {
                minHeight: '44px'
              }
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: '150px' },
              '& .MuiInputBase-root': {
                minHeight: '44px'
              }
            }}
          >
            <MenuItem value="latest">Latest</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
          </TextField>
        </Box>
      </Box>

      {/* Products Grid - Amazon/Flipkart Style */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
        {filteredProducts.map(product => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card 
              sx={{ 
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
              {/* Product Image */}
              <CardMedia
                sx={{
                  height: { xs: 150, sm: 180, md: 200 },
                  bgcolor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => handleViewDetails(product.id)}
              >
                <Box sx={{ fontSize: { xs: 32, sm: 40, md: 48 }, color: '#ccc' }}>📦</Box>
                {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                  <Chip 
                    label="Limited Stock" 
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#ff9800', color: 'white' }}
                  />
                )}
                {product.stock_quantity === 0 && (
                  <Chip 
                    label="Out of Stock" 
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#f44336', color: 'white' }}
                  />
                )}
              </CardMedia>

              {/* Product Info */}
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    cursor: 'pointer',
                    '&:hover': { color: '#1976d2' }
                  }}
                  onClick={() => handleViewDetails(product.id)}
                >
                  {product.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                  {product.description?.substring(0, 60)}...
                </Typography>

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Rating value={4} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">(128)</Typography>
                </Box>

                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ₹{product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    ₹{(product.price * 1.2).toFixed(2)}
                  </Typography>
                  <Chip label="16% OFF" size="small" sx={{ bgcolor: '#ff5252', color: 'white' }} />
                </Box>

                {/* Stock Info */}
                <Typography variant="body2" sx={{ color: product.stock_quantity > 0 ? '#388e3c' : '#d32f2f', fontWeight: 500 }}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </Typography>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ pt: 1, gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock_quantity === 0}
                  sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#fb8c00' } }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FavoriteBorderIcon />}
                  sx={{ minWidth: 'auto' }}
                >
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProductList;