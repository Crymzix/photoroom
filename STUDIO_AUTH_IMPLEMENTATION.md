# Studio Authorization Implementation

## Summary
Implemented authorization checks for viewing studios by studioId with different placeholders based on user access rights.

## Changes Made

### 1. Schema Updates (`convex/schema.ts`)
- Added optional `isPublic: v.optional(v.boolean())` field to studios table
- Studios are **private by default** (when isPublic is undefined or false)

### 2. New Query (`convex/studios.ts`)
Created `getStudioById` query that returns:
```typescript
{
  studio: Studio | null,
  authStatus: "OK" | "NOT_FOUND" | "NO_USER_ID" | "PRIVATE"
}
```

**Authorization Logic:**
- `NOT_FOUND`: Studio doesn't exist
- `NO_USER_ID`: Studio has no userId assigned
- `PRIVATE`: Studio is private and user is not the owner
- `OK`: User owns the studio OR studio is public

### 3. Placeholder Components (`components/studio/studio-placeholders.tsx`)
Created four placeholder components:
- `StudioLoadingPlaceholder` - Shows loading spinner
- `StudioNotFoundPlaceholder` - Studio doesn't exist
- `StudioPrivatePlaceholder` - User not authorized (private studio)
- `StudioNoUserPlaceholder` - Studio has no owner

Each placeholder includes:
- Animated fade-in entrance
- Descriptive icon and message
- "Go to Home" button

### 4. StudioTab Updates (`components/studio/studio-tab.tsx`)
- Migrated to **React Query** with `convexQuery` for data fetching
- Added `studioData` query with `isStudioLoading` state from React Query
- Added `useEffect` to populate studio state when loaded (UI schema, structured prompt)
- Added conditional rendering to show appropriate placeholder based on authStatus
- Main UI only renders when authorized or no studioId provided

**React Query Benefits:**
- Better loading state management with `isStudioLoading`
- Automatic caching and refetching
- Consistent data fetching pattern across the app

## Usage

### Viewing a Studio
```tsx
// URL: /[studioId]
<StudioTab studioId="j12345..." />
```

**Scenarios:**
1. **Studio exists + user is owner** → Shows full studio UI
2. **Studio exists + studio is public** → Shows full studio UI
3. **Studio exists + user not owner + private** → Shows "Private Studio" placeholder
4. **Studio doesn't exist** → Shows "Studio Not Found" placeholder  
5. **Studio has no userId** → Shows "Studio Not Available" placeholder
6. **Loading** → Shows loading spinner

### Creating New Studio
```tsx
// URL: /
<StudioTab />
```
No studioId provided, so main UI is shown immediately for new studio creation.

## Future Enhancements
- Add UI toggle to make studios public/private (currently only settable via mutation)
- Add share functionality for public studios
- Add studio settings page to manage visibility
