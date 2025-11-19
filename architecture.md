# Lit-Grid: Technical Architecture

## 1. System Overview

### 1.1 Technology Stack
- **Component Framework:** Lit 3.0
- **Language:** TypeScript 5.x
- **Build Tool:** Vite
- **Testing:** Web Test Runner, Playwright
- **Documentation:** TypeDoc, Storybook
- **Package Manager:** npm/pnpm

### 1.2 Design Principles
1. **Performance First:** Virtual scrolling, efficient rendering, minimal re-renders
2. **Standards-Based:** Web Components, no framework lock-in
3. **Composable:** Modular architecture, tree-shakeable
4. **Accessible:** WCAG 2.1 AA compliant out of the box
5. **Extensible:** Plugin architecture for custom features

## 2. Core Architecture

### 2.1 Component Hierarchy

```
<lit-grid>                          (Main container)
├── <grid-header>                   (Header row container)
│   ├── <grid-header-cell>         (Individual header cells)
│   │   ├── <column-menu>          (Sort, filter, hide controls)
│   │   └── <column-resizer>       (Resize handle)
├── <grid-viewport>                 (Scrollable viewport)
│   ├── <grid-virtual-scroller>    (Virtual scroll manager)
│   │   └── <grid-row>             (Data rows)
│   │       └── <grid-cell>        (Individual cells)
├── <grid-footer>                   (Footer with pagination)
│   └── <grid-pagination>          (Pagination controls)
└── <grid-overlay>                  (Modals, loading states)
```

### 2.2 Component Descriptions

#### `<lit-grid>`
**Primary container and orchestrator**

```typescript
@customElement('lit-grid')
export class LitGrid extends LitElement {
  // Data
  @property({ type: Array }) data: RowData[] = [];
  @property({ type: Array }) columnDefs: ColumnDef[] = [];

  // Configuration
  @property({ type: Boolean }) enableSorting = true;
  @property({ type: Boolean }) enableFiltering = true;
  @property({ type: Boolean }) enablePagination = false;
  @property({ type: Boolean }) enableSelection = true;
  @property({ type: Boolean }) enableVirtualScroll = true;

  // State
  @state() private sortModel: SortModel[] = [];
  @state() private filterModel: FilterModel = {};
  @state() private selectedRows: Set<string> = new Set();
  @state() private columnState: ColumnState[] = [];

  // Methods
  getSelectedRows(): RowData[]
  setColumnDefs(defs: ColumnDef[]): void
  refreshData(): void
  exportToCsv(): void

  // Events
  @event('selection-changed') onSelectionChanged
  @event('sort-changed') onSortChanged
  @event('filter-changed') onFilterChanged
  @event('cell-clicked') onCellClicked
  @event('cell-value-changed') onCellValueChanged
}
```

#### `<grid-column>`
**Alternative declarative column definition**

```typescript
@customElement('grid-column')
export class GridColumn extends LitElement {
  @property() field: string;
  @property() headerName: string;
  @property({ type: Number }) width?: number;
  @property({ type: Boolean }) sortable = true;
  @property({ type: Boolean }) filterable = true;
  @property({ type: Boolean }) editable = false;
  @property() type: 'text' | 'number' | 'date' | 'boolean' = 'text';
  @property() cellRenderer?: CellRendererFunction;
  @property() cellEditor?: CellEditorFunction;
}
```

### 2.3 Data Flow Architecture

```
User Interaction
      ↓
Event Handlers (grid-cell, grid-header-cell)
      ↓
State Update (@state properties)
      ↓
Lit Reactive Update Cycle
      ↓
Computed Properties (processedData, visibleRows)
      ↓
Virtual Scroller Calculation
      ↓
DOM Update (only visible elements)
      ↓
Custom Events Dispatched
      ↓
Application Logic
```

## 3. Core Features Implementation

### 3.1 Virtual Scrolling

#### Strategy
Implement row and column virtualization using **Intersection Observer API** and **transform-based positioning**.

#### Implementation Details

```typescript
class VirtualScrollController {
  private rowHeight = 40;
  private viewportHeight = 600;
  private scrollTop = 0;

  calculateVisibleRange(): { start: number; end: number } {
    const start = Math.floor(this.scrollTop / this.rowHeight);
    const visibleCount = Math.ceil(this.viewportHeight / this.rowHeight);
    const bufferSize = 5; // Render extra rows for smooth scrolling

    return {
      start: Math.max(0, start - bufferSize),
      end: start + visibleCount + bufferSize
    };
  }

  getRowStyle(index: number): string {
    const y = index * this.rowHeight;
    return `transform: translateY(${y}px); position: absolute;`;
  }
}
```

**Performance Target:**
- 60fps scrolling for 100,000+ rows
- < 16ms frame render time
- Max 50 DOM nodes rendered at once

### 3.2 Reactivity Model

#### Reactive Properties (@property)
Used for **public API** - triggers re-render and attribute sync

```typescript
@property({ type: Array }) data: RowData[] = [];
@property({ type: Array }) columnDefs: ColumnDef[] = [];
@property({ type: Boolean }) enableSorting = true;
```

#### Internal State (@state)
Used for **component state** - triggers re-render, no attribute sync

```typescript
@state() private sortModel: SortModel[] = [];
@state() private filterModel: FilterModel = {};
@state() private selectedRows: Set<string> = new Set();
@state() private editingCell: CellPosition | null = null;
```

#### Computed Properties
Derived data calculated on-demand

```typescript
private get processedData(): RowData[] {
  let result = [...this.data];

  // Apply filtering
  if (Object.keys(this.filterModel).length > 0) {
    result = this.applyFilters(result);
  }

  // Apply sorting
  if (this.sortModel.length > 0) {
    result = this.applySort(result);
  }

  return result;
}

private get visibleRows(): RowData[] {
  const { start, end } = this.virtualScroller.calculateVisibleRange();
  return this.processedData.slice(start, end);
}
```

### 3.3 Sorting

#### Client-Side Sorting

```typescript
interface SortModel {
  field: string;
  direction: 'asc' | 'desc';
  priority: number; // For multi-column sort
}

class SortController {
  applySort(data: RowData[], sortModel: SortModel[]): RowData[] {
    if (sortModel.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const sort of sortModel) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const compare = this.compare(aVal, bVal, sort.direction);
        if (compare !== 0) return compare;
      }
      return 0;
    });
  }

  private compare(a: any, b: any, direction: 'asc' | 'desc'): number {
    const mult = direction === 'asc' ? 1 : -1;
    if (a === b) return 0;
    if (a == null) return 1 * mult;
    if (b == null) return -1 * mult;
    return (a < b ? -1 : 1) * mult;
  }
}
```

#### Server-Side Sorting

```typescript
@property({ type: String }) dataMode: 'client' | 'server' = 'client';

private handleSortChanged(sortModel: SortModel[]) {
  this.sortModel = sortModel;

  if (this.dataMode === 'server') {
    // Emit event for application to handle
    this.dispatchEvent(new CustomEvent('sort-changed', {
      detail: { sortModel },
      bubbles: true,
      composed: true
    }));
    // Application updates this.data after server call
  } else {
    // Client-side sorting handled in processedData getter
    this.requestUpdate();
  }
}
```

### 3.4 Filtering

#### Filter Model

```typescript
interface FilterModel {
  [field: string]: ColumnFilter;
}

interface ColumnFilter {
  type: 'text' | 'number' | 'date' | 'set';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' |
            'lessThan' | 'greaterThan' | 'inRange';
  value: any;
  value2?: any; // For range filters
}

class FilterController {
  applyFilters(data: RowData[], filterModel: FilterModel): RowData[] {
    return data.filter(row => {
      return Object.entries(filterModel).every(([field, filter]) => {
        return this.testFilter(row[field], filter);
      });
    });
  }

  private testFilter(value: any, filter: ColumnFilter): boolean {
    switch (filter.operator) {
      case 'contains':
        return String(value).toLowerCase().includes(
          String(filter.value).toLowerCase()
        );
      case 'equals':
        return value === filter.value;
      case 'greaterThan':
        return value > filter.value;
      // ... other operators
    }
  }
}
```

#### Filter UI Component

```typescript
@customElement('column-filter')
export class ColumnFilter extends LitElement {
  @property() columnType: 'text' | 'number' | 'date';
  @property() currentFilter?: ColumnFilter;

  render() {
    return html`
      <div class="filter-popup">
        ${this.renderFilterUI()}
        <button @click=${this.applyFilter}>Apply</button>
        <button @click=${this.clearFilter}>Clear</button>
      </div>
    `;
  }

  private renderFilterUI() {
    switch (this.columnType) {
      case 'text':
        return html`
          <input type="text"
            placeholder="Search..."
            @input=${this.handleInput} />
        `;
      case 'number':
        return html`
          <select @change=${this.handleOperatorChange}>
            <option value="equals">Equals</option>
            <option value="greaterThan">Greater than</option>
            <option value="lessThan">Less than</option>
          </select>
          <input type="number" @input=${this.handleInput} />
        `;
      // ... other types
    }
  }
}
```

### 3.5 Pagination

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRows: number;
}

class PaginationController {
  @state() private pagination: PaginationState = {
    currentPage: 1,
    pageSize: 25,
    totalRows: 0
  };

  get paginatedData(): RowData[] {
    if (!this.enablePagination) return this.processedData;

    const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;

    return this.processedData.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.pagination.totalRows / this.pagination.pageSize);
  }

  goToPage(page: number) {
    this.pagination = {
      ...this.pagination,
      currentPage: Math.max(1, Math.min(page, this.totalPages))
    };
  }
}
```

### 3.6 Selection

```typescript
interface SelectionState {
  selectedRowIds: Set<string>;
  rangeStart: string | null;
  mode: 'single' | 'multiple';
}

class SelectionController {
  @state() private selection: SelectionState = {
    selectedRowIds: new Set(),
    rangeStart: null,
    mode: 'multiple'
  };

  handleRowClick(rowId: string, event: MouseEvent) {
    const { ctrlKey, metaKey, shiftKey } = event;

    if (this.selection.mode === 'single') {
      this.selection.selectedRowIds = new Set([rowId]);
    } else if (shiftKey && this.selection.rangeStart) {
      this.selectRange(this.selection.rangeStart, rowId);
    } else if (ctrlKey || metaKey) {
      this.toggleSelection(rowId);
    } else {
      this.selection.selectedRowIds = new Set([rowId]);
    }

    this.selection.rangeStart = rowId;
    this.emitSelectionChanged();
  }

  private selectRange(startId: string, endId: string) {
    const startIdx = this.data.findIndex(r => r.id === startId);
    const endIdx = this.data.findIndex(r => r.id === endId);
    const [min, max] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];

    for (let i = min; i <= max; i++) {
      this.selection.selectedRowIds.add(this.data[i].id);
    }
  }

  getSelectedRows(): RowData[] {
    return this.data.filter(r => this.selection.selectedRowIds.has(r.id));
  }
}
```

### 3.7 In-Cell Editing

```typescript
interface CellPosition {
  rowId: string;
  field: string;
}

class EditingController {
  @state() private editingCell: CellPosition | null = null;
  @state() private editValue: any = null;

  startEditing(rowId: string, field: string, currentValue: any) {
    this.editingCell = { rowId, field };
    this.editValue = currentValue;
  }

  commitEdit() {
    if (!this.editingCell) return;

    const row = this.data.find(r => r.id === this.editingCell.rowId);
    if (row) {
      const oldValue = row[this.editingCell.field];
      row[this.editingCell.field] = this.editValue;

      this.dispatchEvent(new CustomEvent('cell-value-changed', {
        detail: {
          rowId: this.editingCell.rowId,
          field: this.editingCell.field,
          oldValue,
          newValue: this.editValue
        }
      }));
    }

    this.cancelEdit();
  }

  cancelEdit() {
    this.editingCell = null;
    this.editValue = null;
  }
}
```

#### Built-in Cell Editors

```typescript
@customElement('text-cell-editor')
export class TextCellEditor extends LitElement {
  @property() value: string = '';

  render() {
    return html`
      <input
        type="text"
        .value=${this.value}
        @input=${this.handleInput}
        @keydown=${this.handleKeyDown}
        @blur=${this.handleBlur}
      />
    `;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.commit();
    } else if (e.key === 'Escape') {
      this.cancel();
    }
  }

  private commit() {
    this.dispatchEvent(new CustomEvent('commit', {
      detail: { value: this.value }
    }));
  }
}

// Similar editors: NumberCellEditor, DateCellEditor, BooleanCellEditor
```

### 3.8 Column Manipulation

#### Resizing

```typescript
class ColumnResizeController {
  private resizing: { field: string; startX: number; startWidth: number } | null = null;

  startResize(field: string, startX: number) {
    const column = this.columnState.find(c => c.field === field);
    if (!column) return;

    this.resizing = { field, startX, startWidth: column.width };
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.resizing) return;

    const delta = e.clientX - this.resizing.startX;
    const newWidth = Math.max(50, this.resizing.startWidth + delta);

    const column = this.columnState.find(c => c.field === this.resizing.field);
    if (column) {
      column.width = newWidth;
      this.requestUpdate();
    }
  };

  private handleMouseUp = () => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.resizing = null;
  };
}
```

#### Reordering (Drag and Drop)

```typescript
class ColumnReorderController {
  private draggedColumn: string | null = null;

  handleDragStart(field: string, e: DragEvent) {
    this.draggedColumn = field;
    e.dataTransfer!.effectAllowed = 'move';
  }

  handleDragOver(field: string, e: DragEvent) {
    if (!this.draggedColumn || this.draggedColumn === field) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  }

  handleDrop(targetField: string, e: DragEvent) {
    e.preventDefault();
    if (!this.draggedColumn || this.draggedColumn === targetField) return;

    const fromIndex = this.columnState.findIndex(c => c.field === this.draggedColumn);
    const toIndex = this.columnState.findIndex(c => c.field === targetField);

    const [movedColumn] = this.columnState.splice(fromIndex, 1);
    this.columnState.splice(toIndex, 0, movedColumn);

    this.dispatchEvent(new CustomEvent('column-moved', {
      detail: { from: fromIndex, to: toIndex }
    }));

    this.draggedColumn = null;
    this.requestUpdate();
  }
}
```

### 3.9 Custom Cell Renderers

```typescript
type CellRendererFunction = (params: CellRendererParams) => TemplateResult;

interface CellRendererParams {
  value: any;
  data: RowData;
  column: ColumnDef;
  rowIndex: number;
}

// Usage in column definition
const columnDefs: ColumnDef[] = [
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: (params) => html`
      <span class="badge badge-${params.value.toLowerCase()}">
        ${params.value}
      </span>
    `
  },
  {
    field: 'actions',
    headerName: 'Actions',
    cellRenderer: (params) => html`
      <button @click=${() => editRow(params.data)}>Edit</button>
      <button @click=${() => deleteRow(params.data)}>Delete</button>
    `
  }
];
```

## 4. Theming Architecture

### 4.1 CSS Custom Properties Strategy

All visual styling exposed through CSS variables with sensible defaults.

```css
:host {
  /* Colors */
  --grid-background-color: #ffffff;
  --grid-border-color: #e0e0e0;
  --grid-header-background: #f5f5f5;
  --grid-header-text-color: #333333;
  --grid-row-hover-background: #f9f9f9;
  --grid-row-selected-background: #e3f2fd;
  --grid-cell-text-color: #333333;
  --grid-cell-border-color: #e0e0e0;

  /* Typography */
  --grid-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --grid-font-size: 14px;
  --grid-header-font-weight: 600;
  --grid-cell-font-weight: 400;

  /* Spacing */
  --grid-cell-padding: 8px 12px;
  --grid-header-padding: 12px;
  --grid-row-height: 40px;
  --grid-header-height: 48px;

  /* Borders */
  --grid-border-width: 1px;
  --grid-border-style: solid;

  /* Interactive */
  --grid-sort-icon-color: #666666;
  --grid-resize-handle-color: #cccccc;
  --grid-resize-handle-width: 4px;

  /* Z-index layers */
  --grid-header-z-index: 10;
  --grid-overlay-z-index: 100;
}
```

### 4.2 Theme Presets

#### Dark Theme

```css
.lit-grid[theme="dark"] {
  --grid-background-color: #1e1e1e;
  --grid-border-color: #3e3e3e;
  --grid-header-background: #2d2d2d;
  --grid-header-text-color: #e0e0e0;
  --grid-row-hover-background: #2a2a2a;
  --grid-row-selected-background: #264f78;
  --grid-cell-text-color: #cccccc;
  --grid-cell-border-color: #3e3e3e;
}
```

#### Compact Theme

```css
.lit-grid[theme="compact"] {
  --grid-row-height: 32px;
  --grid-header-height: 36px;
  --grid-cell-padding: 4px 8px;
  --grid-font-size: 13px;
}
```

### 4.3 Shadow Parts

Expose internal elements for advanced styling.

```typescript
render() {
  return html`
    <div part="container" class="grid-container">
      <div part="header" class="grid-header">
        ${this.renderHeaderCells()}
      </div>
      <div part="viewport" class="grid-viewport">
        <div part="body" class="grid-body">
          ${this.renderRows()}
        </div>
      </div>
      <div part="footer" class="grid-footer">
        ${this.renderPagination()}
      </div>
    </div>
  `;
}
```

Usage:

```css
lit-grid::part(header) {
  border-bottom: 2px solid #2196f3;
}

lit-grid::part(row-even) {
  background-color: #fafafa;
}
```

## 5. Performance Optimizations

### 5.1 Rendering Optimizations

1. **Virtual Scrolling:** Only render visible rows
2. **shouldUpdate:** Prevent unnecessary re-renders
3. **Memoization:** Cache computed values
4. **Debouncing:** Delay expensive operations (filtering, sorting)
5. **RAF Scheduling:** Batch DOM updates using requestAnimationFrame

```typescript
private shouldUpdate(changedProperties: PropertyValues): boolean {
  // Only update if data or visible properties changed
  return changedProperties.has('data') ||
         changedProperties.has('columnDefs') ||
         changedProperties.has('sortModel');
}

private debouncedFilter = debounce((filterModel: FilterModel) => {
  this.filterModel = filterModel;
  this.requestUpdate();
}, 300);
```

### 5.2 Bundle Size Optimization

1. **Tree Shaking:** ES modules with side-effect-free code
2. **Code Splitting:** Lazy load advanced features
3. **No Dependencies:** Zero runtime dependencies except Lit
4. **Minification:** Terser with optimal settings

**Target Bundle Sizes:**
- Core (grid + basic features): < 30KB gzipped
- With all features: < 50KB gzipped

## 6. Testing Strategy

### 6.1 Unit Tests (Web Test Runner)

```typescript
// grid-sorting.test.ts
import { fixture, expect } from '@open-wc/testing';
import { LitGrid } from '../src/lit-grid.js';

describe('Grid Sorting', () => {
  it('sorts ascending on first header click', async () => {
    const grid = await fixture<LitGrid>(html`
      <lit-grid .data=${testData} .columnDefs=${testColumns}></lit-grid>
    `);

    const header = grid.shadowRoot!.querySelector('[data-field="name"]');
    header!.click();
    await grid.updateComplete;

    const firstCell = grid.shadowRoot!.querySelector('.grid-cell');
    expect(firstCell!.textContent).to.equal('Alice');
  });

  it('sorts descending on second header click', async () => {
    // ...
  });
});
```

### 6.2 Integration Tests (Playwright)

```typescript
// editing.spec.ts
import { test, expect } from '@playwright/test';

test('in-cell editing workflow', async ({ page }) => {
  await page.goto('/examples/editing');

  // Double-click cell
  await page.dblclick('lit-grid >>> .grid-cell[data-row="0"][data-field="name"]');

  // Verify editor appears
  const editor = await page.locator('lit-grid >>> input[type="text"]');
  await expect(editor).toBeVisible();

  // Edit value
  await editor.fill('New Name');
  await editor.press('Enter');

  // Verify value updated
  const cell = await page.locator('lit-grid >>> .grid-cell[data-row="0"][data-field="name"]');
  await expect(cell).toHaveText('New Name');
});
```

### 6.3 Performance Tests

```typescript
// performance.test.ts
test('renders 10,000 rows in under 100ms', async () => {
  const startTime = performance.now();

  const grid = await fixture<LitGrid>(html`
    <lit-grid .data=${generate10kRows()}></lit-grid>
  `);
  await grid.updateComplete;

  const endTime = performance.now();
  expect(endTime - startTime).to.be.lessThan(100);
});

test('maintains 60fps during scrolling', async ({ page }) => {
  await page.goto('/examples/large-dataset');

  const metrics = await page.evaluate(async () => {
    const grid = document.querySelector('lit-grid');
    const viewport = grid!.shadowRoot!.querySelector('.grid-viewport');

    const frames: number[] = [];
    let lastTime = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      frames.push(now - lastTime);
      lastTime = now;
    };

    viewport!.addEventListener('scroll', measureFrame);

    // Simulate scroll
    for (let i = 0; i < 100; i++) {
      viewport!.scrollTop = i * 100;
      await new Promise(r => requestAnimationFrame(r));
    }

    return frames;
  });

  const avgFrameTime = metrics.reduce((a, b) => a + b) / metrics.length;
  expect(avgFrameTime).toBeLessThan(16.67); // 60fps = 16.67ms per frame
});
```

## 7. Accessibility

### 7.1 ARIA Implementation

```typescript
render() {
  return html`
    <div role="grid" aria-label="Data Grid" aria-rowcount=${this.data.length}>
      <div role="rowgroup">
        <div role="row" aria-rowindex="1">
          ${this.columnDefs.map((col, idx) => html`
            <div
              role="columnheader"
              aria-colindex=${idx + 1}
              aria-sort=${this.getAriaSort(col.field)}
              tabindex="0"
            >
              ${col.headerName}
            </div>
          `)}
        </div>
      </div>
      <div role="rowgroup">
        ${this.visibleRows.map((row, rowIdx) => html`
          <div
            role="row"
            aria-rowindex=${rowIdx + 2}
            aria-selected=${this.isRowSelected(row.id)}
          >
            ${this.columnDefs.map((col, colIdx) => html`
              <div
                role="gridcell"
                aria-colindex=${colIdx + 1}
                tabindex=${this.getCellTabIndex(rowIdx, colIdx)}
              >
                ${row[col.field]}
              </div>
            `)}
          </div>
        `)}
      </div>
    </div>
  `;
}
```

### 7.2 Keyboard Navigation

```typescript
private handleKeyDown(e: KeyboardEvent) {
  const { key, ctrlKey, shiftKey } = e;

  switch (key) {
    case 'ArrowDown':
      e.preventDefault();
      this.moveFocus(0, 1, shiftKey);
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.moveFocus(0, -1, shiftKey);
      break;
    case 'ArrowRight':
      e.preventDefault();
      this.moveFocus(1, 0);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      this.moveFocus(-1, 0);
      break;
    case 'Home':
      e.preventDefault();
      ctrlKey ? this.moveFocus(0, -Infinity) : this.moveFocus(-Infinity, 0);
      break;
    case 'End':
      e.preventDefault();
      ctrlKey ? this.moveFocus(0, Infinity) : this.moveFocus(Infinity, 0);
      break;
    case 'Enter':
    case 'F2':
      this.startEditing();
      break;
    case ' ':
      e.preventDefault();
      this.toggleRowSelection(shiftKey);
      break;
    case 'a':
      if (ctrlKey) {
        e.preventDefault();
        this.selectAll();
      }
      break;
  }
}
```

## 8. API Design

### 8.1 Public API Surface

```typescript
// Properties
interface LitGridProperties {
  data: RowData[];
  columnDefs: ColumnDef[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple';
  pageSize?: number;
  rowHeight?: number;
  theme?: 'light' | 'dark' | 'compact';
  dataMode?: 'client' | 'server';
}

// Methods
interface LitGridMethods {
  getSelectedRows(): RowData[];
  setQuickFilter(text: string): void;
  exportToCsv(filename?: string): void;
  refreshData(): void;
  sizeColumnsToFit(): void;
}

// Events
interface LitGridEvents {
  'selection-changed': { selectedRows: RowData[] };
  'sort-changed': { sortModel: SortModel[] };
  'filter-changed': { filterModel: FilterModel };
  'cell-clicked': { row: RowData; column: ColumnDef; value: any };
  'cell-value-changed': { rowId: string; field: string; oldValue: any; newValue: any };
  'row-double-clicked': { row: RowData };
  'column-resized': { field: string; width: number };
  'column-moved': { from: number; to: number };
}
```

## 9. Future Enhancements (Post v1.0)

### 9.1 Advanced Features
- Row grouping with aggregation
- Pivot mode
- Master/detail views
- Tree data structures
- Context menus
- Clipboard operations (cut/copy/paste)

### 9.2 Performance Enhancements
- Web Workers for data processing
- IndexedDB for client-side data storage
- Streaming data support
- Progressive rendering

### 9.3 Developer Experience
- CLI for scaffolding
- VS Code extension
- React/Vue/Angular wrappers
- Figma design system

## 10. Deployment and Distribution

### 10.1 NPM Package Structure

```
lit-grid/
├── dist/
│   ├── index.js          (ESM bundle)
│   ├── index.d.ts        (TypeScript definitions)
│   ├── lit-grid.umd.js   (UMD bundle)
│   └── themes/
│       ├── light.css
│       └── dark.css
├── src/
├── package.json
└── README.md
```

### 10.2 CDN Distribution

```html
<!-- ESM from CDN -->
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/lit-grid@1.0.0/dist/index.js';
</script>

<!-- UMD from CDN -->
<script src="https://cdn.jsdelivr.net/npm/lit-grid@1.0.0/dist/lit-grid.umd.js"></script>
```

### 10.3 Version Strategy

**Semantic Versioning:** MAJOR.MINOR.PATCH
- MAJOR: Breaking API changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes

**Release Cadence:**
- Major releases: Every 6-12 months
- Minor releases: Every 1-2 months
- Patch releases: As needed for critical bugs
