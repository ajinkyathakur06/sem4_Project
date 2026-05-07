import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Paper, Box, Avatar, Grid, Card, CardContent } from '@mui/material';

const Profile = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user's posts
      fetch('http://localhost:5000/api/posts/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(data => setUserPosts(data))
      .catch(err => console.error('Error fetching posts:', err));

      // Fetch user's products if seller
      if (user.role === 'seller') {
        fetch('http://localhost:5000/api/products/user', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => setUserProducts(data))
        .catch(err => console.error('Error fetching products:', err));
      }
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Please login to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            {user.first_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4">{user.first_name} {user.last_name}</Typography>
            <Typography variant="body1" color="text.secondary">{user.email}</Typography>
            <Typography variant="body2" color="primary">{user.role}</Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>My Posts</Typography>
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <Paper key={post.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="body1">{post.content}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.created_at).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No posts yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {user.role === 'seller' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>My Products</Typography>
                {userProducts.length > 0 ? (
                  userProducts.map(product => (
                    <Paper key={product.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography variant="body2">{product.description}</Typography>
                      <Typography variant="h6" color="primary">₹{product.price}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No products yet</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Profile;