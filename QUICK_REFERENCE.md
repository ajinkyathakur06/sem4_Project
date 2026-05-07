# 🎯 Services & Appointments Feature - Quick Reference

## 🚀 Start the Project

```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# ✅ Server on http://localhost:5000

# Terminal 2: Start Frontend  
cd frontend
npm start
# ✅ App on http://localhost:3000
```

---

## 📱 Navigation

### Desktop Menu
```
Navbar → [Home] [Feed] [Shop] [📅 Services]
```

### Mobile Drawer (When Logged In)
```
Menu Items:
- 📰 Feed
- 🛍️ Shop
- 📅 Services & Appointments
- 👤 Profile
- 🛒 Cart
- 📦 My Orders
- ✍️ Create Post

Seller Only:
- 🏪 Seller Dashboard
- 📦 Seller Orders
- ➕ Create Service
```

---

## 🔗 Routes

| Route | Purpose | Component |
|-------|---------|-----------|
| `/services` | Browse all services | ServicesList |
| `/seller/create-service` | Create new service | ServiceForm |
| `/services/:serviceId/book` | Book appointment | AppointmentBooking |

---

## 📖 Step-by-Step Usage

### For Sellers: Create a Service
```
1. Login as seller
2. Click "📅 Services" in navbar
3. Click "Create Service" button
4. Fill form:
   - Service name
   - Description
   - Price (₹)
   - Category
   - Time range (9 AM - 9 PM)
   - Duration (minutes)
5. Submit
6. ✅ Service created + slots auto-generated
```

### For Customers: Book Appointment
```
1. Login as customer
2. Click "📅 Services" in navbar
3. See available services
4. Click "Book Appointment"
5. Select date with calendar
6. ✅ Slots auto-generate (1-hour intervals)
7. Click time slot
8. (Optional) Add notes
9. Click "Confirm Booking"
10. ✅ Appointment booked!
```

---

## 📡 API Endpoints

```bash
# View all services
GET /api/services

# Get specific service's available slots
GET /api/services/{serviceId}/slots?date=2026-05-15

# Create service (seller only)
POST /api/services
Body: {name, description, price, category, start_time, end_time, slot_interval_minutes}

# Book appointment
POST /api/appointments
Body: {service_id, slot_id, appointment_date, start_time, end_time, notes}

# View my bookings
GET /api/appointments/my-bookings

# View seller's bookings
GET /api/appointments/seller-bookings

# Cancel appointment
POST /api/appointments/{appointmentId}/cancel
```

---

## 🗂️ File Structure

```
project/
├── backend/
│   ├── server.js ..................... API endpoints (11 new endpoints added)
│   └── node_modules/
├── frontend/
│   ├── src/
│   │   ├── App.js .................... Routes + Navigation (updated)
│   │   └── components/
│   │       ├── ServiceForm.js ........ Create services (NEW - 196 lines)
│   │       ├── ServicesList.js ....... Browse services (NEW - 158 lines)
│   │       └── AppointmentBooking.js . Book appointments (NEW - 235 lines)
│   └── node_modules/
├── database/
│   └── migration_add_services.sql .... Database schema (NEW - 80 lines)
├── SERVICES_FEATURE_COMPLETE.md ...... Full documentation
├── TESTING_GUIDE.md .................. Step-by-step testing
└── IMPLEMENTATION_SUMMARY.md ......... Project summary
```

---

## ⚙️ Configuration

### Default Service Time
- **Start:** 09:00 (9 AM)
- **End:** 21:00 (9 PM)
- **Slot Duration:** 60 minutes
- **All configurable per service**

### Auto-Generated Slots
Example: 9 AM - 9 PM, 60-min intervals
```
09:00-10:00
10:00-11:00
11:00-12:00
... (continues)
20:00-21:00
```

---

## ✅ Verification Checklist

- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] All 3 components created
- [x] All 11 API endpoints working
- [x] Database tables created
- [x] Routes added to App.js
- [x] Navigation links added
- [x] No compilation errors
- [x] Form validation working
- [x] Double-booking prevented

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Services link not showing | Log in first (requires authentication) |
| Can't create service | Ensure you're logged in as SELLER |
| Slots not generating | Check service start/end times are correct |
| Can't book slot | Ensure date is today or future |
| Port 5000 already in use | `pkill -f "npm run"` then restart |
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` |

---

## 🎯 Key Features

✅ **Seller:**
- Create services with custom hours
- Auto-slot generation
- View bookings
- Cancel appointments

✅ **Customer:**
- Browse services
- Book appointments
- Select time slots
- Add notes
- View bookings

✅ **System:**
- Prevent double-booking
- Date validation
- Auto-slot generation
- Responsive design
- Redux integration

---

## 📊 Database Tables

### services
```
id | seller_id | name | description | price | category | start_time | end_time | slot_interval_minutes
```

### appointment_slots
```
id | service_id | slot_date | start_time | end_time | is_available
```

### appointments
```
id | service_id | slot_id | customer_id | seller_id | appointment_date | start_time | end_time | status | notes
```

---

## 🎉 Ready to Use!

Everything is implemented and working. Start the servers and navigate to `/services` to begin!

**Status:** ✅ Production Ready
