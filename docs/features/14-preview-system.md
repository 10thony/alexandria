# Preview System

## Overview

The Preview System provides live previews of applications running in WebContainer. Users can view their applications in real-time, with support for multiple preview instances, responsive design testing, and error handling.

## Key Components

### Components

- **`Preview.tsx`** - Preview panel component
- **`app/lib/stores/previews.ts`** - Preview state management
- **`PortDropdown.tsx`** - Port selection for previews
- **`ThumbnailChooser.tsx`** - Thumbnail capture for sharing

## Implementation Details

### Preview Creation

Previews created automatically:

1. **Port Detection**: WebContainer detects running servers
2. **Preview Registration**: Preview registered with port
3. **Proxy Setup**: Proxy server set up for preview
4. **Iframe Rendering**: Preview rendered in iframe

### Multiple Previews

Support for multiple preview instances:

- **Multiple Ports**: Different previews for different ports
- **Preview Management**: Add/remove preview panes
- **Active Preview**: One active preview at a time
- **Preview Switching**: Switch between previews

### Proxy System

Previews use proxy system:

- **Proxy Server**: Proxy server routes requests
- **Port Mapping**: Ports mapped to proxy URLs
- **Error Forwarding**: Errors forwarded from preview
- **URL Management**: User-friendly URLs

### Responsive Design

Preview supports responsive design testing:

- **Device Mode**: Simulate different device sizes
- **Width Control**: Adjustable preview width
- **Scaling**: Preview scaled for display
- **Mobile Testing**: Test mobile layouts

## Code References

### Preview Component
```14:100:app/components/workbench/Preview.tsx
export const Preview = memo(function Preview({ showClose, onClose }: { showClose: boolean; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  // "active" here means which preview this Preview component is a view of
  const activePreview = previews[activePreviewIndex];
  const isActivePreviewSet = activePreview !== undefined;

  const [proxyBaseUrl, setProxyUrl] = useState<string | null>(null);
  useEffect(() => {
    setProxyUrl(null);

    if (!isActivePreviewSet) {
      return undefined;
    }

    let hasUnmounted = false;
    let proxyPort: number | null = null;

    (async () => {
      const { proxyUrl, proxyPort: _proxyPort } = await workbenchStore.startProxy(activePreview.port);
      proxyPort = _proxyPort;
      setProxyUrl(proxyUrl);

      // Treat the case where startProxy resolves after useEffect unmounts
      if (hasUnmounted) {
        workbenchStore.stopProxy(proxyPort);
      }
    })();

    return () => {
      hasUnmounted = true;
      if (proxyPort !== null) {
        workbenchStore.stopProxy(proxyPort);
      }
    };
  }, [isActivePreviewSet, activePreview?.port]);
```

## Preview Features

- **Live Reload**: Auto-reload on file changes
- **Error Display**: Errors displayed in preview
- **Navigation**: URL navigation in preview
- **Screenshot**: Capture screenshots for sharing
- **External Link**: Open preview in new tab

## Error Handling

- **Error Forwarding**: Errors from preview forwarded
- **Stack Traces**: Stack traces displayed
- **Error Types**: Uncaught exceptions and promise rejections
- **Error Display**: Errors shown in alert system

## Related Features

- **WebContainer Integration**: Preview via WebContainer
- **Workbench**: Preview panel in workbench
- **Sharing**: Screenshots for sharing

