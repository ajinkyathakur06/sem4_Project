import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Typography, Paper, Box, Button, Grid, Card, CardContent, CardActions, Snackbar, Alert } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import OrderReviewPost from './OrderReviewPost';
import SellerProductPost from './SellerProductPost';
import MentionTextField from './MentionTextField';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [showOrderReview, setShowOrderReview] = useState(false);
  const [showProductPromo, setShowProductPromo] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const { isAuthenticated } = useSelector(state => state.auth);
  const user = useSelector(state => state.auth.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        content,
        mentions: mentionedUsers // Pass the actual user objects
      })
    });
    if (response.ok) {
      setNotification({ open: true, message: 'Post created successfully!', type: 'success' });
      setContent('');
      setMentionedUsers([]);
    } else {
      setNotification({ open: true, message: 'Failed to create post', type: 'error' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Please login to create a post</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ pb: 4, px: { xs: 1, sm: 2 } }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mt: 2, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)',
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          component="h1" 
          variant="h5" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#1e40af',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Share Your Experience
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <MentionTextField
            value={content}
            onChange={setContent}
            onMentionsChange={setMentionedUsers}
            label="What's on your mind? (Type @ to mention someone)"
            multiline
            rows={5}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minHeight: { xs: '140px', sm: '160px' },
                '&:hover fieldset': { borderColor: '#3b82f6' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              },
              '& .MuiOutlinedInput-input': {
                resize: 'vertical',
                maxHeight: '400px',
                overflowY: 'auto'
              }
            }}
          />
          {mentionedUsers.length > 0 && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: 'rgba(59, 130, 246, 0.05)', 
              borderRadius: 1,
              overflowX: 'auto'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#3b82f6', 
                  fontWeight: 600,
                  display: 'block',
                  wordBreak: 'break-word'
                }}
              >
                👥 Mentioning: {mentionedUsers.map(u => `@${u.name}`).join(', ')}
              </Typography>
            </Box>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              minHeight: { xs: '40px', sm: '44px' },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Post
          </Button>
        </Box>

        {/* Special Post Types */}
        <Box sx={{ mt: 4, pt: 4, borderTop: '2px solid rgba(59, 130, 246, 0.1)' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1e40af', 
              mb: 3,
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            ✨ Special Sharing Options
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Order Review Card */}
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '1px solid #e5e7eb',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => setShowOrderReview(true)}
              >
                <CardContent sx={{ pb: 1, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 2 }}>
                    <RateReviewIcon sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, color: '#3b82f6' }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      Post Order Review
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6b7280',
                      fontSize: { xs: '0.85rem', sm: '0.9rem' }
                    }}
                  >
                    Share your experience with a product you purchased. Help others make informed decisions with your honest reviews and ratings.
                  </Typography>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button 
                    size="small" 
                    sx={{ 
                      color: '#3b82f6', 
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }}
                  >
                    Share Review →
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Product Promotion Card */}
            {user?.role === 'seller' && (
              <Grid item xs={12} sm={6}>
                <Card 
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid #e5e7eb',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => setShowProductPromo(true)}
                >
                  <CardContent sx={{ pb: 1, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, color: '#10b981' }} />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: '#1f2937',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        Promote Your Product
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280',
                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                      }}
                    >
                      Showcase your products and reach more customers. Post promotions, special offers, and product highlights to boost sales.
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0 }}>
                    <Button 
                      size="small" 
                      sx={{ 
                        color: '#10b981', 
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      Promote Now →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* Dialogs */}
      <OrderReviewPost 
        open={showOrderReview}
        onClose={() => setShowOrderReview(false)}
        onSuccess={() => setNotification({ open: true, message: 'Review posted! Your feedback helps the community.', type: 'success' })}
      />
      <SellerProductPost 
        open={showProductPromo}
        onClose={() => setShowProductPromo(false)}
        onSuccess={() => setNotification({ open: true, message: 'Product promotion posted!', type: 'success' })}
      />
    </Container>
  );
};

export default CreatePost;