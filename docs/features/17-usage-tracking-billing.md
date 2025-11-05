# Usage Tracking & Billing

## Overview

Usage Tracking & Billing monitors token usage for AI model calls, manages quotas, and integrates with Convex's billing system. Users can track their usage, view quotas, and understand token consumption.

## Key Components

### Backend Components

- **`app/lib/.server/usage.ts`** - Usage tracking server-side
- **`app/lib/common/usage.ts`** - Usage calculation utilities
- **`convex/schema.ts`** - Usage record schema

### Frontend Components

- **`app/lib/stores/usage.ts`** - Usage state management
- **`app/components/settings/UsageCard.tsx`** - Usage display UI
- **`app/components/debug/UsageDebugView.tsx`** - Debug usage view

## Implementation Details

### Usage Calculation

Usage calculated from LLM responses:

- **Prompt Tokens**: Tokens in input
- **Completion Tokens**: Tokens in output
- **Cached Tokens**: Tokens from cache (if applicable)
- **Total Tokens**: Sum of all tokens

### Token Billing

Tokens billed based on:

- **Provider**: Different providers have different pricing
- **Model**: Model-specific pricing
- **Failed Calls**: Failed tool calls may not be billed
- **User API Keys**: Usage with user API keys not billed to Convex

### Usage Records

Usage records stored:

```typescript
{
  completionTokens: number,
  promptTokens: number,
  cachedPromptTokens: number  // Included in promptTokens
}
```

### Quota Management

Quotas managed per team:

- **Centitokens**: Usage tracked in centitokens (100x tokens)
- **Quota Limits**: Team-specific quotas
- **Quota Checking**: Quota checked before API calls
- **Exhaustion Handling**: Graceful handling when quota exhausted

### API Integration

Usage tracked via Convex provision host:

- **Get Usage**: `GET /api/dashboard/teams/{teamSlug}/usage/get_token_info`
- **Record Usage**: `POST /api/dashboard/teams/{teamSlug}/usage/record_tokens`
- **Token Info**: Returns used/quota/paid plan status

## Code References

### Usage Recording
```71:115:app/lib/.server/usage.ts
export async function recordUsage(
  provisionHost: string,
  token: string,
  modelProvider: ModelProvider,
  teamSlug: string,
  deploymentName: string | undefined,
  lastMessage: Message | undefined,
  finalGeneration: { usage: LanguageModelUsage; providerMetadata?: ProviderMetadata },
) {
  const totalUsageBilledFor = await calculateTotalBilledUsageForMessage(lastMessage, finalGeneration);
  const { chefTokens } = calculateChefTokens(totalUsageBilledFor, modelProvider);

  if (chefTokens === 0) {
    captureMessage('Recorded usage was 0. Something wrong with provider?', {
      level: 'error',
      tags: {
        teamSlug,
        deploymentName,
        modelProvider,
      },
    });
  }

  const Authorization = `Bearer ${token}`;
  const url = `${provisionHost}/api/dashboard/teams/${teamSlug}/usage/record_tokens`;

  logger.info('Logging total usage', JSON.stringify(totalUsageBilledFor), 'corresponding to chef tokens', chefTokens);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      centitokens: chefTokens,
    }),
  });
  if (!response.ok) {
    logger.error('Failed to record usage', response);
    logger.error(await response.json());
  }

  const { centitokensUsed, centitokensQuota } = await response.json();
  logger.info(`${teamSlug}/${deploymentName}: Tokens used: ${centitokensUsed} / ${centitokensQuota}`);
}
```

### Usage Query
```11:33:app/lib/stores/usage.ts
export function useTokenUsage(teamSlug: string | null): TeamUsageState {
  // getConvexAuthToken has a side effect may need
  const convex = useConvex();
  void getConvexAuthToken(convex);

  const usageByTeam = useStore(usageStore);

  useEffect(() => {
    if (!teamSlug) {
      return;
    }
    const subscribed = !!serverTeamUsageStore.get()[teamSlug];
    if (!subscribed) {
      serverTeamUsageStore.setKey(teamSlug, { isLoading: true, tokenUsage: null });
    }
  }, [teamSlug]);

  if (!teamSlug || !usageByTeam[teamSlug]) {
    return { isLoading: true, tokenUsage: null } as const;
  }
  const usage: TeamUsageState = usageByTeam[teamSlug];
  return usage;
}
```

### Get Token Usage
```35:65:app/lib/stores/usage.ts
export async function getTokenUsage(
  provisionHost: string,
  convexAuthToken: string,
  teamSlug: string,
): Promise<UsageData> {
  const url = `${provisionHost}/api/dashboard/teams/${teamSlug}/usage/get_token_info`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${convexAuthToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch usage: ${response.statusText}: ${body}`);
  }
  const {
    centitokensUsed,
    centitokensQuota,
    //isTeamDisabled,
    isPaidPlan,
  }: { centitokensUsed: number; centitokensQuota: number; isTeamDisabled: boolean; isPaidPlan: boolean } =
    await response.json();
  return {
    centitokensUsed,
    centitokensQuota,
    //isTeamDisabled,
    isPaidPlan,
  };
}
```

## Usage Display

Usage displayed in:

- **Settings Page**: Usage card with statistics
- **Debug View**: Detailed usage breakdown
- **Usage Percentage**: Visual progress bar
- **Token Counts**: Displayed in user-friendly format

## Chef Tokens

Chef uses "chef tokens" as a normalized unit:

- **Normalization**: Different providers normalized to chef tokens
- **Pricing**: Based on provider/model pricing
- **Centitokens**: Stored as centitokens (100x tokens)

## Related Features

- **Authentication**: Team-based usage tracking
- **API Key Management**: User API keys affect billing
- **Project Deployment**: Usage tracked per deployment
- **Settings Management**: Usage display in settings

