# WebContainer Integration

## Overview

WebContainer provides a browser-based Node.js runtime that allows Chef to run code, manage files, and execute commands entirely in the browser. This eliminates the need for server-side infrastructure for running user code.

## Key Components

### Components

- **`app/lib/webcontainer/index.ts`** - WebContainer initialization
- **`app/lib/stores/workbench.client.ts`** - WebContainer integration in workbench
- **`app/lib/stores/files.ts`** - File system operations via WebContainer

## Implementation Details

### WebContainer Initialization

WebContainer is initialized on app load:

1. **Boot Check**: Checks if WebContainer should boot
2. **Boot Process**: WebContainer.boot() called
3. **Configuration**: Configured with workdir and COEP
4. **Error Handling**: Error forwarding from iframes enabled
5. **State Management**: Boot state tracked

### File System Operations

Files managed via WebContainer:

- **File Reading**: Files read from WebContainer file system
- **File Writing**: Files written to WebContainer
- **File Watching**: File changes detected via watchers
- **Directory Operations**: Directory listing and navigation

### Process Execution

Commands executed via WebContainer:

- **Spawn Processes**: Commands spawned via spawn()
- **Output Streaming**: Real-time output streaming
- **Exit Codes**: Process exit codes captured
- **Environment**: Environment variables set

### Preview System

WebContainer provides preview functionality:

- **Preview URLs**: URLs for previewing applications
- **Port Mapping**: Ports mapped to preview URLs
- **Error Forwarding**: Errors forwarded from preview iframes
- **Hot Reload**: Automatic reload on file changes

## Code References

### WebContainer Boot
```37:80:app/lib/webcontainer/index.ts
if (shouldBootWebcontainer) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        setContainerBootState(ContainerBootState.STARTING);
        return WebContainer.boot({
          coep: 'credentialless',
          workdirName: WORK_DIR_NAME,
          forwardPreviewErrors: true, // Enable error forwarding from iframes
        });
      })
      .then(async (webcontainer) => {
        // Listen for preview errors
        webcontainer.on('preview-message', (message) => {
          logger.info('WebContainer preview message:', JSON.stringify(message));

          // Handle both uncaught exceptions and unhandled promise rejections
          if (message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' || message.type === 'PREVIEW_UNHANDLED_REJECTION') {
            const isPromise = message.type === 'PREVIEW_UNHANDLED_REJECTION';
            workbenchStore.actionAlert.set({
              type: 'preview',
              title: isPromise ? 'Unhandled Promise Rejection' : 'Uncaught Exception',
              description: message.message,
              content: `Error occurred at ${message.pathname}${message.search}${message.hash}\nPort: ${message.port}\n\nStack trace:\n${cleanStackTrace(message.stack || '')}`,
              source: 'preview',
            });
          }
        });
        // Set the container boot state to LOADING_SNAPSHOT to hand off control
        // to the container setup code.
        setContainerBootState(ContainerBootState.LOADING_SNAPSHOT);
        (globalThis as any).webcontainer = webcontainer;
        return webcontainer;
      })
      .catch((error) => {
        setContainerBootState(ContainerBootState.ERROR, error);
        throw error;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
```

### File System Operations
```19:100:app/lib/stores/files.ts
export class FilesStore {
  #webcontainer: Promise<WebContainer>;
  // File system operations using WebContainer
  // File watching, reading, writing
}
```

## Container Boot States

Boot states tracked:

- **STARTING**: WebContainer booting
- **LOADING_SNAPSHOT**: Loading project snapshot
- **DOWNLOADING_DEPENDENCIES**: Installing npm packages
- **SETTING_UP_CONVEX_PROJECT**: Setting up Convex
- **SETTING_UP_CONVEX_ENV_VARS**: Configuring environment
- **CONFIGURING_CONVEX_AUTH**: Setting up auth
- **STARTING_BACKUP**: Initializing backup
- **READY**: Container ready

## Security

- **COEP**: Cross-Origin Embedder Policy for security
- **Credentialless**: Credentialless mode for iframes
- **Isolation**: Code runs in isolated container
- **Error Handling**: Errors caught and displayed

## Performance

- **Lazy Loading**: WebContainer loaded on demand
- **Hot Module Replacement**: HMR for faster development
- **Snapshot Caching**: Snapshots cached for faster loading
- **Process Management**: Efficient process spawning

## Related Features

- **Terminal/Shell**: Command execution via WebContainer
- **Preview System**: Preview functionality
- **File System Management**: File operations
- **Snapshots**: Snapshot mounting to WebContainer

