import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent, CardActions, IconButton, Chip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const SellerDashboard = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stockQuantity: ''
    });
    setDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category || '',
      stockQuantity: product.stock_quantity
    });
    setDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    const token = localStorage.getItem('token');
    const url = editingProduct 
      ? `http://localhost:5000/api/products/${editingProduct.id}`
      : 'http://localhost:5000/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          category: productForm.category,
          stockQuantity: parseInt(productForm.stockQuantity)
        })
      });

      if (response.ok) {
        setDialogOpen(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Access denied. Seller account required.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem', md: '2.5rem' } }}>Seller Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddProduct} sx={{ minHeight: '44px' }}>
          Add Product
        </Button>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {Array.isArray(products) && products.length > 0 ? products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="primary">
                    ₹{product.price}
                  </Typography>
                  <Chip 
                    label={`Stock: ${product.stock_quantity}`} 
                    color={product.stock_quantity > 0 ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
                {product.category && (
                  <Chip label={product.category} variant="outlined" size="small" />
                )}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEditProduct(product)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteProduct(product.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="textSecondary">No products yet. Add your first product!</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={productForm.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={productForm.description}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={productForm.price}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Stock Quantity"
                name="stockQuantity"
                value={productForm.stockQuantity}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={productForm.category}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerDashboard;