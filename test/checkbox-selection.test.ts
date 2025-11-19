import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import '../src/index.js';

describe('LitGrid - Checkbox Selection', () => {
  it('should render checkboxes when selectionMode is multiple', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
        .data=${[{ id: 1, name: 'Item 1' }]}
        .enableSelection=${true}
        .selectionMode=${'multiple'}
      ></lit-grid>
    `);

    await el.updateComplete;

    const headerCheckbox = el.shadowRoot!.querySelector('.header-cell.checkbox-cell input[type="checkbox"]');
    const rowCheckbox = el.shadowRoot!.querySelector('.grid-cell.checkbox-cell input[type="checkbox"]');

    expect(headerCheckbox).to.exist;
    expect(rowCheckbox).to.exist;
  });

  it('should not render checkboxes when selectionMode is single', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
        .data=${[{ id: 1, name: 'Item 1' }]}
        .enableSelection=${true}
        .selectionMode=${'single'}
      ></lit-grid>
    `);

    await el.updateComplete;

    const headerCheckbox = el.shadowRoot!.querySelector('.header-cell.checkbox-cell');
    expect(headerCheckbox).to.not.exist;
  });

  it('should select all rows when header checkbox is clicked', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
        .data=${[{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]}
        .enableSelection=${true}
        .selectionMode=${'multiple'}
      ></lit-grid>
    `);

    await el.updateComplete;

    const headerCheckbox = el.shadowRoot!.querySelector('.header-cell.checkbox-cell input[type="checkbox"]') as HTMLInputElement;

    // Click select all
    headerCheckbox.click();

    await el.updateComplete;

    const selectedRows = el.getSelectedRows();
    expect(selectedRows.length).to.equal(2);
  });

  it('should toggle row selection when row checkbox is clicked', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
        .data=${[{ id: 1, name: 'Item 1' }]}
        .enableSelection=${true}
        .selectionMode=${'multiple'}
      ></lit-grid>
    `);

    await el.updateComplete;

    const rowCheckbox = el.shadowRoot!.querySelector('.grid-cell.checkbox-cell input[type="checkbox"]') as HTMLInputElement;

    // Select row
    rowCheckbox.click();
    await el.updateComplete;
    expect(el.getSelectedRows().length).to.equal(1);

    // Deselect row
    rowCheckbox.click();
    await el.updateComplete;
    expect(el.getSelectedRows().length).to.equal(0);
  });
});
