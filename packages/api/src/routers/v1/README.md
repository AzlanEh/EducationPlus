# API Versioning Structure

This directory contains versioned API endpoints for the eduPlus platform.

## Current Structure

```
routers/
├── v1/                    # Version 1 API endpoints
│   ├── index.ts          # V1 router exports
│   ├── auth.ts           # Authentication endpoints
│   ├── course.ts         # Course management endpoints
│   ├── user.ts           # User management endpoints
│   └── progress.ts       # Progress & analytics endpoints
├── index.ts              # Main router with versioning
└── module.router.ts      # Module-specific endpoints (shared)
```

## API Versioning Strategy

### Endpoint Access

**Versioned Access:**
```
/api/v1/healthCheck
/api/v1/createCourse
/api/v1/getUsers
```

**Backward Compatible Access (V1):**
```
/api/healthCheck
/api/createCourse
/api/getUsers
```

### Adding New Versions

1. **Create new version folder:**
   ```bash
   mkdir routers/v2
   ```

2. **Create version-specific routers:**
   ```typescript
   // routers/v2/auth.ts
   export const authRouter = {
     // V2 auth endpoints
   };
   ```

3. **Create version index:**
   ```typescript
   // routers/v2/index.ts
   export { authRouter } from "./auth";
   // ... other exports

   export const v2Router = {
     ...authRouter,
     // ... combine all v2 routers
   };
   ```

4. **Update main router:**
   ```typescript
   // routers/index.ts
   import { v1Router } from "./v1";
   import { v2Router } from "./v2";

   export const appRouter = {
     v1: v1Router,
     v2: v2Router,
     ...v2Router, // Make V2 default for backward compatibility
   };
   ```

## Version Guidelines

- **Breaking Changes**: Require new version (v2, v3, etc.)
- **Additive Changes**: Can be added to existing version
- **Deprecation**: Mark old endpoints as deprecated before removal
- **Sunset Period**: Allow 6-12 months for migration

## Migration Strategy

When introducing breaking changes:

1. Create new version endpoints
2. Update clients to use new version
3. Deprecate old version endpoints
4. Remove old version after sunset period

## Testing

Each version should have its own test suite:
```
tests/
├── v1/
│   ├── auth.test.ts
│   └── course.test.ts
└── v2/
    ├── auth.test.ts
    └── course.test.ts
```