# Model Selection

## Overview

Model Selection allows users to choose which AI model/provider to use for their requests. Chef supports multiple providers (Anthropic, OpenAI, Google, XAI) with automatic provider selection and manual override options.

## Key Components

### Components

- **`ModelSelector.tsx`** - Model selection UI
- **`app/lib/.server/llm/provider.ts`** - Provider management
- **`app/components/chat/Chat.tsx`** - Model selection integration

## Implementation Details

### Supported Providers

- **Anthropic**: Claude models (Sonnet, Opus, Haiku)
- **OpenAI**: GPT models (GPT-4, GPT-3.5)
- **Google**: Gemini models (Gemini Pro, Gemini Flash)
- **XAI**: Grok models

### Model Selection Modes

- **Auto**: Automatic provider/model selection
- **Manual**: User selects specific model
- **Provider Selection**: Select provider, model chosen automatically

### Selection Logic

Model selected based on:

- **User Preference**: User's manual selection
- **API Key Availability**: Available API keys
- **Quota Status**: Convex quota status
- **Model Availability**: Available models
- **Feature Flags**: LaunchDarkly feature flags

### Model Storage

Selected model stored in:

- **localStorage**: Model preference persisted
- **State**: Model state in React
- **API Calls**: Model sent with API requests

## Code References

### Model Selection
Model selection handled in Chat component:
```typescript
const [modelSelection, setModelSelection] = useLocalStorage<ModelSelection>('modelSelection', 'auto');
```

## Model Configuration

Models configured with:

- **Model IDs**: Provider-specific model IDs
- **Pricing**: Model pricing information
- **Capabilities**: Model capabilities
- **Requirements**: API key requirements

## Auto Mode

Auto mode selects:

- **Best Model**: Best model for task
- **Available Provider**: Provider with available quota/keys
- **Cost Optimization**: Cost-optimized selection
- **Performance**: Performance-optimized selection

## Related Features

- **API Key Management**: Keys required for some models
- **Usage Tracking**: Usage tracked per provider
- **Chat Interface**: Model selection UI
- **Agent Loop**: Model used for agent calls

