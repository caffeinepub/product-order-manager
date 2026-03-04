# Product Order Manager

## Current State
A food product store where customers can browse products and place orders with their name and contact number. Admins log in with PIN 0852 to manage products (add/edit/delete) and view incoming orders. Orders currently capture: customer name, contact number, product name, product ID, and timestamp.

## Requested Changes (Diff)

### Add
- Optional `cityName` field (Text) to the `Order` type in the backend
- Optional city name input field in the customer order form (PublicStorePage)
- City column in the admin orders table (AdminDashboardPage)

### Modify
- `submitOrder` backend function to accept an optional `cityName` parameter (empty string if not provided)
- Order form state and validation — city is NOT required
- Success message to optionally mention city if provided

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with `cityName: Text` added to the Order type and `submitOrder` accepting a `cityName` parameter
2. Update `useQueries.ts` `useSubmitOrder` hook to include optional `cityName`
3. Add city input field to `PublicStorePage.tsx` order form (not required, no asterisk)
4. Add "City" column to the orders table in `AdminDashboardPage.tsx`, showing city or "—" if empty
5. Build and deploy
