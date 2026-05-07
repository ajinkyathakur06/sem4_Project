# Project Report on GetMarket - E-Commerce Social Media Platform

**For**  
[Company Name]  

**By**  
[Student Name]  
University of Pune  
Master in Computer Management  

Maharashtra Education Society's  
Institute of Management and Career Courses (IMCC), Pune-411038  

---

## Institute Certificate

[Institute Certificate Content - Placeholder]

---

## Internship/Company Certificate

[Internship/Company Certificate Content - Placeholder]

---

## Guide Certificate

[Guide Certificate Content - Placeholder]

---

## Acknowledgement

[Acknowledgement Content - Placeholder]

---

## Index

1. Introduction  
   1.1 Company Profile  
   1.2 Problem Statement  
   1.3 Objectives of Proposed System  
   1.4 Scope of the Proposed System  
2. Analysis and Design  
   2.1 Entity Relationship Diagram (ERD)  
   2.2 Business Use Case Diagram  
   2.3 Table Structure/Data Dictionary  
3. Testing  
   3.1 Test Cases with Results  
   3.2 Defect Report/Test Log  
4. Limitations of Proposed System  
5. Proposed Enhancements  
6. References  
7. User Manual (All input and output screens with consistent data)

---

## 1. Introduction

### 1.1 Company Profile

[Insert Company Profile Here]

### 1.2 Problem Statement

The traditional e-commerce platforms lack integrated social media features, leading to fragmented user experiences. GetMarket addresses this by providing a unified platform where customers can browse products, share experiences, and connect with sellers while maintaining all traditional e-commerce functionality.

### 1.3 Objectives of Proposed System

- To create a secure authentication system with role-based access for customers, sellers, and admins.
- To implement comprehensive product management with CRUD operations for sellers.
- To develop a shopping cart and checkout system with order tracking.
- To integrate social media features like posts, likes, comments, and user profiles.
- To provide admin dashboard for user and order management.
- To ensure responsive design and real-time notifications.
- To incorporate payment integration and security measures.

### 1.4 Scope of the Proposed System

The system includes:
- User registration and login with JWT authentication.
- Product browsing, searching, and filtering.
- Shopping cart management with quantity controls.
- Secure checkout with shipping address collection.
- Order history and status tracking.
- Seller dashboard for product CRUD operations.
- Admin dashboard for user and order management.
- Social features: posts, comments, likes, user profiles.
- Real-time notifications via WebSocket.
- Responsive UI using Material-UI.
- Backend API with Express.js and MySQL database.

---

## 2. Analysis and Design

### 2.1 Entity Relationship Diagram (ERD)

[Insert ERD Diagram Here - Description: The ERD includes entities like Users, Products, Orders, Cart, Posts, etc., with relationships such as User has many Products, Order belongs to User, etc.]

### 2.2 Business Use Case Diagram

[Insert Use Case Diagram Here - Description: Use cases include User Registration, Login, Browse Products, Add to Cart, Checkout, Manage Products (Seller), Manage Users (Admin), etc.]

### 2.3 Table Structure/Data Dictionary

Based on the MySQL schema:

- **Users Table**: id (INT, PK), email (VARCHAR), phone (VARCHAR), password_hash (VARCHAR), role (ENUM), first_name (VARCHAR), last_name (VARCHAR), profile_pic (VARCHAR), bio (TEXT), is_verified (BOOLEAN), created_at (TIMESTAMP), updated_at (TIMESTAMP)

- **Products Table**: id (INT, PK), seller_id (INT, FK to Users), name (VARCHAR), description (TEXT), price (DECIMAL), category (VARCHAR), stock_quantity (INT), images (JSON), tags (JSON), is_active (BOOLEAN), created_at (TIMESTAMP), updated_at (TIMESTAMP)

- **Cart Table**: id (INT, PK), user_id (INT, FK), product_id (INT, FK), quantity (INT), added_at (TIMESTAMP)

- **Orders Table**: id (INT, PK), user_id (INT, FK), total_amount (DECIMAL), status (ENUM), shipping_address (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)

- **Order_Items Table**: id (INT, PK), order_id (INT, FK), product_id (INT, FK), quantity (INT), price (DECIMAL)

- **Posts Table**: id (INT, PK), user_id (INT, FK), content (TEXT), product_id (INT, FK), images (JSON), likes_count (INT), comments_count (INT), shares_count (INT), is_active (BOOLEAN), created_at (TIMESTAMP)

- **Comments Table**: id (INT, PK), post_id (INT, FK), user_id (INT, FK), content (TEXT), created_at (TIMESTAMP)

- **Likes Table**: id (INT, PK), post_id (INT, FK), user_id (INT, FK), created_at (TIMESTAMP)

- **Payments Table**: id (INT, PK), order_id (INT, FK), amount (DECIMAL), payment_method (VARCHAR), status (ENUM), transaction_id (VARCHAR), created_at (TIMESTAMP)

---

## 3. Testing

### 3.1 Test Cases with Results

1. **User Registration**: Input valid email/password → Expected: User created, Success. Result: Pass.
2. **User Login**: Input correct credentials → Expected: JWT token returned, Success. Result: Pass.
3. **Product Creation (Seller)**: Input product details → Expected: Product added to DB, Success. Result: Pass.
4. **Add to Cart**: Select product, add to cart → Expected: Cart updated, Success. Result: Pass.
5. **Checkout**: Complete order → Expected: Order created, Success. Result: Pass.
6. **Admin User Management**: View users, update roles → Expected: Changes reflected, Success. Result: Pass.

### 3.2 Defect Report/Test Log

- No major defects found. Minor UI issues in mobile responsiveness fixed.
- Log: All API endpoints tested with Postman, responses as expected.

---

## 4. Limitations of Proposed System

- Limited payment gateway integration (placeholder for Razorpay).
- No advanced AI recommendations.
- Scalability concerns for high traffic.
- Social features are basic; advanced networking not implemented.

---

## 5. Proposed Enhancements

- Integrate real payment gateways.
- Add AI-powered product recommendations.
- Implement advanced social networking features.
- Enhance security with OAuth and 2FA.
- Add analytics dashboard for sellers and admins.

---

## 6. References

1. React Documentation - https://reactjs.org/
2. Node.js Documentation - https://nodejs.org/
3. MySQL Documentation - https://dev.mysql.com/doc/
4. Material-UI Documentation - https://mui.com/
5. Express.js Guide - https://expressjs.com/

---

## 7. User Manual

### Login Screen
- Enter email and password, click "Sign In".
- Screenshot: [Insert Screenshot]

### Product List
- Browse products, click "Add to Cart".
- Screenshot: [Insert Screenshot]

### Cart
- View items, update quantity, proceed to checkout.
- Screenshot: [Insert Screenshot]

### Checkout
- Enter shipping address, confirm order.
- Screenshot: [Insert Screenshot]

### Seller Dashboard
- Add/Edit/Delete products.
- Screenshot: [Insert Screenshot]

### Admin Dashboard
- Manage users and orders.
- Screenshot: [Insert Screenshot]

[Include consistent sample data in all screenshots]