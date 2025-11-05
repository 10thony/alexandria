# API Key Management

## Overview

API Key Management allows users to store and manage API keys for multiple AI providers (Anthropic, OpenAI, Google, XAI). Users can configure when their API keys should be used instead of Convex-provided tokens.

## Key Components

### Backend Components

- **`convex/apiKeys.ts`** - API key storage and retrieval
- **`convex/schema.ts`** - API key schema

### Frontend Components

- **`app/components/settings/ApiKeyCard.tsx`** - API key UI
- **`app/lib/common/apiKey.ts`** - API key utilities

## Implementation Details

### API Key Storage

API keys stored in database:

```typescript
{
  preference: "always" | "quotaExhausted",
  value?: string,      // Anthropic key
  openai?: string,     // OpenAI key
  xai?: string,        // XAI key
  google?: string      // Google key
}
```

### API Key Preferences

- **Always**: Always use user's API key
- **Quota Exhausted**: Use user's API key only when Convex quota exhausted
- **Never**: Never use user's API key (default)

### Provider Support

- **Anthropic**: Claude API key
- **OpenAI**: GPT API key
- **Google**: Gemini API key
- **XAI**: Grok API key

### API Key Usage

API keys used based on:

- **Preference Setting**: User's preference
- **Quota Status**: Convex quota status
- **Model Selection**: Selected model/provider
- **Manual Selection**: User manually selected model

## Code References

### API Key Schema
```6:13:convex/schema.ts
export const apiKeyValidator = v.object({
  preference: v.union(v.literal("always"), v.literal("quotaExhausted")),
  // NB: This is the *Anthropic* API key.
  value: v.optional(v.string()),
  openai: v.optional(v.string()),
  xai: v.optional(v.string()),
  google: v.optional(v.string()),
});
```

## Security

- **Encryption**: API keys stored securely
- **Access Control**: Only user can access their keys
- **Key Validation**: Keys validated before use
- **No Logging**: Keys not logged or exposed

## Usage Flow

1. **User Sets Key**: User enters API key in settings
2. **Key Storage**: Key stored in database
3. **Preference Set**: User sets preference
4. **Key Selection**: System selects key based on preference/quota
5. **Key Usage**: Key used for API calls

## Related Features

- **Settings Management**: API key UI in settings
- **Usage Tracking**: Usage with user keys not billed
- **Model Selection**: Key selection based on model
- **Authentication**: Keys linked to authenticated users

