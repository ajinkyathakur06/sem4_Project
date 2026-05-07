# Setup Guide: Marketing & Review Feature

## Prerequisites
- Node.js backend running on port 5000
- React frontend running on port 3000
- MySQL database connected

## Step 1: Apply Database Migration

Run the migration SQL file to add the new tables and columns:

```bash
# Connect to MySQL and execute the migration
mysql -u [username] -p [database_name] < database/migration_add_reviews.sql
```

Or in MySQL client:
```sql
USE ecom_social;
SOURCE /path/to/database/migration_add_reviews.sql;
```

## Step 2: Verify Backend is Running

Ensure the backend server is running on port 5000:

```bash
cd backend
npm run dev
```

The new endpoints should be available:
- `POST /api/posts/order-review`
- `POST /api/posts/product-promo`
- `GET /api/posts/filter/:type`
- `GET /api/products/:productId/rating`
- `GET /api/products/:productId/reviews`
- `DELETE /api/posts/:postId/order-review`

## Step 3: Verify Frontend is Running

Ensure the frontend is running on port 3000:

```bash
cd frontend
npm start
```

## Step 4: Test the Features

### For Buyers (Order Reviews)
1. Make a purchase and ensure order is delivered
2. Go to "Create Post" page
3. Click "Post Order Review" card
4. Select your delivered order
5. Add rating, title, description, and images
6. Submit and see review in feed

### For Sellers (Product Promotions)
1. Create a product (ensure you're logged in as seller)
2. Go to "Create Post" page
3. Click "Promote Your Product" card
4. Select your product
5. Write promotion message
6. Add optional discount percentage
7. Submit and see promotion in feed

### For All Users (View Feed)
1. Go to Feed page
2. Use filter chips to view:
   - All Posts (mixed content)
   - ⭐ Reviews (only order reviews)
   - 📢 Promotions (only product promotions)
3. Like, comment, and share different post types
4. Notice different styling for each post type

## File Structure

```
project/
├── backend/
│   └── server.js (Updated with 6 new API endpoints)
├── frontend/
│   └── src/
│       └── components/
│           ├── CreatePost.js (Enhanced with review/promo options)
│           ├── OrderReviewPost.js (NEW - Order review dialog)
│           ├── PostFeed.js (Enhanced with post type filtering)
│           └── SellerProductPost.js (NEW - Product promo dialog)
└── database/
    └── migration_add_reviews.sql (NEW - Database schema)
```

## API Endpoints Reference

### Create Order Review
```
POST /api/posts/order-review
Headers: Authorization: Bearer {token}
Body: {
  orderId: number,
  rating: 1-5,
  title: string,
  description: string,
  images: array (base64)
}
```

### Create Product Promotion
```
POST /api/posts/product-promo
Headers: Authorization: Bearer {token}
Body: {
  productId: number,
  promotionText: string,
  discountPercentage: 0-100 (optional)
}
```

### Get Posts by Type
```
GET /api/posts/filter/:type
Types: social, order_review, product_promo
```

### Get Product Rating
```
GET /api/products/:productId/rating
Response: { averageRating: number, reviewCount: number }
```

### Get Product Reviews
```
GET /api/products/:productId/reviews
Response: array of reviews with user info
```

## Troubleshooting

### Reviews not showing up?
- Ensure database migration ran successfully
- Check that order status is "delivered"
- Verify user authentication token is valid

### Can't promote products?
- Ensure you're logged in as a seller
- Check that you're the product owner
- Verify product_id is valid

### Images not uploading?
- Check browser console for errors
- Ensure file sizes are reasonable (< 5MB recommended)
- Verify base64 encoding is working

### Discount preview not updating?
- Refresh the dialog
- Check that discount percentage is a valid number
- Ensure product price is available

## Performance Considerations

- Reviews table indexed on `product_id` and `rating`
- Posts table indexed on `post_type` and `order_id`
- Consider pagination for large feeds (future enhancement)
- Cache product ratings for better performance

## Next Steps

1. ✅ Apply database migration
2. ✅ Test all features
3. ✅ Deploy to production
4. Consider adding review moderation
5. Plan analytics dashboard
6. Implement email notifications for sellers
