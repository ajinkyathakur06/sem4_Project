import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, CardHeader, CardContent, CardActions, Avatar, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemAvatar, ListItemText, Divider, Button, Typography, Paper, Chip, Rating, Grid, Link } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';
import VerifiedIcon from '@mui/icons-material/Verified';

// Helper function to render content with mention links
const renderMentionedContent = (content) => {
  if (!content) return content;
  
  const mentionRegex = /(@\w+)/g;
  const parts = content.split(mentionRegex);
  
  return parts.map((part, idx) => {
    if (mentionRegex.test(part)) {
      // This is a mention
      return (
        <Link
          key={idx}
          href="#"
          sx={{
            color: '#3b82f6',
            fontWeight: 600,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
              color: '#0891b2'
            }
          }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

const PostFeed = () => {
  const dispatch = useDispatch();
  const { posts, comments, loading } = useSelector(state => state.posts);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [commentDialog, setCommentDialog] = useState({ open: false, postId: null });
  const [commentText, setCommentText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [filterType, setFilterType] = useState('all'); // all, order_review, product_promo

  useEffect(() => {
    dispatch({ type: 'LOADING_POSTS' });
    fetch('http://localhost:5000/api/posts')
      .then(res => res.json())
      .then(data => dispatch({ type: 'FETCH_POSTS', payload: data }));
  }, [dispatch]);

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    setCommentDialog({ open: true, postId });
    if (!comments[postId]) {
      fetch(`http://localhost:5000/api/posts/${postId}/comments`)
        .then(res => res.json())
        .then(data => dispatch({ type: 'FETCH_COMMENTS', payload: { postId, comments: data } }));
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${commentDialog.postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });

      if (response.ok) {
        const result = await response.json();
        const newComment = {
          id: result.id,
          post_id: commentDialog.postId,
          user_id: user.id,
          content: commentText,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: new Date().toISOString()
        };
        dispatch({ type: 'ADD_COMMENT', payload: { postId: commentDialog.postId, comment: newComment } });
        setCommentText('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleShare = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to share posts');
      return;
    }
    alert('Sharing post!');
  };

  const handleCloseCommentDialog = () => {
    setCommentDialog({ open: false, postId: null });
    setCommentText('');
  };

  const getPostTypeColor = (type) => {
    switch(type) {
      case 'order_review': return { bg: 'rgba(59, 130, 246, 0.05)', border: '#3b82f6', icon: '⭐' };
      case 'product_promo': return { bg: 'rgba(16, 185, 129, 0.05)', border: '#10b981', icon: '📢' };
      default: return { bg: 'rgba(75, 85, 99, 0.05)', border: '#4b5563', icon: '💬' };
    }
  };

  const filteredPosts = posts && filterType === 'all' 
    ? posts 
    : posts?.filter(post => (post.post_type || 'social') === filterType);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Container maxWidth="sm" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          What's New
        </Typography>
        
        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          <Chip
            label="All Posts"
            onClick={() => setFilterType('all')}
            variant={filterType === 'all' ? 'filled' : 'outlined'}
            sx={{
              background: filterType === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)' : 'transparent',
              color: filterType === 'all' ? 'white' : '#4b5563',
              fontWeight: 600
            }}
          />
          <Chip
            label="⭐ Reviews"
            onClick={() => setFilterType('order_review')}
            variant={filterType === 'order_review' ? 'filled' : 'outlined'}
            sx={{
              background: filterType === 'order_review' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: filterType === 'order_review' ? '#1e40af' : '#4b5563',
              fontWeight: 600
            }}
          />
          <Chip
            label="📢 Promotions"
            onClick={() => setFilterType('product_promo')}
            variant={filterType === 'product_promo' ? 'filled' : 'outlined'}
            sx={{
              background: filterType === 'product_promo' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: filterType === 'product_promo' ? '#047857' : '#4b5563',
              fontWeight: 600
            }}
          />
        </Box>
      </Box>

      {/* Feed Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const postType = post.post_type || 'social';
            const typeStyle = getPostTypeColor(postType);
            
            return (
              <Card 
                key={post.id}
                sx={{ 
                  mb: 2,
                  transition: 'all 0.3s ease',
                  border: `1px solid ${typeStyle.border}`,
                  background: typeStyle.bg,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Post Header with User Info */}
                <CardHeader
                  avatar={
                    <Avatar 
                      src={post.profile_pic}
                      sx={{ 
                        bgcolor: '#1976d2',
                        cursor: 'pointer',
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 }
                      }}
                    >
                      {post.first_name?.charAt(0) || 'U'}
                    </Avatar>
                  }
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {post.first_name} {post.last_name}
                      </Typography>
                      {postType === 'order_review' && (
                        <Chip label="Verified Purchase" size="small" icon={<VerifiedIcon />} sx={{ height: '20px', fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  }
                  subheader={
                    <Typography variant="caption" sx={{ color: '#65676b' }}>
                      {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                    </Typography>
                  }
                />

                {/* Post Content */}
                <CardContent sx={{ pb: 1 }}>
                  {/* Post Type Badge */}
                  {postType !== 'social' && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={postType === 'order_review' ? '⭐ Order Review' : '📢 Product Promotion'}
                        size="small"
                        sx={{
                          background: postType === 'order_review' 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  )}

                  {/* Rating for Order Reviews */}
                  {postType === 'order_review' && post.rating && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={post.rating} readOnly size="small" sx={{ color: '#f59e0b' }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        {post.rating}/5 Stars
                      </Typography>
                    </Box>
                  )}

                  {/* Main Content */}
                  <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, fontWeight: postType !== 'social' ? 600 : 400 }}>
                    {renderMentionedContent(post.content)}
                  </Typography>

                  {/* Review Details */}
                  {postType === 'order_review' && post.review && (
                    <Paper sx={{ p: 1.5, bgcolor: 'rgba(245, 158, 11, 0.05)', mb: 1.5, borderRadius: 1, border: '1px solid #fcd34d' }}>
                      <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 600, mb: 0.5 }}>
                        📋 Review Details
                      </Typography>
                      {post.review.title && (
                        <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>
                          <strong>Title:</strong> {post.review.title}
                        </Typography>
                      )}
                      {post.review.description && (
                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                          {post.review.description}
                        </Typography>
                      )}
                      {post.review.verified_purchase && (
                        <Chip 
                          label="✓ Verified Purchase" 
                          size="small" 
                          sx={{ mt: 1, bgcolor: '#dcfce7', color: '#166534' }}
                        />
                      )}
                    </Paper>
                  )}

                  {/* Promotion Details */}
                  {postType === 'product_promo' && post.promotion && (
                    <Paper sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.05)', mb: 1.5, borderRadius: 1, border: '1px solid #86efac' }}>
                      <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 600, mb: 0.5 }}>
                        🎯 Promotion Details
                      </Typography>
                      {post.promotion.promotion_text && (
                        <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>
                          {post.promotion.promotion_text}
                        </Typography>
                      )}
                      {post.promotion.discount_percentage > 0 && (
                        <Chip 
                          label={`🏷️ ${post.promotion.discount_percentage}% OFF`}
                          sx={{ 
                            mt: 0.5,
                            bgcolor: '#fecaca',
                            color: '#991b1b',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Paper>
                  )}

                  {/* Images for Reviews/Promos */}
                  {post.images && (
                    <Grid container spacing={1} sx={{ mt: 1, mb: 1.5 }}>
                      {(Array.isArray(post.images) ? post.images : JSON.parse(post.images || '[]')).slice(0, 3).map((img, idx) => (
                        <Grid item xs={6} sm={4} key={idx}>
                          <Box
                            component="img"
                            src={img}
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* Product Reference for Promotions and Reviews */}
                  {post.product_info && (
                    <Paper sx={{ p: 1.5, bgcolor: 'rgba(59, 130, 246, 0.05)', mt: 1.5, borderRadius: 1, border: '1px solid #93c5fd' }}>
                      <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 600, mb: 0.5 }}>
                        📦 {postType === 'product_promo' ? 'Product Details' : 'Reviewed Product'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 500 }}>
                        {post.product_info.name}
                      </Typography>
                      {post.product_info.price && (
                        <Typography variant="body2" sx={{ color: '#1e40af', fontWeight: 'bold', mt: 0.5 }}>
                          ₹{typeof post.product_info.price === 'number' ? post.product_info.price.toFixed(2) : post.product_info.price}
                        </Typography>
                      )}
                      {postType === 'product_promo' && post.promotion?.discount_percentage > 0 && (
                        <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold', mt: 0.3 }}>
                          -{post.promotion.discount_percentage}% OFF
                        </Typography>
                      )}
                    </Paper>
                  )}
                </CardContent>

                {/* Engagement Stats */}
                <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${typeStyle.border}`, borderBottom: `1px solid ${typeStyle.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#65676b', fontSize: '0.875rem' }}>
                    <Typography variant="body2">
                      {post.likes_count || 0} Likes
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant="body2">
                        {post.comments_count || 0} Comments
                      </Typography>
                      <Typography variant="body2">
                        {post.shares_count || 0} Shares
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <CardActions sx={{ pt: 1, pb: 1, justifyContent: 'space-around' }}>
                  <Button 
                    size="small"
                    onClick={() => handleLike(post.id)}
                    sx={{ 
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      color: likedPosts.has(post.id) ? '#e74c3c' : '#65676b',
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                    }}
                  >
                    {likedPosts.has(post.id) ? (
                      <FavoriteIcon sx={{ mr: 0.5 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ mr: 0.5 }} />
                    )}
                    Like
                  </Button>

                  <Button 
                    size="small"
                    onClick={() => handleComment(post.id)}
                    sx={{ 
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      color: '#65676b',
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                    }}
                  >
                    <CommentIcon sx={{ mr: 0.5 }} />
                    Comment
                  </Button>

                  <Button 
                    size="small"
                    onClick={() => handleShare(post.id)}
                    sx={{ 
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      color: '#65676b',
                      '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' }
                    }}
                  >
                    <ShareIcon sx={{ mr: 0.5 }} />
                    Share
                  </Button>
                </CardActions>
              </Card>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No {filterType !== 'all' ? filterType.replace('_', ' ') : ''} posts yet.
              {filterType === 'order_review' && ' Share your order experiences!'}
              {filterType === 'product_promo' && ' Check back for seller promotions!'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Comment Dialog */}
      <Dialog open={commentDialog.open} onClose={handleCloseCommentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          {/* Comments List */}
          {comments[commentDialog.postId] && comments[commentDialog.postId].length > 0 && (
            <Box sx={{ mb: 2 }}>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {comments[commentDialog.postId].map((comment, idx) => (
                  <div key={idx}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                          {comment.first_name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${comment.first_name} ${comment.last_name}`}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#000', mb: 0.5 }}>{comment.content}</Typography>
                            <Typography variant="caption" sx={{ color: '#999' }}>
                              {new Date(comment.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < comments[commentDialog.postId].length - 1 && <Divider />}
                  </div>
                ))}
              </List>
            </Box>
          )}

          {/* Comment Input */}
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button 
            onClick={handleCommentSubmit} 
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)' }}
            disabled={!commentText.trim()}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostFeed;
