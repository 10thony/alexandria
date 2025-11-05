# Message Management & Storage

## Overview

Message Management & Storage handles the persistence, compression, and retrieval of chat messages. Messages are stored in Convex using LZ4 compression to minimize storage costs while maintaining fast retrieval.

## Key Components

### Backend Components

- **`convex/messages.ts`** - Message storage and retrieval functions
- **`convex/compressMessages.ts`** - Message compression utilities
- **`convex/lz4.ts`** - LZ4 compression implementation
- **`convex/schema.ts`** - Database schema for message storage

### Frontend Components

- **`app/lib/stores/startup/messages.ts`** - Message state management
- **`app/lib/hooks/useMessageParser.ts`** - Message parsing and caching

## Implementation Details

### Message Storage

Messages are stored in `chatMessagesStorageState` table:

```typescript
{
  chatId: Id<"chats">,
  storageId: Id<"_storage"> | null,  // Compressed message storage
  subchatIndex: number,
  lastMessageRank: number,
  partIndex: number,
  description?: string,
  snapshotId?: Id<"_storage">
}
```

### Compression

Messages are compressed using LZ4 compression:

1. **Serialization**: Messages serialized to JSON
2. **Compression**: JSON compressed using LZ4
3. **Storage**: Compressed data stored in Convex file storage
4. **Decompression**: Messages decompressed on retrieval

### Message State Management

Each chat maintains multiple storage states:

- **Latest State**: Most recent message state
- **Historical States**: Previous states for rewinding
- **Part Updates**: States updated incrementally as messages stream
- **Cleanup**: Old states cleaned up to save storage

### Storage State Updates

When new messages arrive:

1. **New Messages**: New messages added to current state
2. **Part Updates**: If same message rank, part updated
3. **New State**: If new message rank, new state created
4. **Compression**: Messages compressed before storage
5. **Storage ID**: Storage ID updated in state record

## Code References

### Message Compression
```4:8:convex/compressMessages.ts
export async function compressMessages(messages: SerializedMessage[]) {
  const lz4 = await Lz4.initialize();
  const compressed = lz4.compress(new TextEncoder().encode(JSON.stringify(messages)));
  return compressed;
}
```

### Storage State Update
```232:342:convex/messages.ts
export const updateStorageState = internalMutation({
  // Updates storage state with new messages
  // Handles part updates and new message ranks
  // Manages storage cleanup
});
```

### Message Retrieval
```176:200:convex/messages.ts
export const getInitialMessagesStorageInfo = internalQuery({
  // Retrieves latest storage state for subchat
  // Returns storage ID and message metadata
});
```

## Message Format

Messages follow the AI SDK format:

```typescript
{
  id: string,
  role: "user" | "assistant" | "system",
  content: string,
  createdAt?: Date,
  parts?: MessagePart[]
}
```

## Subchat Support

Messages are indexed by subchat:

- **Subchat Index**: Each storage state includes subchat index
- **Subchat Isolation**: Messages isolated per subchat
- **Cross-Subchat**: Messages can reference other subchats

## Cleanup Strategy

Old storage states are cleaned up:

- **Automatic Cleanup**: Old states deleted after new subchat created
- **Share Preservation**: States referenced by shares preserved
- **Snapshot Preservation**: States with snapshots preserved
- **Batch Cleanup**: Cleanup performed in batches

## Performance Optimizations

- **LZ4 Compression**: Fast compression algorithm
- **Incremental Updates**: Only new messages compressed
- **Caching**: Message parsing cached client-side
- **Lazy Loading**: Messages loaded on demand

## Related Features

- **Compression/Decompression**: LZ4 compression implementation
- **Subchats**: Subchat-specific message storage
- **Snapshots**: Snapshot integration with messages
- **Chat Interface**: Message display and interaction

