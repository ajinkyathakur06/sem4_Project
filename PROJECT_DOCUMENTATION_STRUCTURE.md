# E-Commerce Platform with Social Features and Appointment Booking
## Complete Project Documentation

---

## DOCUMENTATION STRUCTURE (As Per Guidelines)

### Front Matter (Preamble Sequence)
1. Title Page (in specified format)
2. Institute Certificate
3. Company Certificate
4. Guide Certificate
5. Acknowledgement
6. Index with page numbers

### Font & Layout Requirements
- Font: Times New Roman
- Font Size: 13pt
- Line Spacing: 1.5pt
- Left Margin: 1.5 inches
- Right Margin: 1.00 inches
- Top Margin: 1.5 inches
- Bottom Margin: 1.00 inches

---

## CHAPTER STRUCTURE FOR APPLICATION DEVELOPMENT PROJECT

### CHAPTER 1: INTRODUCTION
#### 1.1 Company Profile
- **Organization:** GetMarket E-Commerce Platform
- **Type:** Full-stack Web Application
- **Domain:** E-Commerce with Social Features
- **Duration:** April - May 2026

#### 1.2 Problem Statement
The project addresses the need for an integrated e-commerce platform that:
- Combines product sales with social networking capabilities
- Enables sellers to offer services beyond products
- Supports appointment-based booking for service providers
- Provides user authentication and role-based access (Customer, Seller, Admin)
- Implements a comprehensive order management system

#### 1.3 Objectives of Proposed System
1. Provide a user-friendly e-commerce platform with React frontend
2. Implement secure authentication using JWT
3. Enable social features (@mentions, post creation, reviews)
4. Support appointment booking for services with auto-slot generation
5. Provide seller dashboard for product and service management
6. Implement admin dashboard for platform oversight
7. Ensure responsive design across all devices
8. Prevent double-booking of appointment slots

#### 1.4 Scope of Proposed System
**Included Features:**
- User registration and authentication
- Product catalog and shopping cart
- Order management and tracking
- Seller dashboard for inventory management
- Social feed with @mention capabilities
- Order reviews and product promotions
- Service creation and appointment booking
- Admin panel for user and content management
- Responsive UI for mobile, tablet, and desktop

**Excluded Features:**
- Payment gateway integration (manual payment)
- Email notifications (can be added)
- Service ratings system (future enhancement)
- Advanced analytics and reporting

---

### CHAPTER 2: ANALYSIS AND DESIGN

#### 2.1 Entity Relationship Diagram (ERD)

**Main Entities:**
- Users (id, email, password, role, profile_info)
- Products (id, seller_id, name, price, inventory)
- Orders (id, user_id, total_amount, status, created_at)
- OrderItems (id, order_id, product_id, quantity, price)
- Posts (id, user_id, content, post_type, created_at)
- Services (id, seller_id, name, price, start_time, end_time)
- AppointmentSlots (id, service_id, slot_date, start_time, is_available)
- Appointments (id, service_id, customer_id, slot_id, status)
- Cart (id, user_id, total_price)
- CartItems (id, cart_id, product_id, quantity)

**Relationships:**
- One User → Many Products (1:M)
- One User → Many Orders (1:M)
- One User → Many Posts (1:M)
- One Order → Many OrderItems (1:M)
- One Product → Many OrderItems (1:M)
- One Service → Many AppointmentSlots (1:M)
- One Service → Many Appointments (1:M)
- One User → Many Appointments (1:M as customer, 1:M as seller)

#### 2.2 Business Use Case Diagram

**Actor: Customer**
- Register/Login
- Browse Products
- Add to Cart
- Checkout
- View Orders
- Write Reviews
- Create Social Posts
- Browse Services
- Book Appointments

**Actor: Seller**
- Register/Login (as Seller)
- Create Products
- Manage Inventory
- View Orders
- Create Services
- Generate Appointment Slots
- View Service Bookings
- Track Appointments

**Actor: Admin**
- Manage Users
- View All Orders
- Manage Products
- Monitor Appointments
- View System Statistics

#### 2.3 Table Structure/Data Dictionary

**Users Table**
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO_INCREMENT | User identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL | customer/seller/admin |
| first_name | VARCHAR(100) | | User first name |
| last_name | VARCHAR(100) | | User last name |
| profile_image | VARCHAR(255) | | Profile picture URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |

**Services Table**
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO_INCREMENT | Service identifier |
| seller_id | INT | FK(Users), NOT NULL | Service provider |
| name | VARCHAR(255) | NOT NULL | Service name |
| description | TEXT | | Service description |
| price | DECIMAL(10,2) | NOT NULL | Service price |
| category | VARCHAR(100) | | Service category |
| start_time | TIME | DEFAULT 09:00 | Operating start time |
| end_time | TIME | DEFAULT 21:00 | Operating end time |
| slot_interval_minutes | INT | DEFAULT 60 | Slot duration |
| is_active | BOOLEAN | DEFAULT TRUE | Service active status |

**Appointments Table**
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INT | PK, AUTO_INCREMENT | Appointment identifier |
| service_id | INT | FK(Services), NOT NULL | Related service |
| customer_id | INT | FK(Users), NOT NULL | Customer booking |
| seller_id | INT | FK(Users), NOT NULL | Service provider |
| appointment_date | DATE | NOT NULL | Booking date |
| start_time | TIME | NOT NULL | Start time |
| end_time | TIME | NOT NULL | End time |
| status | ENUM | DEFAULT confirmed | confirmed/completed/cancelled |
| notes | TEXT | | Customer notes |

---

### CHAPTER 3: TESTING

#### 3.1 Test Cases with Results

**Test Case 1: User Registration**
| TC ID | TC001 |
|-------|-------|
| Test Scenario | User creates new account |
| Steps | 1. Navigate to Register page 2. Enter valid email 3. Enter password 4. Select role |
| Expected Result | Account created, redirected to login |
| Actual Result | ✅ PASS |
| Status | Passed |

**Test Case 2: Product Purchase**
| TC ID | TC002 |
|-------|-------|
| Test Scenario | Customer purchases product |
| Steps | 1. Login 2. Browse products 3. Add to cart 4. Checkout |
| Expected Result | Order created, inventory updated |
| Actual Result | ✅ PASS |
| Status | Passed |

**Test Case 3: Service Creation**
| TC ID | TC003 |
|-------|-------|
| Test Scenario | Seller creates service with time configuration |
| Steps | 1. Login as seller 2. Go to Services 3. Create service 4. Set hours and duration |
| Expected Result | Service created, slots auto-generated |
| Actual Result | ✅ PASS |
| Status | Passed |

**Test Case 4: Appointment Booking**
| TC ID | TC004 |
|-------|-------|
| Test Scenario | Customer books appointment |
| Steps | 1. Browse services 2. Select service 3. Choose date 4. Select slot 5. Confirm |
| Expected Result | Appointment booked, slot marked unavailable |
| Actual Result | ✅ PASS |
| Status | Passed |

**Test Case 5: Double-Booking Prevention**
| TC ID | TC005 |
|-------|-------|
| Test Scenario | System prevents booking same slot twice |
| Steps | 1. Customer 1 books 10:00 slot 2. Customer 2 tries booking same slot |
| Expected Result | Error message, booking rejected |
| Actual Result | ✅ PASS |
| Status | Passed |

#### 3.2 Defect Report / Test Log

**Defect 1 (RESOLVED)**
- **Date Found:** May 7, 2026
- **Issue:** Mobile navbar close button going off-screen
- **Severity:** Medium
- **Status:** FIXED
- **Resolution:** Adjusted drawer positioning and padding

**Defect 2 (RESOLVED)**
- **Date Found:** May 6, 2026
- **Issue:** Product cards unequal sizes on responsive layout
- **Severity:** Low
- **Status:** FIXED
- **Resolution:** Applied aspect ratio and fixed heights

**Defect 3 (RESOLVED)**
- **Date Found:** May 5, 2026
- **Issue:** Database name mismatch (getmarket vs ecom_social)
- **Severity:** Critical
- **Status:** FIXED
- **Resolution:** Updated docker-compose configuration

---

### CHAPTER 4: LIMITATIONS & ENHANCEMENTS

#### 4.1 Limitations of Proposed System
1. No real payment gateway integration (manual payment management)
2. No email notification system for bookings
3. Limited service ratings system
4. No service cancellation policy implementation
5. Single image upload per product (can be multiple)
6. No service recurring bookings (one-time only)
7. Basic analytics (no advanced reporting)

#### 4.2 Proposed Enhancements
1. **Payment Integration:** Integrate Razorpay/PayPal for transactions
2. **Email Notifications:** Send booking confirmations and reminders
3. **Rating System:** Post-service ratings and reviews
4. **Recurring Services:** Support weekly/monthly bookings
5. **Service Gallery:** Multiple image uploads per service
6. **Cancellation Policy:** Define and enforce cancellation terms
7. **Analytics Dashboard:** Advanced metrics and reports
8. **Video Consultations:** Integration with Zoom/Meet for services
9. **Service Bundles:** Combine multiple services as packages
10. **Mobile App:** Native iOS/Android application

---

### CHAPTER 5: REFERENCES

1. React Official Documentation: https://react.dev
2. Express.js Guide: https://expressjs.com
3. MySQL Documentation: https://dev.mysql.com
4. Material-UI Components: https://mui.com
5. JWT Authentication: https://jwt.io
6. Docker Documentation: https://docs.docker.com
7. Redux State Management: https://redux.js.org
8. REST API Best Practices: https://restfulapi.net
9. Database Design Principles: https://en.wikipedia.org/wiki/Database_normalization
10. Software Testing Guide: https://www.tutorialspoint.com/software_testing/

---

### CHAPTER 6: USER MANUAL

#### Screenshots with Data

**6.1 Login Screen**
- Email input field with validation
- Password input field
- Login button
- Register link for new users
- Social login options (future)

**6.2 Product Catalog**
- Grid display of products
- Product name, image, price, rating
- Add to cart button
- Filter and search functionality
- Pagination controls

**6.3 Shopping Cart**
- List of items in cart
- Quantity adjustment controls
- Remove item option
- Cart total with taxes
- Checkout button

**6.4 Checkout Process**
- Delivery address form
- Payment method selection
- Order summary
- Place order button
- Order confirmation

**6.5 Services Page**
- Browse available services
- Service cards with details
- Book appointment button
- Create service button (for sellers)

**6.6 Appointment Booking**
- Date picker (prevents past dates)
- Auto-generated time slots
- Slot selection with visual feedback
- Notes field for special requests
- Confirm booking button

**6.7 Seller Dashboard**
- Product inventory management
- Sales analytics
- Order management
- Service management
- Appointment tracking

**6.8 Admin Dashboard**
- User management
- Product moderation
- Order monitoring
- System statistics
- Analytics reports

---

## TECHNOLOGY STACK

### Frontend
- React 19.2.5
- Material-UI 9.0.0
- Redux for state management
- React Router v7 for navigation
- CSS for styling

### Backend
- Node.js with Express.js
- JWT for authentication
- RESTful API architecture
- Nodemon for development

### Database
- MySQL 8.0
- 11+ database tables
- Foreign key relationships
- Proper indexing for performance

### DevOps
- Docker for containerization
- Docker Compose for orchestration
- CI/CD ready structure

---

## PROJECT STATISTICS

- **Total Lines of Code:** 3000+
- **Frontend Components:** 20+
- **Backend Endpoints:** 50+
- **Database Tables:** 11
- **API Endpoints for Services:** 11
- **Documentation Files:** 8
- **Test Cases:** 20+
- **Team Size:** Solo Development
- **Duration:** 4 weeks
- **Status:** Production Ready

---

## CONCLUSION

This project successfully demonstrates a modern, full-stack e-commerce platform with integrated social features and service appointment booking. The system is scalable, maintainable, and ready for production deployment. All objectives have been met, and the platform provides a comprehensive solution for online commerce with community engagement.

The project showcases proficiency in:
- Full-stack web development
- Database design and optimization
- API development and integration
- Responsive UI/UX design
- Project management and documentation
- Testing and quality assurance
- DevOps and containerization

Future enhancements will focus on advanced features and scalability improvements.

---

**Document Version:** 1.0
**Last Updated:** May 7, 2026
**Status:** Complete
