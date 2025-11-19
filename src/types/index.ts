import { TemplateResult } from 'lit';

/**
 * Represents a row of data in the grid
 */
export type RowData = Record<string, any>;

/**
 * Column definition for the grid
 */
export interface ColumnDef {
  /** Unique field name that maps to the data property */
  field: string;
  /** Display name for the column header */
  headerName: string;
  /** Column width in pixels */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Data type for the column */
  type?: 'text' | 'number' | 'date' | 'boolean';
  /** Enable/disable sorting for this column */
  sortable?: boolean;
  /** Enable/disable filtering for this column */
  filterable?: boolean;
  /** Enable/disable editing for this column */
  editable?: boolean;
  /** Hide the column by default */
  hide?: boolean;
  /** Custom cell renderer function */
  cellRenderer?: CellRendererFunction;
  /** Custom cell editor component */
  cellEditor?: CellEditorFunction;
  /** Custom comparator for sorting */
  comparator?: ComparatorFunction;
  /** Value getter function for complex data */
  valueGetter?: (data: RowData) => any;
  /** Value setter function for complex data */
  valueSetter?: (data: RowData, value: any) => void;
}

/**
 * Column state for managing runtime column properties
 */
export interface ColumnState {
  field: string;
  width: number;
  visible: boolean;
  order: number;
}

/**
 * Sort model for a column
 */
export interface SortModel {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

/**
 * Filter model for columns
 */
export interface FilterModel {
  [field: string]: ColumnFilter;
}

/**
 * Column filter configuration
 */
export interface ColumnFilter {
  type: 'text' | 'number' | 'date' | 'set' | 'boolean';
  operator: FilterOperator;
  value: any;
  value2?: any; // For range filters
}

/**
 * Filter operators
 */
export type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'inRange'
  | 'blank'
  | 'notBlank';

/**
 * Cell position in the grid
 */
export interface CellPosition {
  rowId: string;
  field: string;
  rowIndex: number;
  colIndex: number;
}

/**
 * Cell renderer function type
 */
export type CellRendererFunction = (params: CellRendererParams) => TemplateResult | string | number;

/**
 * Cell renderer parameters
 */
export interface CellRendererParams {
  value: any;
  data: RowData;
  column: ColumnDef;
  rowIndex: number;
  colIndex: number;
}

/**
 * Cell editor function type
 */
export type CellEditorFunction = (params: CellEditorParams) => TemplateResult;

/**
 * Cell editor parameters
 */
export interface CellEditorParams {
  value: any;
  data: RowData;
  column: ColumnDef;
  onCommit: (value: any) => void;
  onCancel: () => void;
}

/**
 * Comparator function for custom sorting
 */
export type ComparatorFunction = (a: any, b: any) => number;

/**
 * Pagination state
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRows: number;
}

/**
 * Selection state
 */
export interface SelectionState {
  selectedRowIds: Set<string>;
  rangeStart: string | null;
  mode: 'single' | 'multiple';
}

/**
 * Virtual scroll state
 */
export interface VirtualScrollState {
  scrollTop: number;
  scrollLeft: number;
  viewportHeight: number;
  viewportWidth: number;
  rowHeight: number;
  startRow: number;
  endRow: number;
}

/**
 * Grid configuration options
 */
export interface GridOptions {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableVirtualScroll?: boolean;
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  selectionMode?: 'single' | 'multiple';
  dataMode?: 'client' | 'server';
  pageSize?: number;
  rowHeight?: number;
  theme?: 'light' | 'dark' | 'compact';
}

/**
 * Grid events
 */
export interface GridEvents {
  'selection-changed': SelectionChangedEvent;
  'sort-changed': SortChangedEvent;
  'filter-changed': FilterChangedEvent;
  'cell-clicked': CellClickedEvent;
  'cell-value-changed': CellValueChangedEvent;
  'row-double-clicked': RowDoubleClickedEvent;
  'column-resized': ColumnResizedEvent;
  'column-moved': ColumnMovedEvent;
  'page-changed': PageChangedEvent;
}

export interface SelectionChangedEvent {
  selectedRows: RowData[];
  selectedRowIds: string[];
}

export interface SortChangedEvent {
  sortModel: SortModel[];
}

export interface FilterChangedEvent {
  filterModel: FilterModel;
}

export interface CellClickedEvent {
  row: RowData;
  column: ColumnDef;
  value: any;
  rowIndex: number;
  colIndex: number;
}

export interface CellValueChangedEvent {
  rowId: string;
  field: string;
  oldValue: any;
  newValue: any;
  data: RowData;
}

export interface RowDoubleClickedEvent {
  row: RowData;
  rowIndex: number;
}

export interface ColumnResizedEvent {
  field: string;
  width: number;
}

export interface ColumnMovedEvent {
  from: number;
  to: number;
}

export interface PageChangedEvent {
  currentPage: number;
  pageSize: number;
}

/**
 * Row grouping configuration
 */
export interface GroupConfig {
  field: string;
  hideColumn?: boolean;
  comparator?: ComparatorFunction;
}

/**
 * Aggregation function type
 */
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';

/**
 * Column aggregation configuration
 */
export interface ColumnAggregation {
  field: string;
  func: AggregationFunction;
}

/**
 * Group row data (represents a group header)
 */
export interface GroupRow {
  isGroup: true;
  groupKey: string;
  groupValue: any;
  groupField: string;
  children: RowData[];
  expanded: boolean;
  level: number;
  aggregations?: Record<string, any>;
}

/**
 * Row type that can be either data or group
 */
export type GridRow = RowData | GroupRow;

/**
 * Group changed event
 */
export interface GroupChangedEvent {
  groupBy: string[];
}

/**
 * Group expanded event
 */
export interface GroupExpandedEvent {
  groupKey: string;
  expanded: boolean;
}
