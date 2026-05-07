import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const MentionTextField = ({ value, onChange, onMentionsChange, placeholder, multiline, rows, fullWidth, variant, label, sx, maxLength = 280 }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMentions, setSelectedMentions] = useState([]);

  // Handle text change and detect @mentions
  const handleTextChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(text); // Update parent with text value
    setCursorPosition(cursorPos);

    // Find if we're typing a mention
    const lastAtSymbol = text.lastIndexOf('@', cursorPos - 1);
    if (lastAtSymbol !== -1) {
      const query = text.substring(lastAtSymbol + 1, cursorPos);
      
      // Only trigger if query contains only letters, numbers, spaces, and @ wasn't already followed by space
      if (query && !query.includes(' ') && query.length > 0) {
        setShowSuggestions(true);
        searchUsers(query);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Search for users
  const searchUsers = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(false);
  };

  // Insert mention
  const handleMentionSelect = (user) => {
    const text = value;
    const lastAtSymbol = text.lastIndexOf('@', cursorPosition - 1);
    
    if (lastAtSymbol !== -1) {
      const before = text.substring(0, lastAtSymbol);
      const after = text.substring(cursorPosition);
      const mention = `@${user.first_name} `;
      const newText = before + mention + after;
      
      onChange(newText);
      
      // Add to selected mentions
      const updatedMentions = [
        ...selectedMentions.filter(m => m.id !== user.id),
        { id: user.id, name: `${user.first_name} ${user.last_name}` }
      ];
      setSelectedMentions(updatedMentions);
      
      // Notify parent about selected mentions
      if (onMentionsChange) {
        onMentionsChange(updatedMentions);
      }
    }

    setShowSuggestions(false);
    setSuggestions([]);
    
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) {
      setAnchorEl(inputRef.current);
    }
  }, [showSuggestions, suggestions]);

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        ref={inputRef}
        value={value}
        onChange={handleTextChange}
        label={label}
        placeholder={placeholder}
        multiline={multiline}
        rows={rows}
        fullWidth={fullWidth}
        variant={variant || 'outlined'}
        sx={{
          ...sx,
          '& .MuiOutlinedInput-input': {
            resize: 'vertical',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'inherit'
          },
          '& .MuiTextField-root': {
            width: '100%'
          }
        }}
        margin="normal"
        helperText={`${value.length}/${maxLength} characters`}
        inputProps={{ maxLength }}
      />

      {/* Mention Suggestions Popper */}
      <Popper
        open={showSuggestions && (suggestions.length > 0 || loading)}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <Paper sx={{
          width: { xs: 'calc(100vw - 40px)', sm: 300 },
          maxWidth: 300,
          maxHeight: { xs: 250, sm: 300 },
          overflow: 'auto',
          border: '1px solid #e5e7eb',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {suggestions.length > 0 ? (
                suggestions.map((user, idx) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleMentionSelect(user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32, fontSize: '0.8rem' }}>
                          {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            @{user.first_name}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    No users found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Paper>
      </Popper>

      {/* Selected Mentions Display */}
      {selectedMentions.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#6b7280', 
              display: 'block', 
              mb: 0.5,
              fontSize: { xs: '0.75rem', sm: '0.8rem' }
            }}
          >
            Mentioning:
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            width: '100%'
          }}>
            {selectedMentions.map((mention, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 1,
                  border: '1px solid #3b82f6',
                  minWidth: 0,
                  overflow: 'hidden'
                }}
              >
                <PersonIcon sx={{ fontSize: '0.9rem', color: '#3b82f6', flexShrink: 0 }} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1e40af',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                  }}
                >
                  @{mention.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MentionTextField;
