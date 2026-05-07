import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Divider,
  Container
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';

const Notifications = ({ unreadCount }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications();
    }
  }, [anchorEl]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: 1 } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'share': return '↗️';
      case 'order': return '📦';
      default: return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'like': return '#f59e0b';
      case 'comment': return '#3b82f6';
      case 'share': return '#8b5cf6';
      case 'order': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <>
      <IconButton 
        onClick={handleOpen}
        sx={{
          color: '#1e40af',
          '&:hover': {
            backgroundColor: 'rgba(30, 64, 175, 0.08)'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '350px',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(30, 64, 175, 0.1)'
          }
        }}
      >
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #0891b2 100%)' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        
        {loading ? (
          <MenuItem sx={{ justifyContent: 'center', color: '#6b7280' }}>
            Loading...
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem sx={{ justifyContent: 'center', color: '#6b7280', py: 3 }}>
            No notifications yet
          </MenuItem>
        ) : (
          notifications.map((notif, index) => (
            <Box key={notif.id}>
              <MenuItem
                onClick={() => markAsRead(notif.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  backgroundColor: notif.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  borderLeft: `3px solid ${getTypeColor(notif.type)}`,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>
                    {getNotificationIcon(notif.type)}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af', mt: 0.5, display: 'block' }}>
                      {new Date(notif.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {!notif.is_read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6',
                        mt: 1
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
              {index < notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Menu>
    </>
  );
};

export default Notifications;
