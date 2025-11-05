# File System Management

## Overview

File System Management handles all file operations in Chef, including reading, writing, watching for changes, and tracking modifications. Files are managed through WebContainer and synchronized with the UI.

## Key Components

### Components

- **`app/lib/stores/files.ts`** - FilesStore class
- **`app/lib/stores/fileUpdateCounter.ts`** - File update tracking
- **`app/components/workbench/FileTree.tsx`** - File tree UI

## Implementation Details

### File Storage

Files stored in WebContainer:

- **File Map**: Map of all files and directories
- **File Types**: Files and directories tracked
- **File Content**: File contents cached
- **Binary Detection**: Binary files detected

### File Operations

#### Reading Files

- **File Reading**: Files read from WebContainer
- **Encoding Detection**: Text vs binary detection
- **Content Caching**: File contents cached
- **Error Handling**: Errors handled gracefully

#### Writing Files

- **File Writing**: Files written to WebContainer
- **Content Updates**: File contents updated
- **Change Tracking**: Changes tracked
- **User Writes**: User modifications tracked separately

#### File Watching

- **Watch Events**: File changes detected via watchers
- **Real-time Updates**: UI updates on file changes
- **Event Buffering**: Events buffered for performance
- **Change Detection**: File modifications detected

### Modification Tracking

User modifications tracked:

- **Modified Files**: Map of modified files
- **Original Content**: Original content preserved
- **Modification Reset**: Modifications reset on message send
- **Diff Calculation**: File diffs calculated

### File Tree

File tree navigation:

- **Directory Structure**: Hierarchical file structure
- **File Selection**: Files selectable from tree
- **Expansion**: Directories expandable/collapsible
- **Breadcrumbs**: Breadcrumb navigation

## Code References

### FilesStore
```19:100:app/lib/stores/files.ts
export class FilesStore {
  #webcontainer: Promise<WebContainer>;

  /**
   * Tracks the number of files without folders.
   */
  #size = 0;

  /**
   * @note Keeps track all modified files with their original content since the last user message.
   * Needs to be reset when the user sends another message and all changes have to be submitted
   * for the model to be aware of the changes.
   */
  #modifiedFiles: Map<AbsolutePath, string> = import.meta.hot?.data.modifiedFiles ?? new Map();

  /**
   * Map of files that matches the state of WebContainer.
   */
  files: MapStore<FileMap> = import.meta.hot?.data.files ?? map({});
  userWrites: Map<AbsolutePath, number> = import.meta.hot?.data.userWrites ?? new Map();

  get filesCount() {
    return this.#size;
  }

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;

    if (import.meta.hot) {
      import.meta.hot.data.files = this.files;
      import.meta.hot.data.modifiedFiles = this.#modifiedFiles;
      import.meta.hot.data.userWrites = this.userWrites;
    }

    this.#init();
  }

  getFile(filePath: AbsolutePath) {
    const dirent = this.files.get()[filePath];

    if (dirent?.type !== 'file') {
      return undefined;
    }

    return dirent;
  }

  getFileModifications() {
    return computeFileModifications(this.files.get(), this.#modifiedFiles);
  }
  getModifiedFiles() {
    let modifiedFiles: { [path: string]: File } | undefined = undefined;

    for (const [filePath, originalContent] of this.#modifiedFiles) {
      const file = this.files.get()[filePath];

      if (file?.type !== 'file') {
        continue;
      }

      if (file.content === originalContent) {
        continue;
      }

      if (!modifiedFiles) {
        modifiedFiles = {};
      }

      modifiedFiles[filePath] = file;
    }

    return modifiedFiles;
  }

  resetFileModifications() {
    this.#modifiedFiles.clear();
  }

  async saveFile(filePath: AbsolutePath, content: string) {
    const webcontainer = await this.#webcontainer;

    try {
```

## File Types

- **Text Files**: UTF-8 encoded text files
- **Binary Files**: Binary files detected and handled
- **Directories**: Directory structure maintained
- **Symlinks**: Symlinks supported (if applicable)

## Performance

- **Lazy Loading**: Files loaded on demand
- **Caching**: File contents cached
- **Event Buffering**: File events buffered
- **Incremental Updates**: Only changed files updated

## Related Features

- **WebContainer Integration**: File operations via WebContainer
- **Workbench**: File tree and editor
- **Agent Loop**: File operations for agent
- **Terminal**: File operations via terminal

