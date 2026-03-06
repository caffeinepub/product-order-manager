# Product Order Manager

## Current State
- Products have a fixed category field (string) chosen from a hardcoded list: pickles, groceries, dryfruits, hometools.
- The public store renders a hardcoded TABS array for these four categories.
- The admin dashboard shows a hardcoded CATEGORY_OPTIONS dropdown in the product form.
- The backend has no concept of categories as a managed entity — the category field on a product is just a free text string.

## Requested Changes (Diff)

### Add
- Backend: `Category` type, persistent `categories` map, `nextCategoryId` counter.
- Backend: `addCategory(pin, name)` — admin-only, creates a new category, returns its id.
- Backend: `deleteCategory(pin, id)` — admin-only, removes a category by id.
- Backend: `listCategories()` — public query, returns all categories as `[{id: Nat, name: Text}]`.
- Frontend: "Categories" tab in the admin dashboard, with a list of existing categories, an "Add Category" input+button, and a delete button per category.
- Frontend: `useListCategories`, `useAddCategory`, `useDeleteCategory` hooks in useQueries.ts.
- Frontend: Seed four default categories on first use if backend returns none (pickles, groceries, dryfruits, hometools) — no, categories are managed purely by admin now.
- Frontend: Public store category tabs are now derived dynamically from `listCategories()`, plus an "All" tab.
- Frontend: Product form category dropdown is also derived from `listCategories()`.

### Modify
- Backend: No changes to Product or Order types — the `category` field stays as a Text (stores category name).
- Frontend: `CATEGORY_OPTIONS`, `CATEGORY_LABELS`, `CATEGORY_COLORS` are no longer hardcoded static maps. Labels are loaded from backend. Colors are assigned dynamically from a palette by index.
- Frontend: `CategoryKey` type in PublicStorePage becomes `string` (dynamic).

### Remove
- Frontend: Static `CATEGORY_OPTIONS` and `TABS` constant arrays (replaced by dynamic data from backend).

## Implementation Plan
1. Add `Category` type, `categories` map, `addCategory`, `deleteCategory`, `listCategories` functions to main.mo.
2. Regenerate backend.d.ts to reflect new API.
3. Add `useListCategories`, `useAddCategory`, `useDeleteCategory` hooks in useQueries.ts.
4. Add "Categories" tab in AdminDashboardPage with add-category form and per-category delete button.
5. Update product form category dropdown to use dynamic categories from backend.
6. Update PublicStorePage category tabs to be derived from `listCategories()`, with dynamic color assignment.
7. Update CATEGORY_LABELS and CATEGORY_COLORS usages to work with dynamic categories.
