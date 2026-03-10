# Tasty Home - Food Store

## Current State
Fresh rebuild from scratch. Previous version had persistent connection errors.

## Requested Changes (Diff)

### Add
- Full food product store named "Tasty Home"
- Product grid showing 2 products per row (mobile-friendly)
- Category filter buttons (3 per row, dynamic)
- Slide-in cart with add/remove quantity controls
- Checkout form: name, contact number, optional city
- Admin panel (PIN: 0852) with:
  - Product management (add/edit/delete, image via URL or file upload)
  - Category management (add/delete)
  - Order management (view all orders with items)
- PWA support with "Add to Home Screen" button top-right
- All prices in Indian Rupees (₹)

### Modify
- N/A (fresh build)

### Remove
- N/A (fresh build)

## Implementation Plan
1. Backend: products, categories, orders CRUD in Motoko
2. Frontend: store page, cart sidebar, admin panel, PWA manifest
3. Warm terracotta design, serif typography, mobile responsive
