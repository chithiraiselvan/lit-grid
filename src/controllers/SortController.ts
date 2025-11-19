import { SortModel, RowData, ColumnDef } from '../types/index.js';

export class SortController {
  /**
   * Apply sorting to data
   */
  applySort(data: RowData[], sortModel: SortModel[], columnDefs: ColumnDef[]): RowData[] {
    if (sortModel.length === 0) return data;

    // Sort by priority (multi-column sort)
    const sortedModel = [...sortModel].sort((a, b) => a.priority - b.priority);

    return [...data].sort((rowA, rowB) => {
      for (const sort of sortedModel) {
        const column = columnDefs.find(col => col.field === sort.field);
        const aVal = this.getColumnValue(rowA, column);
        const bVal = this.getColumnValue(rowB, column);

        let compare: number;
        if (column?.comparator) {
          compare = column.comparator(aVal, bVal);
        } else {
          compare = this.defaultCompare(aVal, bVal);
        }

        if (compare !== 0) {
          return sort.direction === 'asc' ? compare : -compare;
        }
      }
      return 0;
    });
  }

  /**
   * Get value from row using column definition
   */
  private getColumnValue(row: RowData, column?: ColumnDef): any {
    if (!column) return null;
    if (column.valueGetter) {
      return column.valueGetter(row);
    }
    return row[column.field];
  }

  /**
   * Default comparison function
   */
  private defaultCompare(a: any, b: any): number {
    // Handle null/undefined
    if (a === b) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Handle strings (case-insensitive)
    if (typeof a === 'string' && typeof b === 'string') {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    // Handle booleans
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    // Fallback to string comparison
    return String(a).localeCompare(String(b));
  }

  /**
   * Toggle sort for a column
   */
  toggleSort(
    field: string,
    currentModel: SortModel[],
    multiSort: boolean = false
  ): SortModel[] {
    const existingSort = currentModel.find(s => s.field === field);

    if (!multiSort) {
      // Single column sort
      if (!existingSort) {
        return [{ field, direction: 'asc', priority: 0 }];
      } else if (existingSort.direction === 'asc') {
        return [{ field, direction: 'desc', priority: 0 }];
      } else {
        return []; // Remove sort
      }
    } else {
      // Multi-column sort
      if (!existingSort) {
        const newPriority = currentModel.length;
        return [...currentModel, { field, direction: 'asc', priority: newPriority }];
      } else if (existingSort.direction === 'asc') {
        return currentModel.map(s =>
          s.field === field ? { ...s, direction: 'desc' as const } : s
        );
      } else {
        // Remove this sort and reorder priorities
        return currentModel
          .filter(s => s.field !== field)
          .map((s, index) => ({ ...s, priority: index }));
      }
    }
  }

  /**
   * Get sort direction for a column
   */
  getSortDirection(field: string, sortModel: SortModel[]): 'asc' | 'desc' | null {
    const sort = sortModel.find(s => s.field === field);
    return sort ? sort.direction : null;
  }

  /**
   * Get sort priority for a column (for multi-sort display)
   */
  getSortPriority(field: string, sortModel: SortModel[]): number | null {
    const sort = sortModel.find(s => s.field === field);
    return sort ? sort.priority : null;
  }
}
