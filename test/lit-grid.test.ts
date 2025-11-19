import { fixture, html, expect } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import '../src/index.js';

describe('LitGrid - Core Functionality', () => {
  it('should render with default properties', async () => {
    const el = await fixture<LitGrid>(html`<lit-grid></lit-grid>`);

    expect(el).to.exist;
    expect(el.data).to.deep.equal([]);
    expect(el.columnDefs).to.deep.equal([]);
    expect(el.enableSorting).to.be.true;
    expect(el.enablePagination).to.be.false;
    expect(el.enableGrouping).to.be.false;
  });

  it('should display data when provided', async () => {
    const testData = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
    ];

    const testColumns = [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'age', headerName: 'Age', width: 80 },
    ];

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${testColumns}
      ></lit-grid>
    `);

    await el.updateComplete;

    const rows = el.shadowRoot!.querySelectorAll('.grid-row');
    expect(rows.length).to.equal(2);
  });

  it('should show empty state when no data', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid .columnDefs=${[{ field: 'id', headerName: 'ID' }]}></lit-grid>
    `);

    await el.updateComplete;

    const emptyState = el.shadowRoot!.querySelector('.empty-state');
    expect(emptyState).to.exist;
    expect(emptyState!.textContent).to.include('No data');
  });

  it('should render correct number of columns', async () => {
    const testColumns = [
      { field: 'id', headerName: 'ID' },
      { field: 'name', headerName: 'Name' },
      { field: 'email', headerName: 'Email' },
    ];

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${[{ id: 1, name: 'Test', email: 'test@example.com' }]}
        .columnDefs=${testColumns}
      ></lit-grid>
    `);

    await el.updateComplete;

    const headerCells = el.shadowRoot!.querySelectorAll('.header-cell');
    expect(headerCells.length).to.equal(3);
  });
});

describe('LitGrid - Virtual Scrolling', () => {
  it('should enable virtual scrolling by default', async () => {
    const el = await fixture<LitGrid>(html`<lit-grid></lit-grid>`);
    expect(el.enableVirtualScroll).to.be.true;
  });

  it('should handle large datasets without rendering all rows', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `Name ${i + 1}`,
    }));

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${largeData}
        .columnDefs=${[
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Name' },
      ]}
      ></lit-grid>
    `);

    await el.updateComplete;

    const rows = el.shadowRoot!.querySelectorAll('.grid-row');
    // Should render only visible rows, not all 1000
    expect(rows.length).to.be.lessThan(100);
  });

  it('should set correct total height for virtual scroll', async () => {
    const testData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Name ${i + 1}`,
    }));

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${[{ field: 'id', headerName: 'ID' }]}
        .rowHeight=${40}
      ></lit-grid>
    `);

    await el.updateComplete;

    const gridBody = el.shadowRoot!.querySelector('.grid-body') as HTMLElement;
    expect(gridBody).to.exist;
    // Total height should be rowCount * rowHeight = 100 * 40 = 4000px
    expect(gridBody.style.height).to.equal('4000px');
  });
});

describe('LitGrid - Selection', () => {
  it('should allow single row selection', async () => {
    const testData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
        .selectionMode=${'single'}
      ></lit-grid>
    `);

    await el.updateComplete;

    const firstRow = el.shadowRoot!.querySelector('.grid-row') as HTMLElement;
    firstRow.click();

    await el.updateComplete;

    const selectedRows = el.getSelectedRows();
    expect(selectedRows.length).to.equal(1);
    expect(selectedRows[0].name).to.equal('John');
  });

  it('should support selectAll method', async () => {
    const testData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
      { id: 3, name: 'Bob' },
    ];

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
      ></lit-grid>
    `);

    await el.updateComplete;

    el.selectAll();
    await el.updateComplete;

    const selectedRows = el.getSelectedRows();
    expect(selectedRows.length).to.equal(3);
  });

  it('should support clearSelection method', async () => {
    const testData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];

    const el = await fixture<LitGrid>(html`
      <lit-grid
        .data=${testData}
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
      ></lit-grid>
    `);

    await el.updateComplete;

    el.selectAll();
    await el.updateComplete;
    expect(el.getSelectedRows().length).to.equal(2);

    el.clearSelection();
    await el.updateComplete;
    expect(el.getSelectedRows().length).to.equal(0);
  });
});

describe('LitGrid - Theming', () => {
  it('should apply light theme by default', async () => {
    const el = await fixture<LitGrid>(html`<lit-grid></lit-grid>`);
    expect(el.theme).to.equal('light');
  });

  it('should apply dark theme when specified', async () => {
    const el = await fixture<LitGrid>(html`<lit-grid theme="dark"></lit-grid>`);
    expect(el.theme).to.equal('dark');
    expect(el.getAttribute('theme')).to.equal('dark');
  });

  it('should apply compact theme when specified', async () => {
    const el = await fixture<LitGrid>(html`<lit-grid theme="compact"></lit-grid>`);
    expect(el.theme).to.equal('compact');
  });
});
