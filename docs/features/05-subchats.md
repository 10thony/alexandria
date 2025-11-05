# Subchats (Conversation Branching)

## Overview

Subchats allow users to create multiple conversation branches within a single Chef project. This enables users to explore different features, implementations, or directions without losing the original conversation context. Each subchat maintains its own message history while sharing the same project files.

## Key Components

### Backend Components

- **`convex/subchats.ts`** - Subchat creation and management
- **`convex/messages.ts`** - Message storage with subchat indexing
- **`convex/schema.ts`** - Database schema for subchat storage states

### Frontend Components

- **`SubchatBar.tsx`** - Subchat navigation UI
- **`SubchatLimitNudge.tsx`** - Warning when approaching subchat limit
- **`BaseChat.client.tsx`** - Subchat integration in chat UI

### State Management

- **`app/lib/stores/subchats.ts`** - Subchat state management

## Implementation Details

### Subchat Structure

Each subchat is identified by a `subchatIndex` (0-based):

- **Index 0**: Initial/main conversation
- **Index 1+**: Branch conversations
- **Maximum**: 400 subchats per project

### Database Schema

Subchats are stored in `chatMessagesStorageState` table:

```typescript
{
  chatId: Id<"chats">,
  storageId: Id<"_storage"> | null,
  subchatIndex: number,
  lastMessageRank: number,
  description?: string,
  partIndex: number,
  snapshotId?: Id<"_storage">
}
```

The `chats` table tracks:
- `lastSubchatIndex`: Highest subchat index created
- Subchat count determines available subchats

### Creating Subchats

When a user creates a new subchat:

1. **New Subchat Index**: `lastSubchatIndex + 1` assigned
2. **Storage State Created**: New `chatMessagesStorageState` record
3. **Snapshot Inherited**: Snapshot from previous subchat inherited
4. **Cleanup Scheduled**: Old storage states cleaned up
5. **Chat Updated**: `lastSubchatIndex` incremented

### Subchat Navigation

Users can:
- **Navigate Between Subchats**: Switch between subchats via dropdown
- **View Subchat History**: See all subchats and their descriptions
- **Create New Subchat**: Start a new conversation branch
- **Rewind to Subchat**: Rewind to specific point in subchat

### Storage State Management

Each subchat maintains multiple storage states:

- **Latest State**: Most recent message state
- **Historical States**: Previous states for rewinding
- **Cleanup**: Old states cleaned up to save storage
- **Part Updates**: States updated as messages stream

### Subchat Descriptions

Subchats can have descriptions:

- **Auto-generated**: Based on first message or feature
- **User-editable**: Descriptions can be updated
- **Display**: Shown in subchat navigation
- **Default**: "Initial chat" for index 0, "Feature #N" for others

## Code References

### Get Subchats
```17:49:convex/subchats.ts
export const get = query({
  args: {
    sessionId: v.id("sessions"),
    chatId: v.string(),
  },
  returns: v.array(v.object({ subchatIndex: v.number(), description: v.optional(v.string()), updatedAt: v.number() })),
  handler: async (ctx, args) => {
    const { chatId, sessionId } = args;
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id: chatId, sessionId });
    if (!chat) {
      throw CHAT_NOT_FOUND_ERROR;
    }

    let subchats: Doc<"chatMessagesStorageState">[] = [];
    for (let i = 0; i < chat.lastSubchatIndex + 1; i++) {
      const subchat = await ctx.db
        .query("chatMessagesStorageState")
        .withIndex("byChatId", (q) => q.eq("chatId", chat._id).eq("subchatIndex", i))
        .order("desc")
        .first();
      if (subchat === null) {
        continue;
      }
      subchats.push(subchat);
    }

    return subchats.map((subchat) => ({
      subchatIndex: subchat.subchatIndex,
      description: subchat.description,
      updatedAt: subchat._creationTime,
    }));
  },
});
```

### Create Subchat
```51:95:convex/subchats.ts
export const create = mutation({
  args: {
    sessionId: v.id("sessions"),
    chatId: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const { chatId, sessionId } = args;
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id: chatId, sessionId });
    if (!chat) {
      throw CHAT_NOT_FOUND_ERROR;
    }
    const latestStorageState = await getLatestChatMessageStorageState(ctx, {
      _id: chat._id,
      subchatIndex: chat.lastSubchatIndex,
    });
    const newSubchatIndex = chat.lastSubchatIndex + 1;
    if (newSubchatIndex > MAX_SUBCHATS) {
      throw new ConvexError({
        code: "TooManySubchats",
        message:
          "You have reached the maximum number of subchats. You must continue the conversation in the current subchat.",
      });
    }
    await ctx.db.insert("chatMessagesStorageState", {
      chatId: chat._id,
      storageId: null,
      lastMessageRank: -1,
      subchatIndex: newSubchatIndex,
      partIndex: -1,
      snapshotId: latestStorageState?.snapshotId,
    });
    await ctx.scheduler.runAfter(0, internal.subchats.cleanupOldSubchatStorageStates, {
      sessionId,
      chatId,
      newSubchatIndex,
      latestStorageState: latestStorageState?._id,
    });

    await ctx.db.patch(chat._id, {
      lastSubchatIndex: newSubchatIndex,
    });
    return newSubchatIndex;
  },
});
```

### Cleanup Old Storage States
```97:141:convex/subchats.ts
export const cleanupOldSubchatStorageStates = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    chatId: v.string(),
    newSubchatIndex: v.number(),
    latestStorageState: v.optional(v.id("chatMessagesStorageState")),
    cursor: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { chatId, sessionId, newSubchatIndex, latestStorageState, cursor } = args;
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id: chatId, sessionId });
    if (!chat) {
      throw CHAT_NOT_FOUND_ERROR;
    }

    const query = ctx.db
      .query("chatMessagesStorageState")
      .withIndex("byChatId", (q) => q.eq("chatId", chat._id).eq("subchatIndex", newSubchatIndex - 1))
      .order("asc");

    const result = await query.paginate({
      cursor: cursor ?? null,
      numItems: subchatCleanupBatchSize,
    });

    for (const storageState of result.page) {
      // Don't delete the latest storage state because this is the one we will rewind
      // to if the user rewinds to this subchat
      if (storageState._id !== latestStorageState) {
        await deleteStorageState(ctx, storageState);
      }
    }

    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, internal.subchats.cleanupOldSubchatStorageStates, {
        sessionId,
        chatId,
        newSubchatIndex,
        latestStorageState,
        cursor: result.continueCursor,
      });
    }
  },
});
```

## UI Features

### Subchat Bar

The subchat bar displays:
- **Current Subchat**: Highlighted current subchat
- **Subchat List**: Dropdown with all subchats
- **Navigation**: Previous/next buttons
- **Create Button**: Create new subchat
- **Rewind Options**: Rewind to subchat

### Subchat Limit Warning

- **Warning Threshold**: Shown when approaching limit
- **Limit Message**: Clear message about maximum subchats
- **Prevention**: Cannot create subchats beyond limit

## Message Isolation

Each subchat maintains separate:
- **Message History**: Independent message streams
- **Storage States**: Separate compression states
- **Snapshots**: Can have different snapshots
- **Context**: Context manager reset per subchat

## Rewind Support

Subchats support rewinding:
- **Subchat-Specific**: Rewind to specific subchat
- **Message-Specific**: Rewind to specific message in subchat
- **State Restoration**: Restore project state from subchat
- **Storage Cleanup**: Old states preserved for rewinding

## Related Features

- **Message Management**: Message storage with subchat indexing
- **Snapshots**: Snapshot inheritance across subchats
- **Chat Interface**: Subchat navigation in UI
- **Rewind Functionality**: Rewinding to subchat states

