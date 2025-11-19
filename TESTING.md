# Testing Guide for Lit Grid

## Overview

Comprehensive test suite for the Lit Grid component covering core functionality, pagination, and grouping features.

## Test Framework

- **Test Runner**: Web Test Runner (@web/test-runner)
- **Testing Library**: Open WC Testing (@open-wc/testing)
- **Assertion Library**: Chai
- **TypeScript**: Full TypeScript support with esbuild plugin

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch
```

## Test Coverage

### 1. Core Functionality Tests (`test/lit-grid.test.ts`)

#### Basic Rendering
- ✅ Renders with default properties
- ✅ Displays data when provided
- ✅ Shows empty state when no data
- ✅ Renders correct number of columns

#### Virtual Scrolling
- ✅ Enables virtual scrolling by default
- ✅ Handles large datasets without rendering all rows
- ✅ Sets correct total height for virtual scroll container
- ✅ **Fixed**: Calculates height based on paginated/grouped data (prevents white space)

#### Selection
- ✅ Single row selection
- ✅ Select all method
- ✅ Clear selection method
- ✅ Visual selection highlighting

#### Theming
- ✅ Applies light theme by default
- ✅ Applies dark theme when specified
- ✅ Applies compact theme when specified

### 2. Pagination Tests (`test/pagination.test.ts`)

#### GridPagination Component
- ✅ Renders pagination controls
- ✅ Calculates total pages correctly
- ✅ Shows correct row range ("Showing X-Y of Z")
- ✅ Emits page-changed event when page changes
- ✅ Disables navigation when on first/last page

#### Grid with Pagination
- ✅ Paginates data correctly
- ✅ Renders pagination component when enabled
- ✅ Updates displayed data when page changes
- ✅ **Fixed**: Works with virtual scrolling enabled (correct height calculation)
- ✅ **Fixed**: Resets scroll position when page changes

### 3. Grouping Tests (`test/grouping.test.ts`)

#### GroupingController
- ✅ Creates groups by field
- ✅ Calculates aggregations correctly (sum, avg, min, max, count)
- ✅ Supports multi-level grouping
- ✅ Toggles group expansion
- ✅ Expands all groups
- ✅ Collapses all groups
- ✅ Flattens visible rows correctly

#### Grid with Grouping
- ✅ Renders group rows when grouping is enabled
- ✅ Shows aggregations in group rows
- ✅ Expands/collapses groups on click
- ✅ Supports expandAllGroups method
- ✅ Supports collapseAllGroups method

#### Grouping with Pagination
- ✅ Works together with pagination
- ✅ **Fixed**: Correct virtual scroll height with grouped data

## Bug Fixes

### Issue: White Space After 20 Records

**Problem**: When scrolling, white space appeared after ~20 records because the virtual scroll container height was calculated based on total data instead of paginated/grouped data.

**Root Cause**:
```typescript
// Before (WRONG)
const totalHeight = this.virtualScroll.getTotalHeight(this.processedData.length);
// This used total data count (e.g., 1000 rows) even when pagination showed only 25
```

**Fix**:
```typescript
// After (CORRECT)
const data = this.paginatedData; // Already includes grouping and pagination
const totalHeight = this.enableVirtualScroll
  ? this.virtualScroll.getTotalHeight(data.length)
  : data.length * this.rowHeight;
// Now uses actual displayed data count (e.g., 25 rows for pageSize=25)
```

**Additional Improvements**:
1. Reset scroll position to top when page changes
2. Correct height calculation for grouped data
3. Proper virtual scroll range calculation

## Test Structure

```
test/
├── lit-grid.test.ts       # Core functionality tests
├── pagination.test.ts     # Pagination feature tests
└── grouping.test.ts       # Grouping feature tests
```

## Writing New Tests

### Example Test Structure

```typescript
import { fixture, html, expect } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import '../src/index.js';

describe('Feature Name', () => {
  it('should do something', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${testColumns}
      ></lit-grid>
    `);

    await el.updateComplete;

    // Assertions
    expect(el.someProperty).to.equal(expectedValue);
  });
});
```

### Best Practices

1. **Use fixture()**: Always use `@open-wc/testing` fixture for component instantiation
2. **Wait for updates**: Use `await el.updateComplete` after changes
3. **Shadow DOM queries**: Use `el.shadowRoot!.querySelector()` for internal elements
4. **Test isolation**: Each test should be independent
5. **Descriptive names**: Use clear, descriptive test names

## Manual Testing

### Pagination Scrolling Test

1. Open http://localhost:3000/demo/grouping-pagination.html
2. Navigate to "Pagination" section
3. Scroll through the grid - should not see white space
4. Change pages - should not see white space
5. Change page size - should recalculate height correctly

### Grouping with Virtual Scroll Test

1. Open http://localhost:3000/demo/grouping-pagination.html
2. Navigate to "Row Grouping" section
3. Click "Group by Department"
4. Expand groups - should render correctly
5. Scroll - should not see white space

### Combined Test

1. Navigate to "Pagination + Grouping Combined"
2. Click "Group by Department"
3. Expand all groups
4. Navigate through pages
5. Scroll within pages
6. Verify no white space issues

## Test Coverage Goals

| Category | Goal | Current |
|----------|------|---------|
| Statements | 70% | TBD |
| Branches | 60% | TBD |
| Functions | 70% | TBD |
| Lines | 70% | TBD |

## Continuous Integration

To add CI testing, add this to your workflow:

```yaml
- name: Run tests
  run: npm test

- name: Type check
  run: npm run type-check

- name: Build
  run: npm run build
```

## Known Issues / Future Tests

1. ⏳ In-cell editing (not yet implemented)
2. ⏳ Column resizing (not yet implemented)
3. ⏳ Column reordering (not yet implemented)
4. ⏳ Keyboard navigation tests
5. ⏳ Accessibility (a11y) tests
6. ⏳ Performance benchmarks

## Performance Testing

### Virtual Scroll Performance

```typescript
// Example performance test
test('should render 10,000 rows in under 100ms', async () => {
  const startTime = performance.now();

  const el = await fixture<LitGrid>(html`
    <lit-grid .data=${generate10kRows()}></lit-grid>
  `);
  await el.updateComplete;

  const endTime = performance.now();
  expect(endTime - startTime).to.be.lessThan(100);
});
```

### Bundle Size Check

```bash
# Check bundle sizes
npm run build

# Expected:
# - ES module: ~14KB gzipped
# - UMD module: ~14KB gzipped
```

## Debugging Tests

### Run specific test file

```bash
npx web-test-runner test/pagination.test.ts
```

### Enable browser debugging

```bash
npx web-test-runner --manual
```

Then open the provided URL in your browser and use DevTools.

### Verbose output

```bash
npx web-test-runner --verbose
```

## Resources

- [Web Test Runner Docs](https://modern-web.dev/docs/test-runner/overview/)
- [Open WC Testing](https://open-wc.org/docs/testing/testing-package/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Lit Testing Best Practices](https://lit.dev/docs/tools/testing/)
