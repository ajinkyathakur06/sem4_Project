# Post-Review-Promotion Linking Implementation

## Overview
Posts, Order Reviews, and Product Promotions are now fully linked in the feed. Each post can be:
- **Social Post**: Regular user content with mentions
- **Order Review**: Linked to an order with rating, review text, and product info
- **Product Promotion**: Linked to a product with discount and marketing text

## Backend Changes

### 1. Enhanced GET /api/posts Endpoint
**File**: [backend/server.js](backend/server.js#L185)

**What Changed**:
- Modified SQL query to use LEFT JOINs with `reviews` and `product_promotions` tables
- Joins with `products` table to get product information
- Returns complete linked data for each post

**Query Structure**:
```sql
SELECT p.*, u.first_name, u.last_name,
       r.id as review_id, r.title, r.description, r.verified_purchase,
       pr.id as promo_id, pr.discount_percentage, pr.promotion_text,
       prod.name, prod.price, prod.images
FROM posts p 
LEFT JOIN reviews r ON p.id = r.post_id
LEFT JOIN product_promotions pr ON p.id = pr.post_id
LEFT JOIN products prod ON p.product_id = prod.id OR r.product_id = prod.id
```

**Response Data Structure**:
```javascript
{
  // Post fields
  id, user_id, content, post_type, created_at, likes_count, comments_count, shares_count,
  first_name, last_name, rating,
  
  // Linked review (if order_review type)
  review: {
    id, title, description, product_id, verified_purchase
  },
  
  // Linked promotion (if product_promo type)
  promotion: {
    id, discount_percentage, promotion_text
  },
  
  // Product info (for both reviews and promos)
  product_info: {
    name, price, images
  }
}
```

### 2. Existing POST Endpoints
- **POST /api/posts/order-review** - Creates post with review data linked
- **POST /api/posts/product-promo** - Creates post with promotion data linked
- Both automatically create review/promotion records in respective tables

## Frontend Changes

### 1. PostFeed Component Updates
**File**: [frontend/src/components/PostFeed.js](frontend/src/components/PostFeed.js)

**New Display Sections Added**:

#### Review Details Card (Order Reviews)
```
📋 Review Details
Title: [Review Title]
[Review Description]
✓ Verified Purchase (badge)
```
- Background: Light amber (#f59e0b)
- Shows only for `post_type === 'order_review'`
- Displays linked review title, description, and verified purchase status

#### Promotion Details Card (Product Promotions)
```
🎯 Promotion Details
[Promotion Text]
🏷️ X% OFF (badge if discount > 0)
```
- Background: Light green (#10b981)
- Shows only for `post_type === 'product_promo'`
- Displays promotion text and discount percentage

#### Product Information Card (Reviews & Promotions)
```
📦 Product Details / Reviewed Product
[Product Name]
₹[Price]
-X% OFF (for promos only)
```
- Background: Light blue (#3b82f6)
- Shows for all non-social posts
- Links to actual product being reviewed or promoted

### 2. Data Flow in Feed

```
User creates Order Review
    ↓
POST /api/posts/order-review creates:
  - posts table entry (post_type='order_review')
  - reviews table entry (linked to post)
    ↓
GET /api/posts joins all tables
    ↓
PostFeed receives complete data with post.review + post.product_info
    ↓
Renders with all details visible:
  - Main review content + rating
  - Review title/description (from review table)
  - Verified purchase badge
  - Product being reviewed
  - Images from post
```

## Database Schema

### posts table (existing columns)
- `post_type` ENUM: 'social', 'order_review', 'product_promo'
- `rating` INT: Star rating (for reviews)
- `order_id` INT: Links to order (for reviews)
- `product_id` INT: Links to product (for promos)

### reviews table (linked to posts)
- `post_id` → posts.id (FK)
- `order_id` → orders.id (FK)
- `product_id` → products.id (FK)
- `title`, `description`: Review content
- `verified_purchase`: Boolean
- `rating`: 1-5 star rating
- `images`: JSON array of review images

### product_promotions table (linked to posts)
- `post_id` → posts.id (FK)
- `product_id` → products.id (FK)
- `promotion_text`: Marketing text
- `discount_percentage`: Discount amount
- `is_active`: Boolean

## Feature Workflow

### Creating an Order Review Post
```
1. User clicks "⭐ Review Order"
2. Selects delivered order
3. Fills rating, title, description, optional images
4. Clicks "Post Review"
5. API creates post record (post_type='order_review')
6. API creates review record linked to post
7. Post appears in feed with:
   - Order's rating badge
   - Review details card
   - Product being reviewed
   - Verified purchase badge
```

### Creating a Product Promotion Post
```
1. Seller clicks "📢 Promote Product"
2. Selects product from inventory
3. Fills promotion text, optional discount %
4. Clicks "Post"
5. API creates post record (post_type='product_promo')
6. API creates product_promotion record linked to post
7. Post appears in feed with:
   - Promotion badge
   - Promotion details card
   - Product info with price/discount
   - Product images
```

### Viewing Feed
```
GET /api/posts returns all posts with linked data
PostFeed component renders:
- Social posts: Just content + engagement
- Review posts: Content + review details + product info
- Promo posts: Content + promotion details + product info
- Filter chips let users see All / Reviews / Promotions only
```

## Visual Design

### Review Post Layout
```
┌─ Avatar | User Name | Date
├─ ⭐ Order Review (badge)
├─ ⭐⭐⭐⭐⭐ 5/5 Stars
├─ Review title and content text
├─ [Review images gallery]
├─ 📋 Review Details (amber box)
│  Title: Product not Received
│  Description: This product...
│  ✓ Verified Purchase
├─ 📦 Product Details (blue box)
│  iPhone 15 Pro
│  ₹123,999
└─ Like | Comment | Share buttons
```

### Promo Post Layout
```
┌─ Avatar | Seller Name | Date
├─ 📢 Product Promotion (badge)
├─ Promotion marketing text content
├─ [Product images gallery]
├─ 🎯 Promotion Details (green box)
│  "Special discount on premium models"
│  🏷️ 25% OFF
├─ 📦 Product Details (blue box)
│  iPhone 15 Pro Max
│  ₹154,999
│  -25% OFF
└─ Like | Comment | Share buttons
```

## Testing

### Test Case 1: Order Review
1. Create delivered order via Orders page
2. Go to Create Post → Review Order
3. Submit review with rating and images
4. Visit Feed
5. **Expected**: Review post shows with all linked details

### Test Case 2: Product Promotion
1. As seller, go to Create Post → Promote Product
2. Select product and add discount
3. Submit promotion
4. Visit Feed
5. **Expected**: Promo post shows with product info and discount

### Test Case 3: Post Filtering
1. Apply "⭐ Reviews" filter
2. **Expected**: Only review posts visible
3. Apply "📢 Promotions" filter
4. **Expected**: Only promo posts visible
5. Apply "All Posts" filter
6. **Expected**: All post types visible

## Performance Optimizations

1. **Database Indexes**:
   - `idx_posts_post_type` on posts table
   - `idx_reviews_product_id` on reviews table
   - `idx_mentions_mentioned_user` on mentions table

2. **Query Efficiency**:
   - Single JOIN query returns all linked data
   - LEFT JOINs prevent missing regular posts
   - Indexes speed up filtering by post_type

3. **Frontend Rendering**:
   - Conditional rendering only shows relevant sections
   - Null checks prevent errors from missing linked data
   - Efficient image parsing from JSON/Array

## Known Limitations & Future Enhancements

### Current
- Reviews linked to first product in order only
- Promotions limited to one product per post
- No edit/delete for linked data (must delete post)

### Future
- [ ] Multi-product reviews
- [ ] Review helpfulness voting
- [ ] Promotion scheduling
- [ ] A/B testing for promotions
- [ ] Review analytics dashboard
- [ ] Seller response to reviews
- [ ] Review moderation
- [ ] Trending reviews section

## Files Modified

1. **backend/server.js** (Line 185)
   - Enhanced GET /api/posts with LEFT JOINs
   - Data processing to structure linked objects

2. **frontend/src/components/PostFeed.js**
   - Added Review Details Card rendering
   - Added Promotion Details Card rendering
   - Enhanced Product Information display
   - Improved styling for linked data sections

## Conclusion

Posts, Order Reviews, and Product Promotions are now fully integrated in the feed with:
✅ Complete data linking between tables
✅ Rich visual display of all related information
✅ Seamless user experience
✅ Proper database relationships
✅ Filter and sort capabilities

Users can now see order reviews with product details, seller promotions with discounts, and track their social engagement all in one unified feed!
