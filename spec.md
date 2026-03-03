# Product Order Manager — Food Store Redesign

## Current State
- Tech/electronics themed store ("LuxeStore") with emerald green color palette
- Sample products are tech gadgets (headphones, smartwatch, keyboard, etc.)
- Typography: Cabinet Grotesk (display) + General Sans (body) + Instrument Serif (accent)
- Color: warm cream background with emerald primary, amber accent
- All core functionality works: public store with "Order Now", admin PIN 0852, add/edit/delete products, orders table

## Requested Changes (Diff)

### Add
- Food-themed sample products (6 items: e.g. artisan breads, gourmet cheese, premium olive oil, spice blends, honey, fresh pasta)
- Food-appropriate generated hero/product images
- Warm appetizing color palette (terracotta/rust primary, warm cream background, golden accent)
- Food-themed store branding ("Fresh Market" or "Harvest Table")
- Appetizing typography feel (Fraunces serif for display moments, Bricolage Grotesque for body)

### Modify
- `index.css`: Replace emerald green tokens with terracotta/warm amber palette
- `tailwind.config.js`: Update font families, box shadows to match new palette
- `PublicStorePage.tsx`: Updated store name, food-themed hero copy, food sample products
- `AdminDashboardPage.tsx`: Updated branding to match
- `AdminLoginPage.tsx`: Updated branding to match

### Remove
- Tech product sample data (headphones, smartwatch, keyboard, etc.)
- Tech-themed generated images
- Generic "LuxeStore" branding

## Implementation Plan
1. Generate 6 food product images (artisan bread, aged cheese, olive oil, spice mix, honey, fresh pasta)
2. Update `index.css` color tokens: terracotta primary (~oklch 0.55 0.15 30), warm cream background, golden accent
3. Update `tailwind.config.js`: swap fonts to Fraunces (display) + Bricolage Grotesque (body), update shadows
4. Update `PublicStorePage.tsx`: new store name, food copy, food sample products with new image paths
5. Update `AdminDashboardPage.tsx` + `AdminLoginPage.tsx`: updated branding
