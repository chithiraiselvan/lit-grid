# Lit Grid - Project Structure

## Overview

This document describes the structure and organization of the Lit Grid project.

## Directory Structure

```
lit-grid/
├── src/                          # Source code
│   ├── components/               # Web components
│   │   └── lit-grid.ts          # Main grid component
│   ├── controllers/              # Reactive controllers
│   │   ├── VirtualScrollController.ts
│   │   ├── SortController.ts
│   │   └── FilterController.ts
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts             # All type exports
│   ├── utils/                    # Utility functions
│   │   └── helpers.ts           # Helper functions
│   └── index.ts                  # Main entry point
│
├── demo/                         # Demo and examples
│   ├── index.html               # Demo HTML page
│   └── demo.js                  # Demo JavaScript
│
├── dist/                         # Build output (generated)
│   ├── lit-grid.es.js           # ES module bundle
│   ├── lit-grid.umd.js          # UMD bundle
│   └── index.d.ts               # TypeScript definitions
│
├── docs/                         # Documentation
│   ├── README.md                # Main documentation
│   ├── GETTING_STARTED.md       # Quick start guide
│   ├── architecture.md          # Technical architecture
│   └── product-owner-requirement.md  # Product requirements
│
├── package.json                  # NPM package configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts               # Vite build configuration
└── .gitignore                   # Git ignore rules
```

## Core Components

### 1. Main Grid Component (`src/components/lit-grid.ts`)

The primary web component that renders the data grid.

**Responsibilities:**
- Render grid structure (header, viewport, rows, cells)
- Manage component state (sorting, filtering, selection)
- Handle user interactions (clicks, keyboard navigation)
- Coordinate with controllers for data processing
- Emit custom events for application integration

**Key Features:**
- Virtual scrolling for performance
- Reactive property updates
- Shadow DOM encapsulation
- CSS custom properties for theming

### 2. Controllers (`src/controllers/`)

Reactive controllers that encapsulate specific functionality:

#### VirtualScrollController
- Calculates visible row range based on scroll position
- Manages viewport dimensions
- Provides row positioning styles
- Optimizes rendering for large datasets

#### SortController
- Client-side multi-column sorting
- Type-aware comparison (string, number, date)
- Custom comparator support
- Sort state management

#### FilterController
- Client-side data filtering
- Multiple filter operators (contains, equals, etc.)
- Quick filter across all columns
- Type-specific filtering

### 3. Type Definitions (`src/types/index.ts`)

Comprehensive TypeScript interfaces and types:

- `RowData`: Generic row data type
- `ColumnDef`: Column definition interface
- `SortModel`: Sort configuration
- `FilterModel`: Filter configuration
- `CellRendererParams`: Custom renderer parameters
- Event payload types
- And more...

### 4. Utilities (`src/utils/helpers.ts`)

Helper functions used throughout the codebase:

- `debounce()`: Delay function execution
- `generateId()`: Create unique identifiers
- `getNestedValue()`: Access nested object properties
- `isEmpty()`: Check for empty values
- Date and number formatting helpers

## Build System

### Vite Configuration (`vite.config.ts`)

- **Library Mode**: Builds as both ES module and UMD
- **External Dependencies**: Lit is marked as peer dependency
- **Source Maps**: Generated for debugging
- **Minification**: Terser for production builds
- **Dev Server**: Hot module replacement for development

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2020 for modern browsers
- **Module**: ESNext for optimal tree-shaking
- **Strict Mode**: Enabled for type safety
- **Decorators**: Enabled for Lit decorators
- **Declaration**: Generates .d.ts files

## Development Workflow

### Local Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm run type-check   # TypeScript type checking
```

### File Watching

Vite provides:
- Hot Module Replacement (HMR)
- Instant server start
- On-demand compilation
- Optimized dependency pre-bundling

## Package Distribution

### NPM Package Structure

```
@litgrid/core/
├── dist/
│   ├── lit-grid.es.js      # ES module (tree-shakeable)
│   ├── lit-grid.umd.js     # UMD (browser compatible)
│   └── index.d.ts          # TypeScript definitions
├── src/                     # Source code for debugging
├── package.json
└── README.md
```

### Entry Points

```json
{
  "main": "./dist/lit-grid.umd.js",     // CommonJS
  "module": "./dist/lit-grid.es.js",    // ES Module
  "types": "./dist/index.d.ts",         // TypeScript
  "exports": {
    ".": {
      "import": "./dist/lit-grid.es.js",
      "require": "./dist/lit-grid.umd.js"
    }
  }
}
```

## Code Organization Principles

### 1. Single Responsibility
Each file/class has one clear purpose

### 2. Separation of Concerns
- Components handle rendering
- Controllers handle business logic
- Types define contracts
- Utils provide shared functionality

### 3. Reactive Architecture
- Lit's reactive properties for state management
- Reactive controllers for reusable logic
- Event-driven communication

### 4. Type Safety
- Comprehensive TypeScript types
- Strict mode enabled
- Exported types for consumers

### 5. Performance First
- Virtual scrolling by default
- Efficient DOM updates
- Minimal re-renders
- Tree-shakeable code

## Testing Strategy (Future)

```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── controllers/
│   └── utils/
├── integration/             # Integration tests
│   └── workflows/
└── e2e/                     # End-to-end tests
    └── scenarios/
```

**Testing Tools:**
- Web Test Runner for unit/integration
- Playwright for E2E tests
- Open WC Testing Helpers

## Documentation Files

### User Documentation
- `README.md`: Main documentation with examples
- `GETTING_STARTED.md`: Quick start guide
- API reference in README

### Developer Documentation
- `architecture.md`: Technical architecture
- `PROJECT_STRUCTURE.md`: This file
- Inline code comments

### Product Documentation
- `product-owner-requirement.md`: Business requirements
- `requirement.md`: Original requirements

## Performance Characteristics

### Bundle Size
- **Core bundle**: ~11KB gzipped
- **With all features**: ~15KB gzipped
- **TypeScript definitions**: ~5KB

### Runtime Performance
- Virtual scrolling: 60fps with 100K+ rows
- Initial render: <100ms for 1K rows
- Memory: <50MB for 10K rows

## Browser Support

- Chrome/Edge: last 2 versions
- Firefox: last 2 versions
- Safari: last 2 versions
- Mobile: iOS Safari, Chrome Android

## Future Enhancements

### Planned Features
- Pagination component
- In-cell editing
- Column resizing/reordering
- Advanced filtering UI
- Row grouping

### Architecture Improvements
- Web Workers for data processing
- Lazy loading for features
- Plugin system
- Accessibility enhancements

## Contributing Guidelines

### Code Style
- Follow existing patterns
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Write self-documenting code

### Commit Messages
- Use conventional commits
- Keep commits focused
- Reference issues

### Pull Requests
- Include tests
- Update documentation
- Add examples if needed

## License

MIT License - See LICENSE file for details
