# Snapshots (Project State)

## Overview

Snapshots capture the complete state of a Chef project at a point in time, including all files and project configuration. Snapshots enable project restoration, sharing, and forking functionality.

## Key Components

### Backend Components

- **`convex/snapshot.ts`** - Snapshot storage and retrieval
- **`convex/schema.ts`** - Snapshot schema in chats table
- **`make-bootstrap-snapshot.js`** - Bootstrap snapshot creation

### Frontend Components

- **`app/lib/stores/startup/useContainerSetup.ts`** - Snapshot loading
- **`app/lib/snapshot.client.ts`** - Snapshot client utilities

## Implementation Details

### Snapshot Creation

Snapshots are created by:

1. **File Collection**: All files collected from WebContainer
2. **Compression**: Files compressed using LZ4
3. **Storage**: Compressed snapshot stored in Convex file storage
4. **Reference**: Snapshot ID stored in chat record

### Snapshot Storage

Snapshots stored in Convex file storage:

- **Storage ID**: Reference stored in `chats.snapshotId`
- **Subchat Snapshots**: Also stored in `chatMessagesStorageState.snapshotId`
- **Compression**: Snapshots compressed for efficiency

### Snapshot Loading

When loading a chat:

1. **Snapshot URL**: Snapshot URL retrieved from Convex
2. **Download**: Snapshot downloaded from storage
3. **Decompression**: Snapshot decompressed
4. **Mount**: Files mounted to WebContainer
5. **Dependencies**: npm install run to restore dependencies

### Bootstrap Snapshots

Template snapshots created for new projects:

- **Template Files**: Standard project template
- **Pre-compressed**: Snapshots pre-compressed for faster loading
- **Version Control**: Different template versions available

## Code References

### Save Snapshot
```6:22:convex/snapshot.ts
export const saveSnapshot = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    chatId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { sessionId, chatId, storageId }) => {
    const chat = await getChatByIdOrUrlIdEnsuringAccess(ctx, { id: chatId, sessionId });
    if (!chat) {
      throw new Error("Chat not found");
    }
    await ctx.db.patch(chat._id, {
      snapshotId: storageId,
    });
  },
});
```

### Get Snapshot URL
```24:54:convex/snapshot.ts
export const getSnapshotUrl = query({
  args: {
    sessionId: v.id("sessions"),
    chatId: v.string(),
  },
  handler: async (ctx, { sessionId, chatId }) => {
    // Retrieves snapshot URL from storage state or chat
    // Maintains backwards compatibility
  },
});
```

### Container Setup
```72:122:app/lib/stores/startup/useContainerSetup.ts
async function setupContainer(
  convex: ConvexReactClient,
  options: { snapshotUrl: string; allowNpmInstallFailure: boolean },
) {
  const resp = await fetch(options.snapshotUrl);
  if (!resp.ok) {
    throw new Error(`Failed to download snapshot (${resp.statusText}): ${resp.statusText}`);
  }
  const compressed = await resp.arrayBuffer();
  const decompressed = decompressWithLz4(new Uint8Array(compressed));

  const container = await webcontainer;
  await container.mount(decompressed);
  // ... setup continues
}
```

## Snapshot Contents

Snapshots include:

- **Source Files**: All TypeScript/JavaScript files
- **Configuration**: package.json, tsconfig.json, etc.
- **Public Assets**: Public folder contents
- **Convex Functions**: Backend code
- **Excluded**: node_modules, .env.local (excluded for security)

## Snapshot Lifecycle

1. **Creation**: Snapshot created after project changes
2. **Storage**: Stored in Convex file storage
3. **Reference**: Reference stored in chat/subchat
4. **Loading**: Loaded when chat opened
5. **Cleanup**: Old snapshots cleaned up when unused

## Compression

Snapshots use LZ4 compression:

- **Fast Compression**: LZ4 provides fast compression
- **Good Ratio**: Good compression ratio for text files
- **WASM Implementation**: Compression in browser via WASM

## Related Features

- **Sharing & Forking**: Snapshots used for sharing
- **Message Management**: Snapshots linked to message states
- **WebContainer Integration**: Snapshots mounted to WebContainer
- **Compression/Decompression**: LZ4 compression for snapshots

