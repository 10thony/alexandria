# Debug Features

## Overview

Debug Features provide tools for developers to debug Chef's behavior, including prompt viewing, usage breakdown, and debugging utilities. These features help diagnose issues and understand system behavior.

## Key Components

### Components

- **`DebugPromptView.tsx`** - Debug prompt display
- **`UsageDebugView.tsx`** - Usage debugging
- **`UsageBreakdownView.tsx`** - Usage breakdown
- **`DraggableDebugView.tsx`** - Draggable debug panel

### Backend Components

- **`convex/debugPrompt.ts`** - Debug prompt storage
- **`convex/schema.ts`** - Debug schema (debugChatApiRequestLog)

## Implementation Details

### Debug Prompt Viewing

Debug prompts stored for analysis:

- **Prompt Storage**: Full prompts stored in database
- **Response Storage**: Full responses stored
- **Usage Information**: Token usage logged
- **Model Information**: Model used logged

### Usage Breakdown

Detailed usage breakdown:

- **Per-Message Usage**: Usage per message
- **Tool Call Usage**: Usage per tool call
- **Provider Usage**: Usage per provider
- **Total Usage**: Aggregate usage

### Debug Data Schema

```typescript
// debugChatApiRequestLog table
{
  chatId: Id<"chats">,
  subchatIndex?: number,
  responseCoreMessages: CoreMessage[],
  promptCoreMessagesStorageId: Id<"_storage">,
  finishReason: string,
  modelId: string,
  usage: UsageRecord,
  chefTokens: number
}
```

### Debug Features

- **Prompt Viewing**: View full prompts sent to LLM
- **Response Viewing**: View full responses
- **Usage Debugging**: Debug usage calculations
- **Error Debugging**: Debug error handling
- **State Debugging**: Debug application state

## Code References

### Debug Prompt Storage
Located in `convex/debugPrompt.ts` - Debug prompt functions

### Usage Debug View
Located in `app/components/debug/UsageDebugView.tsx` - Usage debugging UI

## Admin Access

Debug features may require:

- **Admin Status**: Admin access for some features
- **Development Mode**: Development mode for local debugging
- **Feature Flags**: Feature flags for debug features

## Related Features

- **Usage Tracking**: Usage debugging
- **Agent Loop**: Prompt/response debugging
- **Authentication**: Admin access control

