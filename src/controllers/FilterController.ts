import { FilterModel, ColumnFilter, RowData, ColumnDef } from '../types/index.js';
import { isEmpty } from '../utils/helpers.js';

export class FilterController {
  /**
   * Apply filters to data
   */
  applyFilters(data: RowData[], filterModel: FilterModel, columnDefs: ColumnDef[]): RowData[] {
    if (Object.keys(filterModel).length === 0) return data;

    return data.filter(row => {
      return Object.entries(filterModel).every(([field, filter]) => {
        const column = columnDefs.find(col => col.field === field);
        const value = this.getColumnValue(row, column);
        return this.testFilter(value, filter);
      });
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
   * Test a single filter against a value
   */
  private testFilter(value: any, filter: ColumnFilter): boolean {
    switch (filter.operator) {
      case 'contains':
        return this.testContains(value, filter.value);

      case 'notContains':
        return !this.testContains(value, filter.value);

      case 'equals':
        return this.testEquals(value, filter.value);

      case 'notEquals':
        return !this.testEquals(value, filter.value);

      case 'startsWith':
        return this.testStartsWith(value, filter.value);

      case 'endsWith':
        return this.testEndsWith(value, filter.value);

      case 'lessThan':
        return this.testLessThan(value, filter.value);

      case 'lessThanOrEqual':
        return this.testLessThanOrEqual(value, filter.value);

      case 'greaterThan':
        return this.testGreaterThan(value, filter.value);

      case 'greaterThanOrEqual':
        return this.testGreaterThanOrEqual(value, filter.value);

      case 'inRange':
        return this.testInRange(value, filter.value, filter.value2);

      case 'blank':
        return isEmpty(value);

      case 'notBlank':
        return !isEmpty(value);

      default:
        return true;
    }
  }

  private testContains(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  }

  private testEquals(value: any, filterValue: any): boolean {
    if (typeof value === 'number' && typeof filterValue === 'number') {
      return value === filterValue;
    }
    return String(value).toLowerCase() === String(filterValue).toLowerCase();
  }

  private testStartsWith(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
  }

  private testEndsWith(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
  }

  private testLessThan(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return Number(value) < Number(filterValue);
  }

  private testLessThanOrEqual(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return Number(value) <= Number(filterValue);
  }

  private testGreaterThan(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return Number(value) > Number(filterValue);
  }

  private testGreaterThanOrEqual(value: any, filterValue: any): boolean {
    if (isEmpty(value) || isEmpty(filterValue)) return false;
    return Number(value) >= Number(filterValue);
  }

  private testInRange(value: any, min: any, max: any): boolean {
    if (isEmpty(value) || isEmpty(min) || isEmpty(max)) return false;
    const numValue = Number(value);
    return numValue >= Number(min) && numValue <= Number(max);
  }

  /**
   * Create a quick filter that searches across all columns
   */
  createQuickFilter(searchText: string, columnDefs: ColumnDef[]): FilterModel {
    if (!searchText || searchText.trim() === '') {
      return {};
    }

    const filterModel: FilterModel = {};
    columnDefs.forEach(column => {
      if (column.filterable !== false) {
        filterModel[column.field] = {
          type: 'text',
          operator: 'contains',
          value: searchText.trim()
        };
      }
    });

    return filterModel;
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filterModel: FilterModel): boolean {
    return Object.keys(filterModel).length > 0;
  }

  /**
   * Clear all filters
   */
  clearFilters(): FilterModel {
    return {};
  }

  /**
   * Clear filter for specific column
   */
  clearColumnFilter(field: string, filterModel: FilterModel): FilterModel {
    const newModel = { ...filterModel };
    delete newModel[field];
    return newModel;
  }
}
