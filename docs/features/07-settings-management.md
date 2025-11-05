# Settings Management

## Overview

The Settings Management feature allows users to configure their Chef account, including API keys, theme preferences, profile information, and usage statistics. Settings are stored per user and synchronized across sessions.

## Key Components

### Components

- **`SettingsContent.client.tsx`** - Main settings page
- **`ApiKeyCard.tsx`** - API key management UI
- **`ProfileCard.tsx`** - User profile management
- **`ThemeCard.tsx`** - Theme preference settings
- **`UsageCard.tsx`** - Usage statistics display

### Backend

- **`convex/apiKeys.ts`** - API key storage and retrieval
- **`convex/schema.ts`** - Settings schema

## Implementation Details

### API Key Management

Users can store API keys for multiple providers:

- **Anthropic**: Claude API key
- **OpenAI**: GPT API key
- **Google**: Gemini API key
- **XAI**: Grok API key

#### API Key Preferences

- **Always Use**: Always use user's API key
- **Quota Exhausted**: Use user's API key only when Convex quota exhausted
- **Never**: Never use user's API key (use Convex tokens)

### Theme Management

- **Light Theme**: Light color scheme
- **Dark Theme**: Dark color scheme
- **System Theme**: Follows system preference
- **Theme Persistence**: Stored in localStorage

### Profile Management

- **Username**: User's display name
- **Avatar**: User's profile picture
- **Email**: User's email address
- **Profile Sync**: Synced from WorkOS/cached profile

### Usage Statistics

- **Token Usage**: Display tokens used vs quota
- **Usage Percentage**: Visual progress bar
- **Team Usage**: Usage per team
- **Usage Refresh**: Manual refresh capability

## Code References

### Settings Route
Located in `app/routes/settings.tsx` - Settings page route

### API Key Storage
```typescript
// Schema for API keys
apiKeyValidator: {
  preference: "always" | "quotaExhausted",
  value?: string,  // Anthropic key
  openai?: string,
  xai?: string,
  google?: string
}
```

## Storage

- **API Keys**: Stored in `convexMembers.apiKey` field
- **Theme**: Stored in localStorage
- **Profile**: Cached in `convexMembers.cachedProfile`

## Security

- **API Key Encryption**: API keys stored securely in database
- **Access Control**: Only user can access their own API keys
- **Key Validation**: Keys validated before use

## Related Features

- **Authentication**: User authentication for settings access
- **Usage Tracking**: Usage statistics display
- **API Key Management**: API key storage and usage
- **Theme System**: Theme application throughout UI

