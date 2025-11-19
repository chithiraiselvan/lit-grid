import { ReactiveController, ReactiveControllerHost } from 'lit';
import { VirtualScrollState } from '../types/index.js';

export class VirtualScrollController implements ReactiveController {
  private host: ReactiveControllerHost;
  private state: VirtualScrollState;
  private bufferSize = 5; // Extra rows to render for smooth scrolling

  constructor(host: ReactiveControllerHost, rowHeight: number = 40) {
    this.host = host;
    this.state = {
      scrollTop: 0,
      scrollLeft: 0,
      viewportHeight: 600,
      viewportWidth: 800,
      rowHeight,
      startRow: 0,
      endRow: 0
    };
    host.addController(this);
  }

  hostConnected(): void {
    // Controller connected
  }

  hostDisconnected(): void {
    // Controller disconnected
  }

  /**
   * Update scroll position
   */
  updateScroll(scrollTop: number, scrollLeft: number): void {
    this.state.scrollTop = scrollTop;
    this.state.scrollLeft = scrollLeft;
    this.updateVisibleRange();
    this.host.requestUpdate();
  }

  /**
   * Update viewport dimensions
   */
  updateViewport(height: number, width: number): void {
    this.state.viewportHeight = height;
    this.state.viewportWidth = width;
    this.updateVisibleRange();
    this.host.requestUpdate();
  }

  /**
   * Update row height
   */
  updateRowHeight(rowHeight: number): void {
    this.state.rowHeight = rowHeight;
    this.updateVisibleRange();
    this.host.requestUpdate();
  }

  /**
   * Calculate visible range of rows
   */
  private updateVisibleRange(): void {
    const start = Math.floor(this.state.scrollTop / this.state.rowHeight);
    const visibleCount = Math.ceil(this.state.viewportHeight / this.state.rowHeight);

    this.state.startRow = Math.max(0, start - this.bufferSize);
    this.state.endRow = start + visibleCount + this.bufferSize;
  }

  /**
   * Get visible range
   */
  getVisibleRange(totalRows: number): { start: number; end: number } {
    return {
      start: this.state.startRow,
      end: Math.min(this.state.endRow, totalRows)
    };
  }

  /**
   * Get row style for absolute positioning
   */
  getRowStyle(index: number): string {
    const y = index * this.state.rowHeight;
    return `transform: translateY(${y}px); height: ${this.state.rowHeight}px;`;
  }

  /**
   * Get total content height
   */
  getTotalHeight(rowCount: number): number {
    return rowCount * this.state.rowHeight;
  }

  /**
   * Get current state
   */
  getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * Scroll to specific row
   */
  scrollToRow(rowIndex: number): number {
    return rowIndex * this.state.rowHeight;
  }

  /**
   * Get row index at scroll position
   */
  getRowIndexAtScroll(scrollTop: number): number {
    return Math.floor(scrollTop / this.state.rowHeight);
  }
}
