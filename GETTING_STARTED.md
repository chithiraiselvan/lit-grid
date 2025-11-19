# Getting Started with Lit Grid

This guide will help you get up and running with Lit Grid in under 5 minutes.

## Installation

### Option 1: NPM

```bash
npm install @litgrid/core lit
```

### Option 2: CDN

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@litgrid/core/dist/lit-grid.es.js';
</script>
```

## Your First Grid

Create an HTML file with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Lit Grid</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    lit-grid {
      height: 400px;
      width: 100%;
    }
  </style>
</head>
<body>
  <h1>Employee List</h1>
  <lit-grid id="myGrid"></lit-grid>

  <script type="module">
    // Import from your node_modules or CDN
    import '../src/index.js';

    const grid = document.getElementById('myGrid');

    // Define columns
    grid.columnDefs = [
      { field: 'id', headerName: 'ID', width: 80, type: 'number' },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'email', headerName: 'Email', width: 250 },
      { field: 'department', headerName: 'Department', width: 150 },
      { field: 'salary', headerName: 'Salary', width: 120, type: 'number' }
    ];

    // Set data
    grid.data = [
      { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', salary: 95000 },
      { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Sales', salary: 85000 },
      { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Marketing', salary: 75000 },
      { id: 4, name: 'Alice Williams', email: 'alice@company.com', department: 'HR', salary: 70000 },
      { id: 5, name: 'Charlie Brown', email: 'charlie@company.com', department: 'Engineering', salary: 105000 }
    ];

    // Enable sorting
    grid.enableSorting = true;
  </script>
</body>
</html>
```

## Step-by-Step Explanation

### 1. Add the Grid Element

```html
<lit-grid id="myGrid"></lit-grid>
```

Add the `<lit-grid>` custom element to your HTML. Give it an ID so you can reference it in JavaScript.

### 2. Define Columns

```javascript
grid.columnDefs = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'name', headerName: 'Name', width: 200 }
];
```

Column definitions specify:
- `field`: Property name in your data objects
- `headerName`: Display name in the column header
- `width`: Column width in pixels (optional)
- `type`: Data type for sorting (optional)

### 3. Set Data

```javascript
grid.data = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];
```

Pass an array of objects. Each object represents a row.

### 4. Style the Grid

```css
lit-grid {
  height: 400px;  /* Required: Set a height */
  width: 100%;
}
```

**Important**: Always set a height on the grid element!

## Common Features

### Enable Sorting

```javascript
grid.enableSorting = true;
```

Click column headers to sort. Hold Shift to sort by multiple columns.

### Enable Selection

```javascript
grid.enableSelection = true;
grid.selectionMode = 'multiple'; // or 'single'

grid.addEventListener('selection-changed', (e) => {
  console.log('Selected:', e.detail.selectedRows);
});
```

### Custom Cell Rendering

```javascript
import { html } from 'lit';

grid.columnDefs = [
  {
    field: 'salary',
    headerName: 'Salary',
    width: 120,
    cellRenderer: (params) => {
      return html`<strong>$${params.value.toLocaleString()}</strong>`;
    }
  }
];
```

### Apply a Theme

```html
<lit-grid theme="dark"></lit-grid>
```

Options: `light`, `dark`, `compact`

## Next Steps

- **Explore the Demo**: Check out the `/demo/index.html` file for more examples
- **Read the API Docs**: See [README.md](./README.md) for the complete API reference
- **Customize Styling**: Learn about CSS custom properties in the theming section
- **Handle Events**: Listen to grid events like `cell-clicked`, `sort-changed`, etc.

## Framework Integration

### React

```jsx
import { useRef, useEffect } from 'react';
import '@litgrid/core';

function MyComponent() {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.columnDefs = [...];
      gridRef.current.data = [...];
    }
  }, []);

  return <lit-grid ref={gridRef} style={{ height: '400px' }} />;
}
```

### Vue

```vue
<template>
  <lit-grid
    ref="grid"
    style="height: 400px"
  />
</template>

<script>
import '@litgrid/core';

export default {
  mounted() {
    this.$refs.grid.columnDefs = [...];
    this.$refs.grid.data = [...];
  }
}
</script>
```

### Angular

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import '@litgrid/core';

@Component({
  selector: 'app-grid',
  template: '<lit-grid #grid style="height: 400px"></lit-grid>'
})
export class GridComponent implements AfterViewInit {
  @ViewChild('grid') grid!: ElementRef;

  ngAfterViewInit() {
    this.grid.nativeElement.columnDefs = [...];
    this.grid.nativeElement.data = [...];
  }
}
```

## Troubleshooting

### Grid not showing data

1. **Check the height**: The grid requires an explicit height
   ```css
   lit-grid { height: 400px; }
   ```

2. **Verify column field names**: Make sure `field` values match your data object keys

3. **Check the console**: Look for any error messages

### Sorting not working

Make sure sorting is enabled:
```javascript
grid.enableSorting = true;
```

And the column is sortable (default is true):
```javascript
{ field: 'name', sortable: true }
```

### Performance issues with large datasets

Enable virtual scrolling (enabled by default):
```javascript
grid.enableVirtualScroll = true;
```

## Need Help?

- 📖 [Full Documentation](./README.md)
- 💬 [GitHub Issues](https://github.com/yourusername/lit-grid/issues)
- 💡 [Examples](./demo)

Happy coding! 🎉
