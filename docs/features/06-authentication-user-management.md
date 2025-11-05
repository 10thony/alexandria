# Authentication & User Management

## Overview

Chef uses Convex.dev authentication via WorkOS for user management. The system supports session-based authentication, user profile caching, team management, and admin access control.

## Key Components

### Backend Components

- **`convex/sessions.ts`** - Session management and user authentication
- **`convex/auth.config.ts`** - WorkOS JWT authentication configuration
- **`convex/admin.ts`** - Admin access control
- **`convex/schema.ts`** - Database schema for users and sessions

### Frontend Components

- **`ChefAuthWrapper.tsx`** - Authentication wrapper component
- **`UserProvider.tsx`** - User context provider
- **`TeamSelector.tsx`** - Team selection UI

## Implementation Details

### Authentication Flow

1. **User Authentication**: User authenticates with Convex.dev via WorkOS
2. **JWT Token**: WorkOS provides JWT token with user identity
3. **Member Creation**: Convex member record created/updated
4. **Session Creation**: Session created and linked to member
5. **Token Storage**: Session ID stored in localStorage

### Database Schema

```typescript
// sessions table
{
  memberId?: Id<"convexMembers">  // Optional for anonymous sessions
}

// convexMembers table
{
  tokenIdentifier: string,
  apiKey?: ApiKeyValidator,
  convexMemberId?: string,
  softDeletedForWorkOSMerge?: boolean,
  cachedProfile?: {
    username: string,
    avatar: string,
    email: string,
    id: string
  }
}

// convexAdmins table (admin status)
{
  convexMemberId: Id<"convexMembers">,
  lastCheckedForAdminStatus: number,
  wasAdmin: boolean
}
```

### Session Management

#### Session Creation

- **Anonymous Sessions**: Created without memberId for unauthenticated users
- **Authenticated Sessions**: Linked to convexMembers via memberId
- **Session Persistence**: Session ID stored in localStorage
- **Session Validation**: Sessions validated against WorkOS identity

#### Session Validation

```typescript
// Validates session matches authenticated user
isValidSessionForConvexOAuth: Checks session member matches identity
```

### User Profile Caching

User profiles are cached from WorkOS/provision host:

- **Profile Cache**: Stored in `convexMembers.cachedProfile`
- **Cache Updates**: Updated when user authenticates
- **Profile Fields**: Username, avatar, email, ID

### Team Management

- **Team Selection**: Users can select Convex teams
- **Team Storage**: Selected team stored in state
- **Team Validation**: Teams validated against user's access

### Admin Access

Admin status determined by:

- **Team Membership**: Must be on Convex team
- **Status Caching**: Admin status cached for 7 days
- **Status Refresh**: Automatically refreshed
- **Access Control**: Admin functions protected

## Code References

### Session Creation
```99:115:convex/sessions.ts
export const startSession = mutation({
  args: {},
  returns: v.id("sessions"),
  handler: async (ctx) => {
    const member = await getOrCreateCurrentMember(ctx);
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("byMemberId", (q) => q.eq("memberId", member))
      .unique();
    if (existingSession) {
      return existingSession._id;
    }
    return ctx.db.insert("sessions", {
      memberId: member,
    });
  },
});
```

### Member Creation
```117:192:convex/sessions.ts
async function getOrCreateCurrentMember(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "NotAuthorized", message: "Unauthorized" });
  }
  const existingMembers = await getMemberByConvexMemberIdQuery(ctx, identity).collect();
  const existingMember = existingMembers[0];
  if (existingMembers.length > 1) {
    // Migration logic for duplicate members
    // ...
  }
  // Member creation/update logic
  // ...
}
```

### Auth Configuration
```1:13:convex/auth.config.ts
const clientId = process.env.WORKOS_CLIENT_ID;

export default {
  providers: [
    {
      type: "customJwt",
      issuer: `https://apiauth.convex.dev/user_management/${clientId}`,
      algorithm: "RS256",
      jwks: `https://apiauth.convex.dev/sso/jwks/${clientId}`,
      applicationID: clientId,
    },
  ],
};
```

### Admin Check
```12:42:convex/admin.ts
export async function assertIsConvexAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "NotAuthorized", message: "Unauthorized" });
  }

  const member = await getMemberByConvexMemberIdQuery(ctx, identity).first();

  if (!member) {
    throw new ConvexError({ code: "NotAuthorized", message: "Unauthorized" });
  }

  const adminStatus = await ctx.db
    .query("convexAdmins")
    .withIndex("byConvexMemberId", (q) => q.eq("convexMemberId", member._id))
    .unique();

  if (!adminStatus) {
    throw new ConvexError({ code: "NotAuthorized", message: "Not a Convex admin" });
  }

  if (!adminStatus.wasAdmin) {
    throw new ConvexError({ code: "NotAuthorized", message: "Not a Convex admin" });
  }

  if (adminStatus.lastCheckedForAdminStatus < Date.now() - STALE_ADMIN_STATUS_ALLOWED_MS) {
    throw new ConvexError({ code: "NotAuthorized", message: "Need to refresh auth" });
  }

  return { member, adminStatus };
}
```

## Security Features

- **JWT Validation**: WorkOS JWT tokens validated with RS256
- **Session Isolation**: Sessions isolated per user
- **Unguessable IDs**: Session IDs are unguessable UUIDs
- **Access Control**: Functions check session ownership
- **Admin Protection**: Admin functions require admin status

## OAuth Integration

- **WorkOS OAuth**: Integrated with WorkOS for authentication
- **Token Management**: Access tokens managed securely
- **OAuth Callbacks**: Handled via callback routes
- **Token Refresh**: Automatic token refresh

## Related Features

- **Project Deployment**: Uses authentication for Convex project connection
- **API Key Management**: Linked to authenticated users
- **Usage Tracking**: Team-based usage tracking
- **Settings Management**: User-specific settings

