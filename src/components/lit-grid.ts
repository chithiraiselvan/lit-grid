import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  RowData,
  ColumnDef,
  ColumnState,
  SortModel,
  FilterModel,
  SelectionChangedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  CellClickedEvent,
  CellRendererParams,
  GroupConfig,
  ColumnAggregation,
  GridRow,
  GroupRow,
  PaginationState,
  PageChangedEvent,
  GroupExpandedEvent,
  ColumnResizedEvent
} from '../types/index.js';
import { VirtualScrollController } from '../controllers/VirtualScrollController.js';
import { SortController } from '../controllers/SortController.js';
import { FilterController } from '../controllers/FilterController.js';
import { GroupingController } from '../controllers/GroupingController.js';
import './grid-pagination.js';

@customElement('lit-grid')
export class LitGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 600px;

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

      /* Z-index */
      --grid-header-z-index: 10;
      --grid-overlay-z-index: 100;
    }

    :host([theme="dark"]) {
      --grid-background-color: #1e1e1e;
      --grid-border-color: #3e3e3e;
      --grid-header-background: #2d2d2d;
      --grid-header-text-color: #e0e0e0;
      --grid-row-hover-background: #2a2a2a;
      --grid-row-selected-background: #264f78;
      --grid-cell-text-color: #cccccc;
      --grid-cell-border-color: #3e3e3e;
    }

    :host([theme="compact"]) {
      --grid-row-height: 32px;
      --grid-header-height: 36px;
      --grid-cell-padding: 4px 8px;
      --grid-font-size: 13px;
    }

    .grid-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--grid-background-color);
      font-family: var(--grid-font-family);
      font-size: var(--grid-font-size);
      border: var(--grid-border-width) var(--grid-border-style) var(--grid-border-color);
      box-sizing: border-box;
    }

    .grid-header {
      display: flex;
      background: var(--grid-header-background);
      border-bottom: var(--grid-border-width) var(--grid-border-style) var(--grid-border-color);
      position: sticky;
      top: 0;
      z-index: var(--grid-header-z-index);
      min-height: var(--grid-header-height);
    }

    .header-cell {
      padding: var(--grid-header-padding);
      font-weight: var(--grid-header-font-weight);
      color: var(--grid-header-text-color);
      border-right: var(--grid-border-width) var(--grid-border-style) var(--grid-border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      box-sizing: border-box;
    }

    .header-cell:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .header-cell.sortable {
      cursor: pointer;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .sort-indicator {
      font-size: 12px;
      color: var(--grid-sort-icon-color);
    }

    .sort-priority {
      font-size: 10px;
      color: var(--grid-sort-icon-color);
    }

    .grid-viewport {
      flex: 1;
      overflow: auto;
      position: relative;
    }

    .grid-body {
      position: relative;
    }

    .grid-row {
      display: flex;
      border-bottom: var(--grid-border-width) var(--grid-border-style) var(--grid-cell-border-color);
      box-sizing: border-box;
    }

    .grid-row.virtual-scroll {
      position: absolute;
      left: 0;
      right: 0;
    }

    .grid-row:hover {
      background: var(--grid-row-hover-background);
    }

    .grid-row.selected {
      background: var(--grid-row-selected-background);
    }

    .grid-cell {
      padding: var(--grid-cell-padding);
      color: var(--grid-cell-text-color);
      font-weight: var(--grid-cell-font-weight);
      border-right: var(--grid-border-width) var(--grid-border-style) var(--grid-cell-border-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #999;
      font-style: italic;
    }

    .resize-handle {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: var(--grid-resize-handle-width);
      cursor: col-resize;
      background: transparent;
    }

    .resize-handle:hover {
      background: var(--grid-resize-handle-color);
    }

    /* Group Row Styles */
    .grid-row.group-row {
      background: var(--grid-header-background);
      font-weight: 600;
      cursor: pointer;
      user-select: none;
    }

    .grid-row.group-row:hover {
      background: #e8e8e8;
    }

    .group-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .group-expand-icon {
      font-size: 12px;
      transition: transform 0.2s;
      display: inline-block;
    }

    .group-expand-icon.expanded {
      transform: rotate(90deg);
    }

    .group-value {
      font-weight: 600;
    }

    .group-count {
      color: #666;
      font-weight: normal;
      font-size: 0.9em;
    }
  `;

  // Public properties
  @property({ type: Array }) data: RowData[] = [];
  @property({ type: Array }) columnDefs: ColumnDef[] = [];
  @property({ type: Boolean }) enableSorting = true;
  @property({ type: Boolean }) enableFiltering = false;
  @property({ type: Boolean }) enablePagination = false;
  @property({ type: Boolean }) enableSelection = true;
  @property({ type: Boolean }) enableVirtualScroll = true;
  @property({ type: Boolean }) enableColumnResize = true;
  @property({ type: Boolean }) enableGrouping = false;
  @property({ type: String }) selectionMode: 'single' | 'multiple' = 'single';
  @property({ type: String }) dataMode: 'client' | 'server' = 'client';
  @property({ type: Number }) pageSize = 25;
  @property({ type: Number }) rowHeight = 40;
  @property({ type: Array }) pageSizeOptions = [10, 25, 50, 100];
  @property({ type: String, reflect: true }) theme: 'light' | 'dark' | 'compact' = 'light';
  @property({ type: Array }) groupBy: GroupConfig[] = [];
  @property({ type: Array }) aggregations: ColumnAggregation[] = [];

  // Internal state
  @state() private sortModel: SortModel[] = [];
  @state() private filterModel: FilterModel = {};
  @state() private selectedRowIds: Set<string> = new Set();
  @state() private columnState: ColumnState[] = [];
  @state() private pagination: PaginationState = {
    currentPage: 1,
    pageSize: 25,
    totalRows: 0
  };

  // Query elements
  @query('.grid-viewport') private viewport!: HTMLElement;

  // Controllers
  private virtualScroll: VirtualScrollController;
  private sortController = new SortController();
  private filterController = new FilterController();
  private groupingController = new GroupingController();

  // Resize state
  private resizingColumn: string | null = null;
  private startX = 0;
  private startWidth = 0;
  private resizeMoveHandler: ((e: MouseEvent) => void) | null = null;
  private resizeEndHandler: ((e: MouseEvent) => void) | null = null;

  constructor() {
    super();
    this.virtualScroll = new VirtualScrollController(this, this.rowHeight);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeColumnState();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('columnDefs')) {
      this.initializeColumnState();
    }

    if (changedProperties.has('rowHeight')) {
      this.virtualScroll.updateRowHeight(this.rowHeight);
    }

    if (changedProperties.has('data') || changedProperties.has('sortModel') || changedProperties.has('filterModel')) {
      // Data processing handled in getters
    }
  }

  firstUpdated(): void {
    this.updateViewportDimensions();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  private initializeColumnState(): void {
    this.columnState = this.columnDefs.map((col, index) => ({
      field: col.field,
      width: col.width || 150,
      visible: !col.hide,
      order: index
    }));
  }

  private updateViewportDimensions(): void {
    if (this.viewport) {
      const rect = this.viewport.getBoundingClientRect();
      this.virtualScroll.updateViewport(rect.height, rect.width);
    }
  }

  private handleScroll = (): void => {
    if (!this.enableVirtualScroll || !this.viewport) return;
    this.virtualScroll.updateScroll(this.viewport.scrollTop, this.viewport.scrollLeft);
  };

  // Data processing getters
  private get processedData(): RowData[] {
    let result = [...this.data];

    // Apply filtering (client-side only)
    if (this.dataMode === 'client' && this.filterController.hasActiveFilters(this.filterModel)) {
      result = this.filterController.applyFilters(result, this.filterModel, this.columnDefs);
    }

    // Apply sorting (client-side only)
    if (this.dataMode === 'client' && this.sortModel.length > 0) {
      result = this.sortController.applySort(result, this.sortModel, this.columnDefs);
    }

    // Update pagination total
    this.pagination = {
      ...this.pagination,
      totalRows: result.length
    };

    return result;
  }

  private get groupedData(): GridRow[] {
    const data = this.processedData;

    if (!this.enableGrouping || this.groupBy.length === 0) {
      return data;
    }

    return this.groupingController.applyGrouping(
      data,
      this.groupBy,
      this.columnDefs,
      this.aggregations
    );
  }

  private get paginatedData(): GridRow[] {
    let data: GridRow[];

    if (this.enableGrouping && this.groupBy.length > 0) {
      // For grouped data, we need to flatten first before pagination
      data = this.groupingController.flattenVisibleRows(this.groupedData);
    } else {
      data = this.processedData;
    }

    if (!this.enablePagination) {
      return data;
    }

    const start = (this.pagination.currentPage - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;

    return data.slice(start, end);
  }

  private get visibleData(): GridRow[] {
    const data = this.paginatedData;

    // Disable virtual scrolling when:
    // 1. Virtual scroll is disabled
    // 2. Pagination is active (already limits data)
    // 3. Grouping feature is enabled (dynamic row expansion/collapse)
    if (!this.enableVirtualScroll || this.enablePagination || this.enableGrouping) {
      return data;
    }

    const { start, end } = this.virtualScroll.getVisibleRange(data.length);
    return data.slice(start, end);
  }

  private get visibleColumns(): Array<{ column: ColumnDef; state: ColumnState }> {
    return this.columnState
      .filter(state => state.visible)
      .sort((a, b) => a.order - b.order)
      .map(state => ({
        column: this.columnDefs.find(col => col.field === state.field)!,
        state
      }))
      .filter(item => item.column);
  }

  // Event handlers
  private handleHeaderClick(field: string, event: MouseEvent): void {
    if (!this.enableSorting) return;

    const column = this.columnDefs.find(col => col.field === field);
    if (!column || column.sortable === false) return;

    const multiSort = event.shiftKey;
    this.sortModel = this.sortController.toggleSort(field, this.sortModel, multiSort);

    this.dispatchEvent(new CustomEvent<SortChangedEvent>('sort-changed', {
      detail: { sortModel: this.sortModel },
      bubbles: true,
      composed: true
    }));
  }

  private handleRowClick(row: RowData, rowIndex: number, event: MouseEvent): void {
    if (!this.enableSelection) return;

    const rowId = this.getRowId(row, rowIndex);

    if (this.selectionMode === 'single') {
      this.selectedRowIds = new Set([rowId]);
    } else {
      if (event.ctrlKey || event.metaKey) {
        const newSet = new Set(this.selectedRowIds);
        if (newSet.has(rowId)) {
          newSet.delete(rowId);
        } else {
          newSet.add(rowId);
        }
        this.selectedRowIds = newSet;
      } else {
        this.selectedRowIds = new Set([rowId]);
      }
    }

    this.emitSelectionChanged();
  }

  private handleCellClick(row: RowData, column: ColumnDef, rowIndex: number, colIndex: number): void {
    const value = this.getCellValue(row, column);

    this.dispatchEvent(new CustomEvent<CellClickedEvent>('cell-clicked', {
      detail: { row, column, value, rowIndex, colIndex },
      bubbles: true,
      composed: true
    }));
  }

  private emitSelectionChanged(): void {
    const selectedRows = this.getSelectedRows();

    this.dispatchEvent(new CustomEvent<SelectionChangedEvent>('selection-changed', {
      detail: {
        selectedRows,
        selectedRowIds: Array.from(this.selectedRowIds)
      },
      bubbles: true,
      composed: true
    }));
  }

  // Public methods
  public getSelectedRows(): RowData[] {
    return this.processedData.filter((row, index) => {
      const rowId = this.getRowId(row, index);
      return this.selectedRowIds.has(rowId);
    });
  }

  public clearSelection(): void {
    this.selectedRowIds = new Set();
    this.emitSelectionChanged();
  }

  public selectAll(): void {
    this.selectedRowIds = new Set(
      this.processedData.map((row, index) => this.getRowId(row, index))
    );
    this.emitSelectionChanged();
  }

  public setQuickFilter(text: string): void {
    const quickFilterModel = this.filterController.createQuickFilter(text, this.columnDefs);
    // Merge with existing filters or replace based on your needs
    this.filterModel = quickFilterModel;

    this.dispatchEvent(new CustomEvent<FilterChangedEvent>('filter-changed', {
      detail: { filterModel: this.filterModel },
      bubbles: true,
      composed: true
    }));
  }

  public refreshData(): void {
    this.requestUpdate('data');
  }

  // Helper methods
  private getRowId(row: RowData, index: number): string {
    return row.id || `row-${index}`;
  }

  private getCellValue(row: RowData, column: ColumnDef): any {
    if (column.valueGetter) {
      return column.valueGetter(row);
    }
    return row[column.field];
  }

  private renderCellContent(row: RowData, column: ColumnDef, rowIndex: number, colIndex: number): any {
    const value = this.getCellValue(row, column);

    if (column.cellRenderer) {
      const params: CellRendererParams = {
        value,
        data: row,
        column,
        rowIndex,
        colIndex
      };
      return column.cellRenderer(params);
    }

    return value ?? '';
  }

  private getSortIndicator(field: string): string {
    const direction = this.sortController.getSortDirection(field, this.sortModel);
    if (!direction) return '';
    return direction === 'asc' ? '↑' : '↓';
  }

  private getSortPriority(field: string): number | null {
    return this.sortController.getSortPriority(field, this.sortModel);
  }

  // Render methods
  render() {
    return html`
      <div part="container" class="grid-container">
        ${this.renderHeader()}
        ${this.renderViewport()}
        ${this.enablePagination ? this.renderPagination() : ''}
      </div>
    `;
  }

  private renderHeader() {
    return html`
      <div part="header" class="grid-header">
        ${this.renderCheckboxHeader()}
        ${this.visibleColumns.map(({ column, state }) => this.renderHeaderCell(column, state))}
      </div>
    `;
  }

  private renderCheckboxHeader() {
    if (!this.enableSelection || this.selectionMode !== 'multiple') return '';

    const allSelected = this.processedData.length > 0 &&
      this.processedData.every((row, index) => this.selectedRowIds.has(this.getRowId(row, index)));

    const someSelected = !allSelected && this.selectedRowIds.size > 0;

    return html`
      <div
        part="header-cell checkbox-cell"
        class="header-cell checkbox-cell"
        style="width: 40px; min-width: 40px; max-width: 40px; padding: 0; justify-content: center;"
        @click=${this.handleSelectAllClick}
      >
        <input
          type="checkbox"
          .checked=${allSelected}
          .indeterminate=${someSelected}
          @click=${(e: MouseEvent) => e.stopPropagation()}
          @change=${this.handleSelectAllClick}
        >
      </div>
    `;
  }

  private handleSelectAllClick = (e: Event) => {
    e.stopPropagation();
    if (this.selectedRowIds.size === this.processedData.length && this.processedData.length > 0) {
      this.clearSelection();
    } else {
      this.selectAll();
    }
  };

  private renderHeaderCell(column: ColumnDef, state: ColumnState) {
    const sortable = this.enableSorting && column.sortable !== false;
    const sortIndicator = this.getSortIndicator(column.field);
    const sortPriority = this.getSortPriority(column.field);
    const showPriority = this.sortModel.length > 1 && sortPriority !== null;

    return html`
      <div
        part="header-cell"
        class=${classMap({ 'header-cell': true, sortable })}
        style=${styleMap({ width: `${state.width}px`, minWidth: `${state.width}px` })}
        @click=${(e: MouseEvent) => this.handleHeaderClick(column.field, e)}
      >
        <div class="header-content">
          <span>${column.headerName}</span>
          ${sortIndicator ? html`<span class="sort-indicator">${sortIndicator}</span>` : ''}
          ${showPriority ? html`<span class="sort-priority">${(sortPriority ?? 0) + 1}</span>` : ''}
        </div>
        ${this.enableColumnResize ? html`
          <div
            class="resize-handle"
            @click=${(e: MouseEvent) => e.stopPropagation()}
            @mousedown=${(e: MouseEvent) => this.handleResizeStart(column.field, e)}
          ></div>
        ` : ''}
      </div>
    `;
  }

  private renderViewport() {
    // Use paginatedData which already includes grouping and pagination
    const data = this.paginatedData;

    if (data.length === 0) {
      return html`
        <div part="viewport" class="grid-viewport" @scroll=${this.handleScroll}>
          <div class="empty-state">No data to display</div>
        </div>
      `;
    }

    // Disable virtual scrolling when pagination or grouping is active
    // Use auto height instead of fixed height to prevent white space
    const useVirtualScroll = this.enableVirtualScroll && !this.enablePagination && !this.enableGrouping;

    const totalHeight = useVirtualScroll
      ? this.virtualScroll.getTotalHeight(data.length)
      : 'auto';

    const { start } = useVirtualScroll
      ? this.virtualScroll.getVisibleRange(data.length)
      : { start: 0 };

    const bodyStyle = totalHeight === 'auto'
      ? {}
      : { height: `${totalHeight}px` };

    return html`
      <div part="viewport" class="grid-viewport" @scroll=${this.handleScroll}>
        <div part="body" class="grid-body" style=${styleMap(bodyStyle)}>
          ${this.visibleData.map((row, visibleIndex) =>
      this.renderRow(row, start + visibleIndex)
    )}
        </div>
      </div>
    `;
  }

  private renderRow(row: GridRow, rowIndex: number) {
    if (this.groupingController.isGroupRow(row)) {
      return this.renderGroupRow(row as GroupRow, rowIndex);
    }
    return this.renderDataRow(row as RowData, rowIndex);
  }

  private renderGroupRow(group: GroupRow, rowIndex: number) {
    const useVirtualScroll = this.enableVirtualScroll && !this.enablePagination && !this.enableGrouping;
    const rowStyle = useVirtualScroll
      ? this.virtualScroll.getRowStyle(rowIndex)
      : `height: ${this.rowHeight}px;`;

    const indent = group.level * 20;

    return html`
      <div
        part="row group-row"
        class=${classMap({
      'grid-row': true,
      'group-row': true,
      'virtual-scroll': useVirtualScroll
    })}
        style=${rowStyle}
        @click=${() => this.handleGroupClick(group)}
        data-row-index=${rowIndex}
      >
        <div
          part="cell group-cell"
          class="grid-cell group-cell"
          style=${styleMap({ paddingLeft: `${indent + 12}px` })}
        >
          <span class=${classMap({
      'group-expand-icon': true,
      'expanded': group.expanded
    })}>
            ▶
          </span>
          <span class="group-value">${group.groupField}: ${group.groupValue}</span>
          <span class="group-count">(${group.children.length})</span>
          ${group.aggregations ? this.renderAggregations(group.aggregations) : ''}
        </div>
      </div>
    `;
  }

  private renderAggregations(aggregations: Record<string, any>) {
    return html`
      <span style="margin-left: auto; display: flex; gap: 16px;">
        ${Object.entries(aggregations).filter(([key]) => key !== 'count').map(([key, value]) => html`
          <span style="color: #666; font-size: 0.9em;">
            ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        `)}
      </span>
    `;
  }

  private renderDataRow(row: RowData, rowIndex: number) {
    const rowId = this.getRowId(row, rowIndex);
    const isSelected = this.selectedRowIds.has(rowId);
    const useVirtualScroll = this.enableVirtualScroll && !this.enablePagination && !this.enableGrouping;
    const rowStyle = useVirtualScroll
      ? this.virtualScroll.getRowStyle(rowIndex)
      : `height: ${this.rowHeight}px;`;

    return html`
      <div
        part="row"
        class=${classMap({
      'grid-row': true,
      'selected': isSelected,
      'virtual-scroll': useVirtualScroll
    })}
        style=${rowStyle}
        @click=${(e: MouseEvent) => this.handleRowClick(row, rowIndex, e)}
        data-row-index=${rowIndex}
      >
        ${this.renderCheckboxCell(row, rowIndex, isSelected)}
        ${this.visibleColumns.map(({ column, state }, colIndex) =>
      this.renderCell(row, column, state, rowIndex, colIndex)
    )}
      </div>
    `;
  }

  private renderCheckboxCell(row: RowData, rowIndex: number, isSelected: boolean) {
    if (!this.enableSelection || this.selectionMode !== 'multiple') return '';

    return html`
      <div
        part="cell checkbox-cell"
        class="grid-cell checkbox-cell"
        style="width: 40px; min-width: 40px; max-width: 40px; padding: 0; justify-content: center;"
        @click=${(e: MouseEvent) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          .checked=${isSelected}
          @change=${(e: Event) => this.handleCheckboxChange(e, row, rowIndex)}
        >
      </div>
    `;
  }

  private handleCheckboxChange(e: Event, row: RowData, rowIndex: number) {
    e.stopPropagation();
    const rowId = this.getRowId(row, rowIndex);
    const newSet = new Set(this.selectedRowIds);

    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }

    this.selectedRowIds = newSet;
    this.emitSelectionChanged();
  }

  private renderCell(
    row: RowData,
    column: ColumnDef,
    state: ColumnState,
    rowIndex: number,
    colIndex: number
  ) {
    return html`
      <div
        part="cell"
        class="grid-cell"
        style=${styleMap({ width: `${state.width}px`, minWidth: `${state.width}px` })}
        @click=${() => this.handleCellClick(row, column, rowIndex, colIndex)}
        data-field=${column.field}
      >
        ${this.renderCellContent(row, column, rowIndex, colIndex)}
      </div>
    `;
  }

  private renderPagination() {
    return html`
      <grid-pagination
        part="pagination"
        .currentPage=${this.pagination.currentPage}
        .pageSize=${this.pagination.pageSize}
        .totalRows=${this.pagination.totalRows}
        .pageSizeOptions=${this.pageSizeOptions}
        @page-changed=${this.handlePageChanged}
      ></grid-pagination>
    `;
  }

  // Group handling
  private handleGroupClick(group: GroupRow): void {
    const expanded = this.groupingController.toggleGroup(group.groupKey);

    this.dispatchEvent(new CustomEvent<GroupExpandedEvent>('group-expanded', {
      detail: {
        groupKey: group.groupKey,
        expanded
      },
      bubbles: true,
      composed: true
    }));

    this.requestUpdate();
  }

  // Pagination handling
  private handlePageChanged(e: CustomEvent<PageChangedEvent>): void {
    this.pagination = {
      currentPage: e.detail.currentPage,
      pageSize: e.detail.pageSize,
      totalRows: this.pagination.totalRows
    };

    // Reset scroll position to top when page changes
    if (this.viewport) {
      this.viewport.scrollTop = 0;
    }
  }

  // Column Resizing
  private handleResizeStart(field: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const columnState = this.columnState.find(c => c.field === field);
    if (!columnState) return;

    this.resizingColumn = field;
    this.startX = event.clientX;
    this.startWidth = columnState.width;

    this.resizeMoveHandler = this.handleResizeMove.bind(this);
    this.resizeEndHandler = this.handleResizeEnd.bind(this);

    document.addEventListener('mousemove', this.resizeMoveHandler);
    document.addEventListener('mouseup', this.resizeEndHandler);

    // Add resizing class to body to prevent cursor flickering
    document.body.style.cursor = 'col-resize';
  }

  private handleResizeMove(event: MouseEvent): void {
    if (!this.resizingColumn) return;

    const diff = event.clientX - this.startX;
    const newWidth = Math.max(50, this.startWidth + diff); // Minimum width 50px

    this.columnState = this.columnState.map(col => {
      if (col.field === this.resizingColumn) {
        return { ...col, width: newWidth };
      }
      return col;
    });
  }

  private handleResizeEnd(event: MouseEvent): void {
    if (!this.resizingColumn) return;

    const columnState = this.columnState.find(c => c.field === this.resizingColumn);
    if (columnState) {
      this.dispatchEvent(new CustomEvent<ColumnResizedEvent>('column-resized', {
        detail: {
          field: this.resizingColumn,
          width: columnState.width
        },
        bubbles: true,
        composed: true
      }));
    }

    this.resizingColumn = null;

    if (this.resizeMoveHandler) {
      document.removeEventListener('mousemove', this.resizeMoveHandler);
      this.resizeMoveHandler = null;
    }

    if (this.resizeEndHandler) {
      document.removeEventListener('mouseup', this.resizeEndHandler);
      this.resizeEndHandler = null;
    }

    document.body.style.cursor = '';
  }




  // Public methods for grouping
  public expandAllGroups(): void {
    this.groupingController.expandAll(this.groupedData);
    this.requestUpdate();
  }

  public collapseAllGroups(): void {
    this.groupingController.collapseAll();
    this.requestUpdate();
  }

  public setGroupBy(groupBy: GroupConfig[]): void {
    this.groupBy = groupBy;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-grid': LitGrid;
  }
}
