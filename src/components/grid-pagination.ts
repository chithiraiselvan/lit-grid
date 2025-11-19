import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PageChangedEvent } from '../types/index.js';

@customElement('grid-pagination')
export class GridPagination extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 12px 16px;
      background: var(--grid-background-color, #ffffff);
      border-top: var(--grid-border-width, 1px) var(--grid-border-style, solid) var(--grid-border-color, #e0e0e0);
      font-family: var(--grid-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
      font-size: var(--grid-font-size, 14px);
    }

    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .pagination-info {
      color: var(--grid-cell-text-color, #333333);
      font-size: 13px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    select {
      padding: 6px 8px;
      border: 1px solid var(--grid-border-color, #e0e0e0);
      border-radius: 4px;
      background: var(--grid-background-color, #ffffff);
      color: var(--grid-cell-text-color, #333333);
      font-size: 13px;
      cursor: pointer;
    }

    select:hover {
      border-color: #999;
    }

    select:focus {
      outline: none;
      border-color: #2196f3;
    }

    button {
      padding: 6px 12px;
      border: 1px solid var(--grid-border-color, #e0e0e0);
      border-radius: 4px;
      background: var(--grid-background-color, #ffffff);
      color: var(--grid-cell-text-color, #333333);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 32px;
    }

    button:hover:not(:disabled) {
      background: var(--grid-row-hover-background, #f9f9f9);
      border-color: #999;
    }

    button:active:not(:disabled) {
      background: #e0e0e0;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.active {
      background: #2196f3;
      color: white;
      border-color: #2196f3;
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .page-ellipsis {
      padding: 6px 8px;
      color: var(--grid-cell-text-color, #666);
    }

    .page-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    input[type="number"] {
      width: 60px;
      padding: 6px 8px;
      border: 1px solid var(--grid-border-color, #e0e0e0);
      border-radius: 4px;
      background: var(--grid-background-color, #ffffff);
      color: var(--grid-cell-text-color, #333333);
      font-size: 13px;
      text-align: center;
    }

    input[type="number"]:focus {
      outline: none;
      border-color: #2196f3;
    }

    /* Remove spinner arrows */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }
  `;

  @property({ type: Number }) currentPage = 1;
  @property({ type: Number }) pageSize = 25;
  @property({ type: Number }) totalRows = 0;
  @property({ type: Array }) pageSizeOptions = [10, 25, 50, 100];
  @property({ type: Boolean }) showPageSizeSelector = true;
  @property({ type: Boolean }) showPageNumbers = true;
  @property({ type: Boolean }) showPageInput = false;
  @property({ type: Number }) maxPageButtons = 7;

  private get totalPages(): number {
    return Math.ceil(this.totalRows / this.pageSize);
  }

  private get startRow(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  private get endRow(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  private handlePageSizeChange(e: Event): void {
    const select = e.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value);

    this.dispatchEvent(new CustomEvent<PageChangedEvent>('page-changed', {
      detail: {
        currentPage: 1, // Reset to first page when changing page size
        pageSize: newPageSize
      },
      bubbles: true,
      composed: true
    }));
  }

  private handlePageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.dispatchEvent(new CustomEvent<PageChangedEvent>('page-changed', {
      detail: {
        currentPage: page,
        pageSize: this.pageSize
      },
      bubbles: true,
      composed: true
    }));
  }

  private handleFirstPage(): void {
    this.handlePageChange(1);
  }

  private handlePreviousPage(): void {
    this.handlePageChange(this.currentPage - 1);
  }

  private handleNextPage(): void {
    this.handlePageChange(this.currentPage + 1);
  }

  private handleLastPage(): void {
    this.handlePageChange(this.totalPages);
  }

  private handlePageInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const page = parseInt(input.value);

    if (!isNaN(page)) {
      this.handlePageChange(page);
    }
  }

  private getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxPageButtons;

    if (total <= max) {
      // Show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      const sidePages = Math.floor((max - 3) / 2); // Pages on each side of current

      pages.push(1);

      if (current <= sidePages + 2) {
        // Current page is near the start
        for (let i = 2; i <= max - 2; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      } else if (current >= total - sidePages - 1) {
        // Current page is near the end
        pages.push('ellipsis');
        for (let i = total - max + 3; i <= total - 1; i++) {
          pages.push(i);
        }
      } else {
        // Current page is in the middle
        pages.push('ellipsis');
        for (let i = current - sidePages; i <= current + sidePages; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }

      pages.push(total);
    }

    return pages;
  }

  render() {
    if (this.totalRows === 0) {
      return html`
        <div class="pagination-container">
          <div class="pagination-info">No data</div>
        </div>
      `;
    }

    return html`
      <div class="pagination-container" part="pagination-container">
        ${this.renderInfo()}
        ${this.renderControls()}
      </div>
    `;
  }

  private renderInfo() {
    return html`
      <div class="pagination-info" part="pagination-info">
        Showing ${this.startRow.toLocaleString()} to ${this.endRow.toLocaleString()}
        of ${this.totalRows.toLocaleString()} rows
      </div>
    `;
  }

  private renderControls() {
    return html`
      <div class="pagination-controls" part="pagination-controls">
        ${this.showPageSizeSelector ? this.renderPageSizeSelector() : ''}
        ${this.showPageNumbers ? this.renderPageButtons() : ''}
        ${this.showPageInput ? this.renderPageInput() : ''}
      </div>
    `;
  }

  private renderPageSizeSelector() {
    return html`
      <div class="page-size-selector" part="page-size-selector">
        <label>Rows per page:</label>
        <select @change=${this.handlePageSizeChange} .value=${String(this.pageSize)}>
          ${this.pageSizeOptions.map(size => html`
            <option value=${size} ?selected=${size === this.pageSize}>
              ${size}
            </option>
          `)}
        </select>
      </div>
    `;
  }

  private renderPageButtons() {
    return html`
      <div class="page-numbers" part="page-numbers">
        <button
          @click=${this.handleFirstPage}
          ?disabled=${this.currentPage === 1}
          title="First page"
        >
          ⟪
        </button>
        <button
          @click=${this.handlePreviousPage}
          ?disabled=${this.currentPage === 1}
          title="Previous page"
        >
          ‹
        </button>

        ${this.getPageNumbers().map(page => {
          if (page === 'ellipsis') {
            return html`<span class="page-ellipsis">...</span>`;
          }
          return html`
            <button
              class=${page === this.currentPage ? 'active' : ''}
              @click=${() => this.handlePageChange(page as number)}
            >
              ${page}
            </button>
          `;
        })}

        <button
          @click=${this.handleNextPage}
          ?disabled=${this.currentPage === this.totalPages}
          title="Next page"
        >
          ›
        </button>
        <button
          @click=${this.handleLastPage}
          ?disabled=${this.currentPage === this.totalPages}
          title="Last page"
        >
          ⟫
        </button>
      </div>
    `;
  }

  private renderPageInput() {
    return html`
      <div class="page-input-container" part="page-input">
        <label>Go to page:</label>
        <input
          type="number"
          min="1"
          max=${this.totalPages}
          .value=${String(this.currentPage)}
          @change=${this.handlePageInput}
        />
        <span>of ${this.totalPages}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'grid-pagination': GridPagination;
  }
}
