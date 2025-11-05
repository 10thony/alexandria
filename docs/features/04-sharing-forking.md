# Sharing & Forking

## Overview

Chef supports two types of sharing: **snapshot sharing** (for forking at specific points) and **social sharing** (for sharing projects publicly). Users can create shareable links, fork projects into their accounts, and share projects with thumbnails and descriptions.

## Key Components

### Backend Components

- **`convex/share.ts`** - Snapshot sharing and forking logic
- **`convex/socialShare.ts`** - Social sharing functionality
- **`convex/schema.ts`** - Database schema for shares

### Frontend Components

- **`ShareButton.tsx`** - Share dialog and controls
- **`share.$code.tsx`** - Share link viewing page
- **`create.$shareCode.tsx`** - Fork project page

## Implementation Details

### Two Types of Shares

#### 1. Snapshot Shares (Forking)

Used for creating forkable snapshots at specific points in time:

- **Purpose**: Allow users to fork projects at specific states
- **Storage**: Stores snapshot ID and chat history
- **Access**: Private share codes (not public)
- **Use Case**: Debugging, branching, version control

#### 2. Social Shares (Public Sharing)

Used for sharing projects publicly:

- **Purpose**: Share projects with others publicly
- **Storage**: Stores project metadata and thumbnail
- **Access**: Public share codes
- **Use Case**: Showcasing, collaboration, demos

### Database Schema

```typescript
// shares table (forking)
{
  chatId: Id<"chats">,
  snapshotId: Id<"_storage">,
  code: string,
  chatHistoryId: Id<"_storage"> | null,
  lastMessageRank: number,
  lastSubchatIndex: number,
  partIndex?: number,
  description?: string
}

// socialShares table (public sharing)
{
  chatId: Id<"chats">,
  code: string,
  thumbnailImageStorageId?: Id<"_storage">,
  shared: "shared" | "expresslyUnshared" | "noPreferenceExpressed",
  allowForkFromLatest: boolean,
  allowShowInGallery: boolean,
  linkToDeployed: boolean,
  referralCode?: string
}
```

### Share Code Generation

Share codes are generated using UUIDs:

```typescript
// 6-character codes from UUID (without dashes)
const code = crypto.randomUUID().replace(/-/g, "").substring(0, 6);
```

Codes are unique across both `shares` and `socialShares` tables.

### Forking Flow

1. **User Views Share**: Access share link with code
2. **Share Validation**: System validates share code exists
3. **Project Creation**: New chat created for forked project
4. **Snapshot Restoration**: Snapshot loaded into new chat
5. **Message History**: Chat history cloned from share
6. **Project Provisioning**: New Convex project optionally created

### Social Sharing Flow

1. **User Enables Sharing**: Toggle sharing in share dialog
2. **Code Generation**: Unique share code generated
3. **Thumbnail Creation**: Optional screenshot of preview
4. **Share Link**: Link generated (e.g., `chef.show/{code}`)
5. **Public Access**: Anyone with link can view project

### Share Dialog Features

- **Share Toggle**: Enable/disable sharing
- **Thumbnail Upload**: Upload project screenshot
- **Link Copying**: Copy share link to clipboard
- **Fork Settings**: Control whether project can be forked
- **Referral Code**: Optional referral code for Convex signup

## Code References

### Create Share
```8:53:convex/share.ts
export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    id: v.string(),
  },
  handler: async (ctx, { sessionId, id }) => {
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id, sessionId });
    if (!chat) {
      throw new ConvexError("Chat not found");
    }

    const code = await generateUniqueCode(ctx.db);

    const storageState = await getLatestChatMessageStorageState(ctx, {
      _id: chat._id,
      subchatIndex: chat.lastSubchatIndex,
    });

    if (!storageState) {
      throw new ConvexError("Your project has never been saved.");
    }
    if (storageState.storageId === null && chat.lastSubchatIndex === 0) {
      throw new ConvexError("Chat history not found");
    }
    const snapshotId = storageState.snapshotId ?? chat.snapshotId;
    if (!snapshotId) {
      throw new ConvexError("Your project has never been saved.");
    }
    await ctx.db.insert("shares", {
      chatId: chat._id,

      // It is safe to use the snapshotId from the chat because the user's
      // snapshot excludes .env.local.
      snapshotId,

      chatHistoryId: storageState.storageId,

      code,
      lastMessageRank: storageState.lastMessageRank,
      lastSubchatIndex: chat.lastSubchatIndex,
      partIndex: storageState.partIndex,
      description: chat.description,
    });
    return { code };
  },
});
```

### Clone Show (Fork)
```122:133:convex/share.ts
export async function cloneShow(
  ctx: MutationCtx,
  {
    showCode,
    sessionId,
    projectInitParams,
  }: {
    showCode: string;
    sessionId: Id<"sessions">;
    projectInitParams: { teamSlug: string; workosAccessToken: string };
  },
): Promise<{ id: string; description?: string }> {
```

### Social Share
```8:61:convex/socialShare.ts
export const share = mutation({
  args: {
    sessionId: v.id("sessions"),
    id: v.string(),
    shared: v.union(v.literal("shared"), v.literal("expresslyUnshared"), v.literal("noPreferenceExpressed")),
    allowForkFromLatest: v.boolean(),
    thumbnailImageStorageId: v.optional(v.id("_storage")),
    referralCode: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { sessionId, id, shared, allowForkFromLatest, referralCode }) => {
    // Validate referral code if set
    if (referralCode !== undefined && referralCode !== null) {
      // Only allow alphanumeric, dashes, and underscores
      if (!/^[a-zA-Z0-9_-]+$/.test(referralCode)) {
        throw new ConvexError("Invalid referral code: must be alphanumeric, dashes, or underscores only");
      }
    }
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id, sessionId });
    if (!chat) {
      throw new ConvexError("Chat not found");
    }
    const existing = await ctx.db
      .query("socialShares")
      .withIndex("byChatId", (q) => q.eq("chatId", chat._id))
      .unique();

    // Not currently configurable but behavior we'll want to remember for later.
    const linkToDeployed = true;
    const allowShowInGallery = false;

    if (!existing) {
      const code = await generateUniqueCode(ctx.db);
```

## Share Link Format

- **Production**: `https://chef.show/{code}`
- **Development**: `{origin}/share/{code}`
- **Fork Links**: `{origin}/create/{code}`

## Thumbnail Management

- Thumbnails stored in Convex file storage
- Optional screenshot capture from preview
- Thumbnail images displayed in share cards
- Referenced via `thumbnailImageStorageId`

## Referral System

- Referral codes can be attached to shares
- Used for Convex signup bonuses
- Validated for alphanumeric, dashes, underscores only
- Stored in `socialShares.referralCode`

## Security Considerations

- **Share Codes**: Short codes are unguessable enough for private sharing
- **Access Control**: Share validation ensures shares exist
- **Fork Permissions**: `allowForkFromLatest` controls forking
- **Privacy**: Users can explicitly unshare projects

## Related Features

- **Snapshots**: Project state snapshots for sharing
- **Message Management**: Chat history cloning for forks
- **Project Deployment**: Deployment information in shares
- **Authentication**: User authentication for creating shares

