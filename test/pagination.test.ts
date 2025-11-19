import { fixture, html, expect } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import { GridPagination } from '../src/components/grid-pagination.js';
import '../src/index.js';

describe('Pagination', () => {
  describe('GridPagination Component', () => {
    it('should render pagination controls', async () => {
      const el = await fixture<GridPagination>(html`
        <grid-pagination
          .currentPage=${1}
          .pageSize=${25}
          .totalRows=${100}
        ></grid-pagination>
      `);

      expect(el).to.exist;
      const buttons = el.shadowRoot!.querySelectorAll('button');
      expect(buttons.length).to.be.greaterThan(0);
    });

    it('should calculate total pages correctly', async () => {
      const el = await fixture<GridPagination>(html`
        <grid-pagination
          .currentPage=${1}
          .pageSize=${25}
          .totalRows=${100}
        ></grid-pagination>
      `);

      await el.updateComplete;

      // 100 rows / 25 per page = 4 pages
      const pageButtons = el.shadowRoot!.querySelectorAll('button');
      const pageNumberButtons = Array.from(pageButtons).filter(btn =>
        !btn.textContent?.includes('⟪') &&
        !btn.textContent?.includes('⟫') &&
        !btn.textContent?.includes('‹') &&
        !btn.textContent?.includes('›')
      );

      // Should have buttons for pages 1, 2, 3, 4
      expect(pageNumberButtons.length).to.be.at.least(4);
    });

    it('should show correct row range', async () => {
      const el = await fixture<GridPagination>(html`
        <grid-pagination
          .currentPage=${2}
          .pageSize=${25}
          .totalRows=${100}
        ></grid-pagination>
      `);

      await el.updateComplete;

      const info = el.shadowRoot!.querySelector('.pagination-info');
      expect(info?.textContent).to.include('26'); // Start of page 2
      expect(info?.textContent).to.include('50'); // End of page 2
      expect(info?.textContent).to.include('100'); // Total
    });

    it('should emit page-changed event when page changes', async () => {
      const el = await fixture<GridPagination>(html`
        <grid-pagination
          .currentPage=${1}
          .pageSize=${25}
          .totalRows=${100}
        ></grid-pagination>
      `);

      await el.updateComplete;

      let eventFired = false;
      let eventDetail: any;

      el.addEventListener('page-changed', (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      // Click next button
      const nextButton = Array.from(el.shadowRoot!.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('›')
      );
      nextButton?.click();

      expect(eventFired).to.be.true;
      expect(eventDetail.currentPage).to.equal(2);
    });

    it('should disable navigation when on first/last page', async () => {
      const el = await fixture<GridPagination>(html`
        <grid-pagination
          .currentPage=${1}
          .pageSize=${25}
          .totalRows=${100}
        ></grid-pagination>
      `);

      await el.updateComplete;

      const firstButton = Array.from(el.shadowRoot!.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('⟪')
      ) as HTMLButtonElement;

      const prevButton = Array.from(el.shadowRoot!.querySelectorAll('button')).find(
        btn => btn.textContent?.includes('‹') && !btn.textContent?.includes('⟪')
      ) as HTMLButtonElement;

      expect(firstButton.disabled).to.be.true;
      expect(prevButton.disabled).to.be.true;
    });
  });

  describe('Grid with Pagination', () => {
    it('should paginate data correctly', async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Name ${i + 1}`,
      }));

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[
            { field: 'id', headerName: 'ID' },
            { field: 'name', headerName: 'Name' },
          ]}
          .enablePagination=${true}
          .enableVirtualScroll=${false}
          .pageSize=${10}
        ></lit-grid>
      `);

      await el.updateComplete;

      // Should only render 10 rows (first page)
      const rows = el.shadowRoot!.querySelectorAll('.grid-row');
      expect(rows.length).to.equal(10);
    });

    it('should render pagination component when enabled', async () => {
      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${[{ id: 1, name: 'Test' }]}
          .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
          .enablePagination=${true}
        ></lit-grid>
      `);

      await el.updateComplete;

      const pagination = el.shadowRoot!.querySelector('grid-pagination');
      expect(pagination).to.exist;
    });

    it('should update displayed data when page changes', async () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Name ${i + 1}`,
      }));

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[
            { field: 'id', headerName: 'ID' },
            { field: 'name', headerName: 'Name' },
          ]}
          .enablePagination=${true}
          .enableVirtualScroll=${false}
          .pageSize=${10}
        ></lit-grid>
      `);

      await el.updateComplete;

      // Check first page
      let firstCell = el.shadowRoot!.querySelector('.grid-cell[data-field="id"]');
      expect(firstCell?.textContent).to.include('1');

      // Simulate page change
      const pagination = el.shadowRoot!.querySelector('grid-pagination');
      pagination?.dispatchEvent(
        new CustomEvent('page-changed', {
          detail: { currentPage: 2, pageSize: 10 },
          bubbles: true,
        })
      );

      await el.updateComplete;

      // Should now show page 2 (rows 11-20)
      firstCell = el.shadowRoot!.querySelector('.grid-cell[data-field="id"]');
      expect(firstCell?.textContent).to.include('11');
    });

    it('should work with virtual scrolling enabled', async () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Name ${i + 1}`,
      }));

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[{ field: 'id', headerName: 'ID' }]}
          .enablePagination=${true}
          .enableVirtualScroll=${true}
          .pageSize=${50}
        ></lit-grid>
      `);

      await el.updateComplete;

      // Should have correct virtual scroll height for 50 rows (pageSize)
      const gridBody = el.shadowRoot!.querySelector('.grid-body') as HTMLElement;
      expect(gridBody).to.exist;
      // 50 rows * 40px (default rowHeight) = 2000px
      expect(gridBody.style.height).to.equal('2000px');
    });
  });
});
