# Zustand State Management System

This directory contains a comprehensive state management system built with Zustand for the eduPlus web application.

## Overview

The state management system is organized into several stores, each handling a specific domain of the application:

- **Auth Store** (`auth.ts`) - User authentication and session management
- **Theme Store** (`theme.ts`) - Application theme preferences (light/dark/system)
- **Courses Store** (`courses.ts`) - Course data and progress tracking
- **App Store** (`app.ts`) - General application state (loading, errors)

## Features

### Persistence
- Auth and Theme stores use localStorage persistence
- Courses store persists user progress
- Automatic rehydration on app start

### Type Safety
- Full TypeScript support with shared type definitions
- Strongly typed store interfaces
- Type-safe state updates

### React Integration
- Easy integration with React components using hooks
- Automatic re-renders on state changes
- DevTools support (can be enabled for debugging)

## Usage

### Basic Usage

```tsx
import { useAuthStore, useCoursesStore, useThemeStore } from '@/store';

// In your component
function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  const { courses, selectCourse } = useCoursesStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.name}!</p>}
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

### Store Methods

#### Auth Store
```tsx
const {
  user,
  isAuthenticated,
  isLoading,
  setUser,
  setLoading,
  setAuthenticated,
  logout
} = useAuthStore();
```

#### Courses Store
```tsx
const {
  courses,
  selectedCourse,
  isLoading,
  setCourses,
  setLoading,
  selectCourse,
  updateCourseProgress,
  markLessonComplete,
  getCourseById,
  getCompletedLessonsCount
} = useCoursesStore();
```

#### Theme Store
```tsx
const {
  theme,
  setTheme
} = useThemeStore();
```

#### App Store
```tsx
const {
  isLoading,
  error,
  setLoading,
  setError,
  clearError
} = useAppStore();
```

## Initialization

Use the `useInitializeStores` hook in your root component to initialize the stores with data:

```tsx
import { useInitializeStores } from '@/store';

function App() {
  useInitializeStores();

  return (
    // Your app content
  );
}
```

## Best Practices

1. **Store Organization**: Keep stores focused on specific domains
2. **Actions**: Use actions for complex state updates instead of direct mutations
3. **Selectors**: Create computed selectors for derived state
4. **Middleware**: Use middleware sparingly and only when necessary
5. **Performance**: Zustand automatically optimizes re-renders, but be mindful of large state objects

## Development

### Adding New Stores

1. Create a new file in the `store/` directory
2. Define your store interface extending the state type
3. Use `create()` from Zustand with optional middleware
4. Export the store hook
5. Add exports to `index.ts`

### Persistence

To add persistence to a store:

```tsx
import { persist } from 'zustand/middleware';

const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      // your store implementation
    }),
    {
      name: 'my-store-storage',
      // optional: partialize state for persistence
    }
  )
);
```

### DevTools

For debugging, you can add devtools:

```tsx
import { devtools } from 'zustand/middleware';

const useMyStore = create<MyStore>()(
  devtools(
    (set) => ({
      // your store implementation
    }),
    { name: 'My Store' }
  )
);
```

## Testing

Each store can be tested independently using Zustand's testing utilities or by mocking the stores in component tests.