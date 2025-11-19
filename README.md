# 🎯 Lit Grid

> Modern, lightweight, high-performance data grid web component built with Lit 3.0

[![npm version](https://img.shields.io/npm/v/@litgrid/core.svg)](https://www.npmjs.com/package/@litgrid/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@litgrid/core)](https://bundlephobia.com/package/@litgrid/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🚀 **High Performance** - Virtual scrolling for 100,000+ rows at 60fps
- 📦 **Lightweight** - Only ~14KB gzipped (with all features)
- 🎨 **Themeable** - Full CSS Custom Properties support with built-in themes
- 🔧 **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS
- 📱 **Responsive** - Mobile-friendly and accessible (WCAG 2.1 AA)
- 🎯 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 🎛️ **Feature Rich** - Sorting, filtering, selection, **pagination**, **row grouping**, and more

## 📦 Installation

```bash
npm install @litgrid/core lit
```

Or via CDN:

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@litgrid/core/dist/lit-grid.es.js';
</script>
```

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import { LitGrid } from '@litgrid/core';

    const grid = document.querySelector('lit-grid');

    grid.columnDefs = [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'email', headerName: 'Email', width: 250 },
      { field: 'age', headerName: 'Age', width: 100 }
    ];

    grid.data = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
    ];
  </script>
</head>
<body>
  <lit-grid style="height: 400px;"></lit-grid>
</body>
</html>
```

### With Sorting and Selection

```javascript
const grid = document.querySelector('lit-grid');

grid.columnDefs = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'department', headerName: 'Department', width: 150 }
];

grid.data = [...]; // Your data array

// Enable features
grid.enableSorting = true;
grid.enableSelection = true;
grid.selectionMode = 'multiple';

// Listen to events
grid.addEventListener('selection-changed', (e) => {
  console.log('Selected rows:', e.detail.selectedRows);
});

grid.addEventListener('sort-changed', (e) => {
  console.log('Sort model:', e.detail.sortModel);
});
```

### Custom Cell Renderers

```javascript
import { html } from 'lit';

grid.columnDefs = [
  { field: 'name', headerName: 'Name', width: 200 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    cellRenderer: (params) => {
      const color = params.value === 'active' ? 'green' : 'red';
      return html`
        <span style="color: ${color}; font-weight: bold;">
          ${params.value}
        </span>
      `;
    }
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    cellRenderer: (params) => {
      return html`
        <button @click=${() => handleEdit(params.data)}>Edit</button>
        <button @click=${() => handleDelete(params.data)}>Delete</button>
      `;
    }
  }
];
```

### Pagination

```javascript
const grid = document.querySelector('lit-grid');

grid.enablePagination = true;
grid.pageSize = 25;
grid.pageSizeOptions = [10, 25, 50, 100];

// Listen to page changes
grid.addEventListener('page-changed', (e) => {
  console.log('Page:', e.detail.currentPage);
  console.log('Page size:', e.detail.pageSize);
});
```

### Row Grouping

```javascript
grid.enableGrouping = true;

// Group by single column
grid.groupBy = [
  { field: 'department' }
];

// Group by multiple columns (hierarchical)
grid.groupBy = [
  { field: 'department' },
  { field: 'status' }
];

// Add aggregations
grid.aggregations = [
  { field: 'salary', func: 'avg' },
  { field: 'salary', func: 'sum' },
  { field: 'age', func: 'avg' }
];

// Expand/collapse groups
grid.expandAllGroups();
grid.collapseAllGroups();

// Listen to group events
grid.addEventListener('group-expanded', (e) => {
  console.log('Group:', e.detail.groupKey, 'Expanded:', e.detail.expanded);
});
```

## 🎨 Theming

### Built-in Themes

```html
<!-- Light theme (default) -->
<lit-grid theme="light"></lit-grid>

<!-- Dark theme -->
<lit-grid theme="dark"></lit-grid>

<!-- Compact theme -->
<lit-grid theme="compact"></lit-grid>
```

### Custom Styling with CSS Variables

```css
lit-grid {
  --grid-background-color: #ffffff;
  --grid-border-color: #e0e0e0;
  --grid-header-background: #f5f5f5;
  --grid-header-text-color: #333333;
  --grid-row-hover-background: #f9f9f9;
  --grid-row-selected-background: #e3f2fd;
  --grid-cell-text-color: #333333;
  --grid-font-family: 'Arial', sans-serif;
  --grid-font-size: 14px;
  --grid-row-height: 40px;
  --grid-header-height: 48px;
}
```

### Shadow Parts

```css
/* Style specific parts of the grid */
lit-grid::part(header) {
  border-bottom: 2px solid #2196f3;
}

lit-grid::part(header-cell) {
  font-weight: bold;
}

lit-grid::part(row) {
  transition: background-color 0.2s;
}
```

## 📚 API Reference

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `RowData[]` | `[]` | Array of data objects to display |
| `columnDefs` | `ColumnDef[]` | `[]` | Column definitions |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableFiltering` | `boolean` | `false` | Enable filtering |
| `enablePagination` | `boolean` | `false` | Enable pagination |
| `enableGrouping` | `boolean` | `false` | Enable row grouping |
| `enableSelection` | `boolean` | `true` | Enable row selection |
| `enableVirtualScroll` | `boolean` | `true` | Enable virtual scrolling |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode |
| `dataMode` | `'client' \| 'server'` | `'client'` | Data operation mode |
| `pageSize` | `number` | `25` | Number of rows per page |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page size options |
| `groupBy` | `GroupConfig[]` | `[]` | Column grouping configuration |
| `aggregations` | `ColumnAggregation[]` | `[]` | Aggregation functions for grouped data |
| `rowHeight` | `number` | `40` | Height of each row in pixels |
| `theme` | `'light' \| 'dark' \| 'compact'` | `'light'` | Theme preset |

### Methods

| Method | Parameters | Return | Description |
|--------|-----------|--------|-------------|
| `getSelectedRows()` | - | `RowData[]` | Get all selected rows |
| `clearSelection()` | - | `void` | Clear all selections |
| `selectAll()` | - | `void` | Select all rows |
| `setQuickFilter(text)` | `text: string` | `void` | Apply quick filter across all columns |
| `refreshData()` | - | `void` | Refresh the grid data |
| `expandAllGroups()` | - | `void` | Expand all group rows |
| `collapseAllGroups()` | - | `void` | Collapse all group rows |
| `setGroupBy(groupBy)` | `groupBy: GroupConfig[]` | `void` | Set grouping configuration |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `selection-changed` | `{ selectedRows, selectedRowIds }` | Fired when selection changes |
| `sort-changed` | `{ sortModel }` | Fired when sort changes |
| `filter-changed` | `{ filterModel }` | Fired when filters change |
| `cell-clicked` | `{ row, column, value, rowIndex, colIndex }` | Fired when cell is clicked |
| `cell-value-changed` | `{ rowId, field, oldValue, newValue, data }` | Fired when cell value changes |

### Column Definition

```typescript
interface ColumnDef {
  field: string;              // Field name in data object
  headerName: string;         // Display name for column header
  width?: number;            // Column width in pixels
  minWidth?: number;         // Minimum width
  maxWidth?: number;         // Maximum width
  type?: 'text' | 'number' | 'date' | 'boolean';
  sortable?: boolean;        // Enable sorting (default: true)
  filterable?: boolean;      // Enable filtering (default: true)
  editable?: boolean;        // Enable editing (default: false)
  hide?: boolean;            // Hide column by default
  cellRenderer?: (params: CellRendererParams) => TemplateResult | string;
  valueGetter?: (data: RowData) => any;
  valueSetter?: (data: RowData, value: any) => void;
}
```

## 🎯 Why Lit Grid?

### Bundle Size Comparison

| Library | Bundle Size (minified + gzipped) |
|---------|----------------------------------|
| **Lit Grid** | **~11 KB** |
| ag-Grid Community | ~144 KB |
| Handsontable | ~523 KB |
| DevExtreme DataGrid | ~450 KB |

### Performance Benefits

- ✅ **Virtual Scrolling**: Renders only visible rows (50-100 DOM nodes vs 100,000+)
- ✅ **Efficient Updates**: Lit's reactive system minimizes DOM manipulation
- ✅ **Tree Shakeable**: Only bundle what you use
- ✅ **No Framework Dependencies**: Just Lit (~6KB)

### Framework Agnostic

Works seamlessly with any framework or vanilla JavaScript:

#### React
```jsx
import '@litgrid/core';

function App() {
  return <lit-grid ref={gridRef} />;
}
```

#### Vue
```vue
<template>
  <lit-grid :data="gridData" :column-defs="columns" />
</template>
```

#### Angular
```typescript
import '@litgrid/core';

@Component({
  template: '<lit-grid [data]="gridData"></lit-grid>'
})
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## 📋 Examples

See the `/demo` directory for complete examples:

1. **Basic Grid** - Simple data display
2. **Sorting & Selection** - Interactive features
3. **Custom Renderers** - Rich cell content
4. **Virtual Scrolling** - Large datasets (10K+ rows)
5. **Theming** - Custom themes and styling

## 🗺️ Roadmap

### v1.1
- [ ] In-cell editing with built-in editors
- [ ] Column resizing and reordering
- [ ] Pagination component
- [ ] Advanced filtering UI

### v1.2
- [ ] Row grouping
- [ ] Export to CSV/Excel
- [ ] Column pinning (frozen columns)
- [ ] Context menu

### v2.0
- [ ] Tree data structures
- [ ] Master/detail views
- [ ] Pivot mode
- [ ] Accessibility improvements

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © 

## 🙏 Acknowledgments

Built with [Lit](https://lit.dev) - A simple library for building fast, lightweight web components.

---

**Star this repo** if you find it useful! ⭐
