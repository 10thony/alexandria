# Project Deployment (Convex Integration)

## Overview

Chef integrates with Convex to provision and deploy projects. Users can connect their Chef projects to Convex deployments, allowing them to deploy their applications to production. The system handles project provisioning, credential management, and deployment tracking.

## Key Components

### Backend Components

- **`convex/convexProjects.ts`** - Convex project management functions
- **`convex/deploy.ts`** - Deployment tracking
- **`convex/schema.ts`** - Database schema for project credentials

### Frontend Components

- **`ConvexConnectButton.tsx`** - UI for connecting Convex projects
- **`ConvexConnection.tsx`** - Connection status display
- **`TeamSelector.tsx`** - Team selection for projects
- **`Dashboard.tsx`** - Project dashboard view

## Implementation Details

### Project Provisioning Flow

1. **User Initiates Connection**: User clicks "Connect to Convex" button
2. **OAuth Flow**: User authenticates with Convex.dev
3. **Project Creation**: System creates a new Convex project via API
4. **Credential Storage**: Project deploy key and credentials stored securely
5. **Connection Status**: Connection status tracked in chat metadata

### Connection States

Projects can be in three states:

1. **`connecting`**: OAuth flow in progress
2. **`connected`**: Successfully connected with credentials
3. **`failed`**: Connection failed with error message

### Database Schema

```typescript
// chats table includes:
convexProject: {
  kind: "connected" | "connecting" | "failed",
  projectSlug?: string,
  teamSlug?: string,
  deploymentUrl?: string,
  deploymentName?: string,
  warningMessage?: string,
  checkConnectionJobId?: Id<"_scheduled_functions">,
  errorMessage?: string
}

// convexProjectCredentials table:
{
  projectSlug: string,
  teamSlug: string,
  memberId?: Id<"convexMembers">,
  projectDeployKey: string
}
```

### Key Functions

#### Start Provisioning
```typescript
startProvisionConvexProject: Starts the OAuth flow for connecting a project
```

#### Connect Project (OAuth)
```typescript
connectConvexProjectForOauth: Handles OAuth callback and project creation
```

#### Record Credentials
```typescript
recordProvisionedConvexProjectCredentials: Stores project credentials after successful connection
```

#### Check Connection
```typescript
checkConnection: Validates connection status with timeout
```

### Deployment Tracking

- **Deployment Status**: Tracked in `chats.hasBeenDeployed`
- **Deployment Recording**: `recordDeploy` mutation records successful deployments
- **Deployment History**: Deployment state queried via `hasBeenDeployed`

### Environment Variables

When a project is connected, the system automatically:

1. Sets up Convex environment variables in WebContainer
2. Configures deployment URL
3. Sets up authentication tokens
4. Configures Convex auth component

### API Integration

The system integrates with Convex's provision host API:

- **Create Project**: `POST /api/create_project`
- **Get Usage**: `GET /api/dashboard/teams/{teamSlug}/usage/get_token_info`
- **Record Usage**: `POST /api/dashboard/teams/{teamSlug}/usage/record_tokens`

## Code References

### Project Provisioning
```102:143:convex/convexProjects.ts
export async function startProvisionConvexProjectHelper(
  ctx: MutationCtx,
  args: {
    sessionId: Id<"sessions">;
    chatId: string;
    projectInitParams?: {
      teamSlug: string;
      workosAccessToken: string;
    };
  },
): Promise<void> {
  const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id: args.chatId, sessionId: args.sessionId });
  if (!chat) {
    throw new ConvexError({ code: "NotAuthorized", message: "Chat not found" });
  }
  const session = await ctx.db.get(args.sessionId);
  if (!session) {
    console.error(`Session not found: ${args.sessionId}`);
    throw new ConvexError({ code: "NotAuthorized", message: "Chat not found" });
  }
  if (session.memberId === undefined) {
    throw new ConvexError({ code: "NotAuthorized", message: "Must be logged in to connect a project" });
  }
  // OAuth flow
  if (args.projectInitParams === undefined) {
    console.error(`Must provide projectInitParams for oauth: ${args.sessionId}`);
    throw new ConvexError({ code: "NotAuthorized", message: "Invalid flow for connecting a project" });
  }

  await ctx.scheduler.runAfter(0, internal.convexProjects.connectConvexProjectForOauth, {
    sessionId: args.sessionId,
    chatId: args.chatId,
    accessToken: args.projectInitParams.workosAccessToken,
    teamSlug: args.projectInitParams.teamSlug,
  });
  const jobId = await ctx.scheduler.runAfter(CHECK_CONNECTION_DEADLINE_MS, internal.convexProjects.checkConnection, {
    sessionId: args.sessionId,
    chatId: args.chatId,
  });
 { kind: "connecting", checkConnectionJobId: jobId } });
  return;
}
```

### Deployment Recording
```5:17:convex/deploy.ts
export const recordDeploy = mutation({
  args: {
    sessionId: v.id("sessions"),
    id: v.string(),
  },
  handler: async (ctx, { id, sessionId }) => {
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id, sessionId });
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    await ctx.db.patch(chat._id, { hasBeenDeployed: true });
  },
});
```

## Security Considerations

- **Deploy Keys**: Stored securely in Convex database
- **Access Control**: Only chat creator can access credentials
- **OAuth Tokens**: Temporary tokens used only during setup
- **Credential Isolation**: Credentials isolated per project

## Error Handling

- **Connection Timeouts**: Automatic timeout with error state
- **OAuth Failures**: Error messages displayed to user
- **API Failures**: Retry logic with exponential backoff
- **Invalid Credentials**: Clear error messages

## Related Features

- **Authentication & User Management**: User authentication for OAuth
- **Usage Tracking & Billing**: Token usage for deployments
- **WebContainer Integration**: Environment setup in container
- **Settings Management**: Team selection and project preferences

