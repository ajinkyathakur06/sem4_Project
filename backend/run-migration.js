const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ MySQL connected\n');
  
  const migrations = [
    // Add columns to posts table (without IF NOT EXISTS since MySQL versions differ)
    { sql: `ALTER TABLE posts ADD post_type ENUM('social', 'order_review', 'product_promo') DEFAULT 'social'`, name: 'Add post_type column' },
    { sql: `ALTER TABLE posts ADD order_id INT`, name: 'Add order_id column' },
    { sql: `ALTER TABLE posts ADD rating INT`, name: 'Add rating column' },
    
    // Create reviews table
    { sql: `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      order_id INT,
      user_id INT NOT NULL,
      product_id INT,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(255),
      description TEXT,
      images JSON,
      helpful_count INT DEFAULT 0,
      unhelpful_count INT DEFAULT 0,
      verified_purchase BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`, name: 'Create reviews table' },
    
    // Create product_promotions table
    { sql: `CREATE TABLE IF NOT EXISTS product_promotions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      seller_id INT NOT NULL,
      product_id INT NOT NULL,
      promotion_text TEXT,
      discount_percentage DECIMAL(5,2),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`, name: 'Create product_promotions table' },
    
    // Create mentions table
    { sql: `CREATE TABLE IF NOT EXISTS mentions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      mentioned_user_id INT NOT NULL,
      mentioned_by_user_id INT NOT NULL,
      username VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentioned_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_mention (post_id, mentioned_user_id)
    )`, name: 'Create mentions table' }
  ];
  
  let executed = 0;
  migrations.forEach((migration, index) => {
    db.query(migration.sql, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⊘ ${migration.name} - Column already exists`);
        } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⊘ ${migration.name} - Table already exists`);
        } else {
          console.error(`✗ ${migration.name}:`, err.message);
        }
      } else {
        console.log(`✓ ${migration.name}`);
      }
      executed++;
      
      if (executed === migrations.length) {
        console.log(`\n✅ Migration complete!`);
        db.end();
        process.exit(0);
      }
    });
  });
});
