# Terminal/Shell

## Overview

The Terminal/Shell feature provides an integrated terminal interface within Chef's workbench. Users can run commands, view output, and interact with the WebContainer file system via a terminal interface.

## Key Components

### Components

- **`Terminal.tsx`** - Individual terminal instance
- **`TerminalTabs.tsx`** - Terminal tab management
- **`app/lib/stores/terminal.ts`** - Terminal state management
- **`app/lib/stores/terminalTabs.ts`** - Terminal tabs state

## Implementation Details

### Terminal Implementation

Terminals use XTerm.js:

- **XTerm Library**: xterm.js for terminal rendering
- **Addons**: Fit addon for auto-resize, WebLinks for URL detection
- **Theming**: Theme support for light/dark modes
- **Read-only Mode**: Support for read-only terminals

### Terminal Tabs

Multiple terminal instances supported:

- **Tab Management**: Create, switch, close tabs
- **Tab State**: Each tab maintains separate state
- **Tab Persistence**: Tabs preserved across sessions
- **Default Tab**: Default terminal tab created

### Command Execution

Commands executed via WebContainer:

- **Process Spawning**: Commands spawned via WebContainer.spawn()
- **Output Streaming**: Real-time output streaming
- **Input Handling**: User input sent to process
- **Exit Codes**: Process exit codes captured

### Terminal Features

- **Auto-resize**: Terminal automatically resizes to container
- **Theme Support**: Light/dark theme support
- **Scroll Back**: Terminal history scrolling
- **Copy/Paste**: Standard terminal copy/paste
- **Link Detection**: URLs detected and clickable

## Code References

### Terminal Component
```11:77:app/components/workbench/terminal/Terminal.tsx
export const Terminal = memo(function Terminal({
  className,
  theme,
  readonly,
  id,
  onTerminalReady,
  onTerminalResize,
}: {
  className?: string;
  theme: Theme;
  readonly?: boolean;
  id: string;
  onTerminalReady?: (terminal: XTerm) => void;
  onTerminalResize?: (cols: number, rows: number) => void;
}) {
  const terminalElementRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>();

  useEffect(() => {
    const element = terminalElementRef.current!;

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: readonly,
      theme: getTerminalTheme(readonly ? { cursor: '#00000000' } : {}),
      fontSize: 12,
      fontFamily: 'Menlo, courier-new, courier, monospace',
    });

    terminalRef.current = terminal;

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      onTerminalResize?.(terminal.cols, terminal.rows);
    });

    resizeObserver.observe(element);

    logger.debug(`Attach [${id}]`);

    onTerminalReady?.(terminal);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [id, onTerminalReady, onTerminalResize, readonly]);
```

## Terminal Initialization

Terminals initialized with options:

- **Reload Support**: Terminal can be initialized for reload
- **Deployment**: Auto-deployment of Convex functions
- **Initialization Options**: Customizable initialization

## Related Features

- **WebContainer Integration**: Command execution via WebContainer
- **Workbench**: Terminal integrated in workbench
- **File System Management**: File operations via terminal

