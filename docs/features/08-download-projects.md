# Download Projects

## Overview

Users can download their Chef projects as ZIP files containing all source code, configuration files, and setup instructions. This allows users to run projects locally or deploy them to other platforms.

## Key Components

### Components

- **`DownloadButton.tsx`** - Download button in header
- **`app/lib/download/`** - Download functionality
  - **`readmeContent.ts`** - README generation
  - **`cursorRulesContent.ts`** - Cursor rules for downloaded project
  - **`setupMjsContent.ts`** - Setup script generation
  - **`convex_rules.mdc`** - Convex guidelines included

## Implementation Details

### Download Process

1. **Project Collection**: All project files collected from WebContainer
2. **File Packaging**: Files packaged into ZIP archive
3. **README Generation**: README.md generated with setup instructions
4. **Configuration Files**: Includes package.json, tsconfig, etc.
5. **ZIP Creation**: All files compressed into ZIP
6. **Download Trigger**: Browser downloads ZIP file

### Generated Files

#### README.md

Contains:
- Project description
- Setup instructions
- Convex deployment instructions (if applicable)
- Development commands
- Technology stack information

#### Setup Script

- **setup.mjs**: Automated setup script
- **Package Installation**: Runs npm install
- **Convex Setup**: Configures Convex if connected
- **Environment Setup**: Sets up environment variables

#### Cursor Rules

- **`.cursor/rules/convex_rules.mdc`**: Convex development guidelines
- Helps maintain consistency when editing locally

### File Structure

Downloaded projects include:
- **Source Files**: All TypeScript/JavaScript files
- **Configuration**: tsconfig.json, package.json, etc.
- **Public Assets**: Public folder contents
- **Convex Functions**: Convex backend code
- **Documentation**: README and setup files

## Code References

### Download Button
Located in `app/components/header/DownloadButton.tsx`

### README Generation
```typescript
// app/lib/download/readmeContent.ts
export function generateReadmeContent(
  description: string,
  convexDeploymentName: string | null
): string
```

## Excluded Files

- **`.env.local`**: Environment variables excluded for security
- **`node_modules`**: Dependencies excluded (reinstalled via npm install)
- **Build Artifacts**: Generated files excluded

## Convex Integration

If project is connected to Convex:
- **Deployment Name**: Included in README
- **Deployment URL**: Provided for reference
- **Setup Instructions**: Convex-specific setup steps

## Related Features

- **File System Management**: File collection from WebContainer
- **Project Deployment**: Convex deployment information
- **WebContainer Integration**: File system access

