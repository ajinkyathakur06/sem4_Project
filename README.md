# GetMarket - E-Commerce Social Media Platform

A production-ready web application combining e-commerce and social media features.

## Tech Stack
- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MySQL
- Authentication: Google OAuth + OTP
- Deployment: Docker

## Features
- User roles: Customer, Seller, Admin
- Social: Posts, likes, comments, follows, friends
- E-commerce: Products, cart, orders, payments
- Admin dashboard

## Folder Structure
```
project sem 4/
├── frontend/          # React.js application
├── backend/           # Node.js Express server
├── database/          # MySQL schema
├── docker/            # Docker configuration
├── .github/           # GitHub configurations
├── README.md
└── .gitignore
```

## API Design

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/google - Google OAuth login
- POST /api/auth/otp/send - Send OTP
- POST /api/auth/otp/verify - Verify OTP

### Products
- GET /api/products - Get all products
- POST /api/products - Create product (seller)
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Posts
- GET /api/posts - Get all posts
- POST /api/posts - Create post
- PUT /api/posts/:id - Update post
- DELETE /api/posts/:id - Delete post

### Social Features
- POST /api/posts/:id/like - Like post
- POST /api/posts/:id/comment - Comment on post
- POST /api/users/:id/follow - Follow user
- POST /api/users/:id/friend-request - Send friend request

### E-commerce
- GET /api/cart - Get cart
- POST /api/cart - Add to cart
- DELETE /api/cart/:id - Remove from cart
- POST /api/orders - Place order
- GET /api/orders - Get user orders
- PUT /api/orders/:id/status - Update order status

### Admin
- GET /api/admin/users - Get all users
- PUT /api/admin/users/:id - Update user
- GET /api/admin/posts - Get all posts
- DELETE /api/admin/posts/:id - Delete post

## Database Schema
See `database/schema.sql` for the complete MySQL schema with normalized tables.

## Sample UI Components
- Home: Landing page with navigation
- Login/Register: Authentication forms
- ProductList: Display products
- PostFeed: Social media feed
- Cart: Shopping cart
- AdminDashboard: Admin panel

## Deployment Steps

### Local Development
1. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Set up MySQL database and run schema.sql

3. Configure environment variables in .env files

4. Start backend: `cd backend && npm run dev`

5. Start frontend: `cd frontend && npm start`

### Docker Deployment
1. Update environment variables in docker/docker-compose.yml

2. Build and run:
   ```bash
   docker-compose -f docker/docker-compose.yml up --build
   ```

3. Access app at http://localhost:3000

### Production Deployment
- Use Docker Compose for containerized deployment
- Configure reverse proxy (nginx) for production
- Set up SSL certificates
- Use environment variables for secrets
- Implement monitoring and logging