const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
// For now, use app directly instead of http.createServer with socket.io
// const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin auth middleware
const adminAuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    
    // Fetch user from database to check role
    db.query('SELECT role FROM users WHERE id = ?', [user.id], (dbErr, results) => {
      if (dbErr || !results || results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (results[0].role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      req.user = user;
      next();
    });
  });
};

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  db.query('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: results[0] });
  });
});

// Search users for mentions
app.get('/api/users/search', (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) return res.json([]);
  
  db.query(
    'SELECT id, first_name, last_name, CONCAT(first_name, " ", last_name) as full_name FROM users WHERE (first_name LIKE ? OR last_name LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ?) LIMIT 10',
    [`%${q}%`, `%${q}%`, `%${q}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results || []);
    }
  );
});

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, firstName, lastName], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User registered' });
    });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    const { password_hash, google_id, ...userWithoutSensitiveData } = user;
    res.json({ token, user: userWithoutSensitiveData });
  });
});

// Products
app.get('/api/products/user', authenticateToken, (req, res) => {
  db.query('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products WHERE is_active = 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params;
  db.query('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { name, description, price, category, stockQuantity } = req.body;
  db.query('INSERT INTO products (seller_id, name, description, price, category, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, description, price, category, stockQuantity], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    });
});

app.put('/api/products/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, stockQuantity } = req.body;
  
  // Check if user owns the product
  db.query('SELECT seller_id FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (results[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    
    db.query('UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock_quantity = ? WHERE id = ?',
      [name, description, price, category, stockQuantity, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
  });
});

app.delete('/api/products/:productId', authenticateToken, (req, res) => {
  const { productId } = req.params;
  
  // Check if user owns the product
  db.query('SELECT seller_id FROM products WHERE id = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (results[0].seller_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    
    db.query('UPDATE products SET is_active = 0 WHERE id = ?', [productId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Posts
app.get('/api/posts', (req, res) => {
  db.query(`
    SELECT p.*, u.first_name, u.last_name,
           r.id as review_id, r.title as review_title, r.description as review_description, 
           r.product_id as review_product_id, r.verified_purchase,
           pr.id as promo_id, pr.discount_percentage, pr.promotion_text,
           prod.name as product_name, prod.price as product_price, prod.images as product_images
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    LEFT JOIN reviews r ON p.id = r.post_id
    LEFT JOIN product_promotions pr ON p.id = pr.post_id
    LEFT JOIN products prod ON p.product_id = prod.id OR r.product_id = prod.id
    WHERE p.is_active = 1 
    ORDER BY p.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Process results to clean up null values
    const processedResults = results.map(post => {
      const processed = { ...post };
      // Only include review fields if they exist
      if (!processed.review_id) {
        delete processed.review_id;
        delete processed.review_title;
        delete processed.review_description;
        delete processed.review_product_id;
        delete processed.verified_purchase;
      } else {
        // Restructure review data
        processed.review = {
          id: processed.review_id,
          title: processed.review_title,
          description: processed.review_description,
          product_id: processed.review_product_id,
          verified_purchase: processed.verified_purchase
        };
        delete processed.review_id;
        delete processed.review_title;
        delete processed.review_description;
        delete processed.review_product_id;
        delete processed.verified_purchase;
      }
      
      // Only include promo fields if they exist
      if (!processed.promo_id) {
        delete processed.promo_id;
        delete processed.discount_percentage;
        delete processed.promotion_text;
      } else {
        // Restructure promo data
        processed.promotion = {
          id: processed.promo_id,
          discount_percentage: processed.discount_percentage,
          promotion_text: processed.promotion_text
        };
        delete processed.promo_id;
        delete processed.discount_percentage;
        delete processed.promotion_text;
      }
      
      // Include product info if available
      if (processed.product_name) {
        processed.product_info = {
          name: processed.product_name,
          price: processed.product_price,
          images: processed.product_images
        };
      }
      delete processed.product_name;
      delete processed.product_price;
      delete processed.product_images;
      
      return processed;
    });
    
    res.json(processedResults);
  });
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { content, productId, mentions } = req.body;
  db.query('INSERT INTO posts (user_id, content, product_id) VALUES (?, ?, ?)',
    [req.user.id, content, productId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const postId = result.insertId;
      
      // Handle mentions if any
      if (mentions && mentions.length > 0) {
        const mentionRecords = mentions.map(mention => [
          postId,
          mention.user_id,
          req.user.id,
          `${mention.first_name} ${mention.last_name}`
        ]);
        
        db.query('INSERT INTO mentions (post_id, mentioned_user_id, mentioned_by_user_id, username) VALUES ?',
          [mentionRecords], (mentionErr) => {
            if (!mentionErr) {
              // Create notifications for mentioned users
              mentions.forEach(mention => {
                if (mention.user_id !== req.user.id) {
                  db.query('SELECT first_name FROM users WHERE id = ?', [req.user.id], (err, users) => {
                    if (!err && users.length > 0) {
                      db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
                        [mention.user_id, 'mention', `${users[0].first_name} mentioned you in a post`, postId]);
                    }
                  });
                }
              });
            }
          });
      }
      
      res.json({ id: postId });
    });
});

// Get user's posts
app.get('/api/posts/user', authenticateToken, (req, res) => {
  db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Comments
app.get('/api/posts/:postId/comments', (req, res) => {
  const { postId } = req.params;
  db.query('SELECT c.*, u.first_name, u.last_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC', 
    [postId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});



// Share post
app.post('/api/posts/:postId/share', authenticateToken, (req, res) => {
  const { postId } = req.params;
  db.query('UPDATE posts SET shares_count = shares_count + 1 WHERE id = ?', [postId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // Create notification for post owner
    db.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
      if (!err && results.length > 0 && results[0].user_id !== req.user.id) {
        db.query('SELECT first_name FROM users WHERE id = ?', [req.user.id], (err, users) => {
          if (!err && users.length > 0) {
            db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
              [results[0].user_id, 'share', `${users[0].first_name} shared your post`, postId]);
          }
        });
      }
    });
    res.json({ success: true });
  });
});

// Like post
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
  const { postId } = req.params;
  db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)',
    [req.user.id, postId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      // Create notification
      db.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
        if (!err && results.length > 0 && results[0].user_id !== req.user.id) {
          db.query('SELECT first_name FROM users WHERE id = ?', [req.user.id], (err, users) => {
            if (!err && users.length > 0) {
              db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
                [results[0].user_id, 'like', `${users[0].first_name} liked your post`, postId]);
            }
          });
        }
      });
      res.json({ success: true });
    });
});

// Comment on post
app.post('/api/posts/:postId/comment', authenticateToken, (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  
  db.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, req.user.id, content], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?', [postId]);
      
      // Create notification
      db.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, results) => {
        if (!err && results.length > 0 && results[0].user_id !== req.user.id) {
          db.query('SELECT first_name FROM users WHERE id = ?', [req.user.id], (err, users) => {
            if (!err && users.length > 0) {
              db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
                [results[0].user_id, 'comment', `${users[0].first_name} commented on your post`, postId]);
            }
          });
        }
      });
      res.json({ id: result.insertId });
    });
});

// Cart endpoints
app.get('/api/cart', authenticateToken, (req, res) => {
  db.query(`
    SELECT c.*, p.name, p.price, p.images 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;
  db.query(`
    INSERT INTO cart (user_id, product_id, quantity) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `, [req.user.id, productId, quantity || 1, quantity || 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.put('/api/cart/:itemId', authenticateToken, (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  db.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', 
    [quantity, itemId, req.user.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/cart/:itemId', authenticateToken, (req, res) => {
  const { itemId } = req.params;
  db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [itemId, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Order endpoints
app.post('/api/orders', authenticateToken, (req, res) => {
  const { shippingAddress } = req.body;
  
  // Get cart items
  db.query(`
    SELECT c.*, p.price, p.stock_quantity 
    FROM cart c 
    JOIN products p ON c.product_id = p.id 
    WHERE c.user_id = ?
  `, [req.user.id], (err, cartItems) => {
    if (err) return res.status(500).json({ error: err.message });
    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    
    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    db.query('INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
      [req.user.id, totalAmount, JSON.stringify(shippingAddress), 'pending'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = result.insertId;
        
        // Create order items
        const orderItems = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
        db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
          [orderItems], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Clear cart
            db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
            
            // Update product stock
            cartItems.forEach(item => {
              db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]);
            });
            
            // Create notification for customer
            db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
              [req.user.id, 'order', 'Your order has been placed successfully', orderId]);
            
            res.json({ orderId, totalAmount });
          });
      });
  });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  db.query(`
    SELECT o.*, 
           JSON_ARRAYAGG(JSON_OBJECT('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Admin endpoints
app.get('/api/admin/users', adminAuthMiddleware, (req, res) => {
  db.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/admin/users/:userId', adminAuthMiddleware, (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/admin/products', adminAuthMiddleware, (req, res) => {
  db.query('SELECT p.*, u.first_name, u.last_name FROM products p JOIN users u ON p.seller_id = u.id ORDER BY p.created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/admin/products/:productId', adminAuthMiddleware, (req, res) => {
  const { productId } = req.params;
  const { isActive } = req.body;
  
  db.query('UPDATE products SET is_active = ? WHERE id = ?', [isActive, productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/admin/orders', adminAuthMiddleware, (req, res) => {
  db.query(`
    SELECT o.*, u.first_name, u.last_name,
           JSON_ARRAYAGG(JSON_OBJECT('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN users u ON o.user_id = u.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/admin/orders/:orderId', adminAuthMiddleware, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    // Create notification for customer
    db.query('SELECT user_id FROM orders WHERE id = ?', [orderId], (err, results) => {
      if (!err && results.length > 0) {
        const statusMessages = {
          'confirmed': 'Your order has been confirmed',
          'shipped': 'Your order has been shipped',
          'delivered': 'Your order has been delivered',
          'cancelled': 'Your order has been cancelled'
        };
        db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
          [results[0].user_id, 'order', statusMessages[status] || 'Order status updated', orderId]);
      }
    });
    res.json({ success: true });
  });
});

// Notifications endpoints
app.get('/api/notifications', authenticateToken, (req, res) => {
  db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/notifications/:notificationId/read', authenticateToken, (req, res) => {
  const { notificationId } = req.params;
  db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/notifications/unread/count', authenticateToken, (req, res) => {
  db.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ unreadCount: results[0].count });
  });
});

// Seller order management
app.get('/api/seller/orders', authenticateToken, (req, res) => {
  db.query(`
    SELECT DISTINCT o.id, o.user_id, o.status, o.total_amount, o.created_at, u.first_name, u.last_name, u.email,
           JSON_ARRAYAGG(JSON_OBJECT('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    JOIN users u ON o.user_id = u.id
    WHERE p.seller_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Status hierarchy: pending -> confirmed -> shipped -> delivered (cancelled can be done anytime)
const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

app.put('/api/seller/orders/:orderId/status', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  // Check if seller owns products in this order
  db.query(`
    SELECT DISTINCT p.seller_id, o.status as currentStatus FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.order_id = ?
  `, [orderId], (err, results) => {
    if (err || !results.some(r => r.seller_id === req.user.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check status hierarchy
    const currentStatus = results[0].currentStatus;
    if (!isValidStatusTransition(currentStatus, status)) {
      return res.status(400).json({ error: `Cannot change status from ${currentStatus} to ${status}. Invalid status transition.` });
    }
    
    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      // Create notification for customer
      db.query('SELECT user_id FROM orders WHERE id = ?', [orderId], (err, results) => {
        if (!err && results.length > 0) {
          const statusMessages = {
            'confirmed': 'Your order has been confirmed by seller',
            'shipped': 'Your order has been shipped',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled'
          };
          db.query('INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
            [results[0].user_id, 'order', statusMessages[status] || 'Order status updated', orderId]);
        }
      });
      res.json({ success: true });
    });
  });
});

// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3001",
//     methods: ["GET", "POST"]
//   }
// });

// // Socket.io for real-time notifications
// io.on('connection', (socket) => {
//   console.log('User connected');

// Order Reviews - Buyers posting reviews about orders
app.post('/api/posts/order-review', authenticateToken, (req, res) => {
  const { orderId, rating, title, description, images } = req.body;
  
  // Verify buyer owns this order
  db.query('SELECT user_id FROM orders WHERE id = ?', [orderId], (err, orders) => {
    if (err || !orders || orders.length === 0 || orders[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create post
    db.query(
      'INSERT INTO posts (user_id, content, post_type, order_id, rating, images) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, 'order_review', orderId, rating, images ? JSON.stringify(images) : null],
      (postErr, postResult) => {
        if (postErr) return res.status(500).json({ error: postErr.message });

        // Get order items to create reviews
        db.query('SELECT order_items.product_id FROM order_items WHERE order_id = ?', [orderId], (itemErr, items) => {
          if (!itemErr && items && items.length > 0) {
            // Create review for first product (main item)
            db.query(
              'INSERT INTO reviews (post_id, order_id, user_id, product_id, rating, title, description, verified_purchase) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [postResult.insertId, orderId, req.user.id, items[0].product_id, rating, title, description, true]
            );
          }
        });

        res.json({ postId: postResult.insertId, message: 'Order review posted successfully' });
      }
    );
  });
});

// Product Promotions - Sellers posting products for marketing
app.post('/api/posts/product-promo', authenticateToken, (req, res) => {
  const { productId, promotionText, discountPercentage } = req.body;

  // Verify seller owns this product
  db.query('SELECT seller_id FROM products WHERE id = ?', [productId], (err, products) => {
    if (err || !products || products.length === 0 || products[0].seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized - You must be the product owner' });
    }

    // Get product details
    db.query('SELECT name, description, images FROM products WHERE id = ?', [productId], (prodErr, prodDetails) => {
      if (prodErr) return res.status(500).json({ error: prodErr.message });

      const product = prodDetails[0];
      const postContent = promotionText || `Check out my new product: ${product.name}`;

      // Create post
      db.query(
        'INSERT INTO posts (user_id, content, product_id, post_type, images) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, postContent, productId, 'product_promo', product.images],
        (postErr, postResult) => {
          if (postErr) return res.status(500).json({ error: postErr.message });

          // Create product promotion record
          db.query(
            'INSERT INTO product_promotions (post_id, seller_id, product_id, promotion_text, discount_percentage) VALUES (?, ?, ?, ?, ?)',
            [postResult.insertId, req.user.id, productId, promotionText || product.description, discountPercentage || 0]
          );

          res.json({ postId: postResult.insertId, message: 'Product promotion posted successfully' });
        }
      );
    });
  });
});

// Get posts with filtering by type
app.get('/api/posts/filter/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = ['social', 'order_review', 'product_promo'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid post type' });
  }

  const query = `
    SELECT 
      p.*, 
      u.first_name, 
      u.last_name,
      u.profile_pic,
      COALESCE(r.rating, p.rating) as rating,
      COALESCE(r.id, 0) as review_id,
      pr.discount_percentage,
      prod.name as product_name,
      prod.price as product_price
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    LEFT JOIN reviews r ON p.id = r.post_id
    LEFT JOIN product_promotions pr ON p.id = pr.post_id
    LEFT JOIN products prod ON p.product_id = prod.id OR (r.product_id = prod.id)
    WHERE p.post_type = ? AND p.is_active = 1 
    ORDER BY p.created_at DESC
  `;

  db.query(query, [type], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results || []);
  });
});

// Get product average rating
app.get('/api/products/:productId/rating', (req, res) => {
  const { productId } = req.params;
  
  db.query(
    'SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount FROM reviews WHERE product_id = ?',
    [productId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        averageRating: results[0].avgRating || 0,
        reviewCount: results[0].reviewCount || 0
      });
    }
  );
});

// Get all reviews for a product
app.get('/api/products/:productId/reviews', (req, res) => {
  const { productId } = req.params;
  
  db.query(
    `SELECT r.*, u.first_name, u.last_name, u.profile_pic, 
            p.name as post_content, p.likes_count, p.comments_count
     FROM reviews r 
     JOIN users u ON r.user_id = u.id
     LEFT JOIN posts p ON r.post_id = p.id
     WHERE r.product_id = ? 
     ORDER BY r.created_at DESC`,
    [productId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results || []);
    }
  );
});

// Delete order review
app.delete('/api/posts/:postId/order-review', authenticateToken, (req, res) => {
  const { postId } = req.params;

  db.query('SELECT user_id FROM posts WHERE id = ?', [postId], (err, posts) => {
    if (err || !posts || posts.length === 0 || posts[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    db.query('UPDATE posts SET is_active = 0 WHERE id = ?', [postId], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: deleteErr.message });
      db.query('DELETE FROM reviews WHERE post_id = ?', [postId]);
      res.json({ message: 'Order review deleted' });
    });
  });
});

// ==================== SERVICES / APPOINTMENTS ENDPOINTS ====================

// Create a new service
app.post('/api/services', authenticateToken, (req, res) => {
  const { name, description, price, category, duration_minutes, start_time, end_time, slot_interval_minutes, available_days } = req.body;
  
  if (!name || !price || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO services (seller_id, name, description, price, category, duration_minutes, start_time, end_time, slot_interval_minutes, available_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    req.user.id,
    name,
    description || '',
    price,
    category || 'Other',
    duration_minutes || 60,
    start_time,
    end_time,
    slot_interval_minutes || 60,
    JSON.stringify(available_days || [0, 1, 2, 3, 4, 5, 6])
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Service created', serviceId: result.insertId });
  });
});

// Get all services (public)
app.get('/api/services', (req, res) => {
  db.query('SELECT * FROM services WHERE is_active = 1 ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get services by seller
app.get('/api/services/seller/:sellerId', (req, res) => {
  const sellerId = req.params.sellerId;
  db.query('SELECT * FROM services WHERE seller_id = ? ORDER BY created_at DESC', [sellerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get single service with available slots
app.get('/api/services/:serviceId/slots', (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date parameter required' });
  }

  db.query(
    'SELECT * FROM appointment_slots WHERE service_id = ? AND slot_date = ? AND is_available = 1 ORDER BY start_time',
    [serviceId, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Generate time slots for a service (admin/seller only)
app.post('/api/services/:serviceId/generate-slots', authenticateToken, (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date required' });
  }

  // Get service details
  db.query('SELECT * FROM services WHERE id = ? AND seller_id = ?', [serviceId, req.user.id], (err, services) => {
    if (err) return res.status(500).json({ error: err.message });
    if (services.length === 0) return res.status(404).json({ error: 'Service not found' });

    const service = services[0];
    const startHour = parseInt(service.start_time.split(':')[0]);
    const endHour = parseInt(service.end_time.split(':')[0]);
    const interval = service.slot_interval_minutes;

    let slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotStart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        const endMinute = minute + service.duration_minutes;
        const slotEnd = `${String(hour + Math.floor(endMinute / 60)).padStart(2, '0')}:${String(endMinute % 60).padStart(2, '0')}:00`;

        slots.push([serviceId, date, slotStart, slotEnd]);
      }
    }

    // Batch insert slots
    if (slots.length > 0) {
      db.query(
        'INSERT INTO appointment_slots (service_id, slot_date, start_time, end_time) VALUES ?',
        [slots],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Slots generated', count: slots.length });
        }
      );
    } else {
      res.json({ message: 'No slots to generate', count: 0 });
    }
  });
});

// Book an appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { service_id, slot_id, appointment_date, notes } = req.body;

  if (!service_id || !slot_id || !appointment_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get slot details
  db.query(
    'SELECT * FROM appointment_slots WHERE id = ? AND service_id = ? AND is_available = 1',
    [slot_id, service_id],
    (err, slots) => {
      if (err) return res.status(500).json({ error: err.message });
      if (slots.length === 0) return res.status(400).json({ error: 'Slot not available' });

      const slot = slots[0];

      // Get service seller info
      db.query('SELECT seller_id FROM services WHERE id = ?', [service_id], (err, services) => {
        if (err) return res.status(500).json({ error: err.message });

        const seller_id = services[0].seller_id;

        // Create appointment
        const query = `
          INSERT INTO appointments (service_id, slot_id, customer_id, seller_id, appointment_date, start_time, end_time, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          query,
          [service_id, slot_id, req.user.id, seller_id, appointment_date, slot.start_time, slot.end_time, notes || ''],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Mark slot as unavailable
            db.query('UPDATE appointment_slots SET is_available = 0 WHERE id = ?', [slot_id]);

            res.json({ message: 'Appointment booked', appointmentId: result.insertId });
          }
        );
      });
    }
  );
});

// Get user appointments (as customer)
app.get('/api/appointments/my-bookings', authenticateToken, (req, res) => {
  db.query(
    `SELECT a.*, s.name as service_name, u.first_name, u.last_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.seller_id = u.id
     WHERE a.customer_id = ? ORDER BY a.appointment_date DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Get seller appointments
app.get('/api/appointments/seller-bookings', authenticateToken, (req, res) => {
  db.query(
    `SELECT a.*, s.name as service_name, u.first_name, u.last_name
     FROM appointments a
     JOIN services s ON a.service_id = s.id
     JOIN users u ON a.customer_id = u.id
     WHERE a.seller_id = ? ORDER BY a.appointment_date DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Cancel appointment
app.post('/api/appointments/:appointmentId/cancel', authenticateToken, (req, res) => {
  const { appointmentId } = req.params;

  // Verify ownership
  db.query('SELECT * FROM appointments WHERE id = ? AND (customer_id = ? OR seller_id = ?)', [appointmentId, req.user.id, req.user.id], (err, appointments) => {
    if (err) return res.status(500).json({ error: err.message });
    if (appointments.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    const appointment = appointments[0];

    // Cancel appointment
    db.query('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', appointmentId], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Release the slot
      db.query('UPDATE appointment_slots SET is_available = 1 WHERE id = ?', [appointment.slot_id]);

      res.json({ message: 'Appointment cancelled' });
    });
  });
});

//   socket.on('join', (userId) => {
//     socket.join(userId);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));