# Workbench/Code Editor

## Overview

The Workbench is Chef's integrated development environment (IDE) that provides file editing, file tree navigation, terminal integration, and live preview capabilities. It's built using CodeMirror for the editor and WebContainer for the runtime environment.

## Key Components

### Main Components

- **`Workbench.client.tsx`** - Main workbench container component
- **`EditorPanel.tsx`** - Editor panel with file tree and code editor
- **`CodeMirrorEditor.tsx`** - CodeMirror-based code editor
- **`FileTree.tsx`** - File system tree navigation
- **`FileBreadcrumb.tsx`** - Breadcrumb navigation for current file
- **`Preview.tsx`** - Live preview panel
- **`TerminalTabs.tsx`** - Terminal interface with tabs
- **`Terminal.tsx`** - Individual terminal instance
- **`Dashboard.tsx`** - Convex project dashboard

## Implementation Details

### Workbench Store

The `workbenchStore` (NanoStores) manages all workbench state:

```typescript
// Key state properties:
- files: FileMap - All files in the project
- selectedFile: AbsolutePath - Currently selected file
- currentDocument: EditorDocument - Current editor document
- unsavedFiles: Set<string> - Files with unsaved changes
- previews: Preview[] - Preview instances
- currentView: 'code' | 'preview' | 'dashboard'
- showWorkbench: boolean
```

### File System Management

1. **File Watching**: Files are watched via WebContainer file system events
2. **Change Detection**: Unsaved changes tracked separately from saved state
3. **File History**: File modification history maintained
4. **Auto-save**: Files auto-saved to WebContainer on changes

### Code Editor Features

#### CodeMirror Integration

```typescript
// Editor features:
- Syntax highlighting for multiple languages
- Auto-completion
- Bracket matching
- Line numbers
- Theme support (light/dark)
- Undo/redo
- Find/replace
```

#### Editor Operations

- **File Opening**: Files opened from file tree or breadcrumb
- **File Saving**: Manual save with Ctrl+S / Cmd+S
- **File Resetting**: Revert unsaved changes
- **Scroll Position**: Preserved per file
- **Cursor Position**: Maintained across file switches

### Preview System

The preview system runs applications in iframes:

1. **Preview Creation**: Automatically created when app starts
2. **Multiple Previews**: Support for multiple preview panes
3. **Preview Management**: Add/remove preview instances
4. **Port Mapping**: Each preview can map to different ports

### Terminal Integration

- **Multiple Tabs**: Support for multiple terminal instances
- **Command Execution**: Run commands in WebContainer
- **Output Streaming**: Real-time output display
- **Terminal State**: Preserved across page reloads
- **Auto-deployment**: Automatic Convex function deployment

### View Management

The workbench supports three main views:

1. **Code View**: Editor with file tree and terminal
2. **Preview View**: Live application preview
3. **Dashboard View**: Convex project dashboard (when connected)

Views can be switched via a slider component with smooth transitions.

## Code References

### Workbench Component
```55:59:app/components/workbench/Workbench.client.tsx
export const Workbench = memo(function Workbench({
  chatStarted,
  isStreaming,
  terminalInitializationOptions,
}: WorkspaceProps) {
```

### Editor Panel
```46:51:app/components/workbench/EditorPanel.tsx
export const EditorPanel = memo(function EditorPanel({
  files,
  unsavedFiles,
  editorDocument,
  selectedFile,
  isStreaming
```

### Workbench Store
```46:47:app/lib/stores/workbench.client.ts
export class WorkbenchStore {
  #previewsStore = new PreviewsStore(webcontainer)
```

## File Operations

### Reading Files
- Files read from WebContainer file system
- Cached in memory for performance
- Watched for changes

### Writing Files
- Changes written to WebContainer
- Debounced to prevent excessive writes
- Unsaved state tracked separately

### File Selection
- Files selected from file tree
- Breadcrumb navigation
- Keyboard shortcuts for navigation

## Theme Support

- Light and dark themes
- Theme persistence
- Editor theme synchronization
- Preview theme (if applicable)

## Related Features

- **WebContainer Integration**: Browser-based runtime
- **Preview System**: Live application previews
- **Terminal/Shell**: Command execution
- **File System Management**: File operations
- **Project Deployment**: Deployment to Convex

