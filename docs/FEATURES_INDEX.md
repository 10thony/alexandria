# Chef Features & Components Index

This document provides a comprehensive index of all features and components in the Chef application. Each feature has its own detailed documentation file.

## Core User-Facing Features

### 1. [Chat Interface](./features/01-chat-interface.md)
The main interactive UI where users communicate with Chef to build applications. Includes message display, input handling, streaming responses, and model selection.

### 2. [Workbench/Code Editor](./features/02-workbench-code-editor.md)
The integrated development environment featuring file tree navigation, code editing with CodeMirror, terminal integration, and live preview panels.

### 3. [Project Deployment (Convex Integration)](./features/03-project-deployment.md)
Connect Chef projects to Convex deployments, provision new projects, manage deployment credentials, and deploy applications.

### 4. [Sharing & Forking](./features/04-sharing-forking.md)
Share projects with shareable links, create snapshots for forking, social sharing with thumbnails, and fork projects into new accounts.

### 5. [Subchats (Conversation Branching)](./features/05-subchats.md)
Create multiple conversation branches within a single project, allowing users to explore different features or implementations in parallel.

### 6. [Authentication & User Management](./features/06-authentication-user-management.md)
User authentication via Convex.dev, session management, profile caching, team management, and admin access control.

### 7. [Settings Management](./features/07-settings-management.md)
User settings including API key management, theme preferences, profile editing, and usage statistics.

### 8. [Download Projects](./features/08-download-projects.md)
Export projects as downloadable ZIP files with all source code, configuration files, and setup instructions.

## Technical & Backend Features

### 9. [Message Management & Storage](./features/09-message-management-storage.md)
Message storage, compression, retrieval, chat history management, and message state synchronization.

### 10. [Snapshots (Project State)](./features/10-snapshots.md)
Project state snapshots for persistence, sharing, and restoration. Includes compression and decompression.

### 11. [Agent Loop & Tools](./features/11-agent-loop-tools.md)
The Chef AI agent that processes user requests, manages tool calls (edit, view, deploy, npmInstall, etc.), and generates code artifacts.

### 12. [WebContainer Integration](./features/12-webcontainer-integration.md)
Browser-based Node.js runtime using WebContainer API for running code, managing files, and executing commands in the browser.

### 13. [Terminal/Shell](./features/13-terminal-shell.md)
Integrated terminal interface with multiple tabs, command execution, output streaming, and terminal state management.

### 14. [Preview System](./features/14-preview-system.md)
Live preview panels for running applications, multiple preview instances, iframe rendering, and preview state management.

### 15. [File System Management](./features/15-file-system-management.md)
File system operations, file watching, change detection, unsaved file tracking, and file history management.

### 16. [API Key Management](./features/16-api-key-management.md)
API key storage and validation for OpenAI, Anthropic, Google, and XAI providers. Preference management and quota handling.

### 17. [Usage Tracking & Billing](./features/17-usage-tracking-billing.md)
Token usage tracking, quota management, billing integration with Convex provision host, and usage statistics.

### 18. [Compression/Decompression](./features/18-compression-decompression.md)
LZ4 compression for message storage and snapshots, WASM-based compression, and efficient data serialization.

### 19. [Model Selection](./features/19-model-selection.md)
Multi-provider model support (Anthropic, OpenAI, Google, XAI), model selection UI, and provider-specific configuration.

### 20. [Debug Features](./features/20-debug-features.md)
Debug prompt viewing, usage breakdown, draggable debug views, and developer debugging tools.

## Component Architecture

### UI Components
- **Header Components**: Navigation, action buttons, share/deploy/download buttons
- **Chat Components**: Message rendering, input, tool calls, code blocks, markdown
- **Workbench Components**: File tree, editor, preview, terminal, dashboard
- **Settings Components**: Profile, API keys, theme, usage cards
- **Landing Components**: Homepage, onboarding, feature showcase

### State Management
- **NanoStores**: Reactive state management for UI state
- **Convex Queries/Mutations**: Server state synchronization
- **React Query**: Client-side caching and synchronization

### Backend Services
- **Convex Functions**: Queries, mutations, actions, and internal functions
- **API Routes**: Remix server actions and loaders
- **Proxies**: OpenAI proxy, Resend proxy for external service integration

## Data Models

### Database Tables (Convex Schema)
- `sessions`: User session management
- `convexMembers`: User account information
- `chats`: Chat/project metadata
- `chatMessagesStorageState`: Compressed message storage
- `shares`: Forkable project snapshots
- `socialShares`: Public project sharing
- `convexProjectCredentials`: Deployment credentials
- `apiKeys`: API key storage
- `memberOpenAITokens`: OpenAI token pool management
- `resendTokens`: Resend email service tokens
- `debugChatApiRequestLog`: Debugging logs

## External Integrations

- **Convex**: Backend database and deployment platform
- **WorkOS**: Authentication and user management
- **OpenAI**: Language model provider
- **Anthropic**: Language model provider (Claude)
- **Google**: Language model provider (Gemini)
- **XAI**: Language model provider
- **Resend**: Email service provider
- **WebContainer**: Browser-based Node.js runtime

