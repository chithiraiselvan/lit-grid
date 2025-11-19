import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import '../src/index.js';

describe('LitGrid - Column Resizing', () => {
  it('should render resize handles when enabled', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name', width: 100 }]}
        .enableColumnResize=${true}
        .enableSelection=${false}
      ></lit-grid>
    `);

    await el.updateComplete;

    const handle = el.shadowRoot!.querySelector('.resize-handle');
    expect(handle).to.exist;
  });

  it('should not render resize handles when disabled', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name', width: 100 }]}
        .enableColumnResize=${false}
      ></lit-grid>
    `);

    await el.updateComplete;

    const handle = el.shadowRoot!.querySelector('.resize-handle');
    expect(handle).to.not.exist;
  });

  it('should resize column on drag', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name', width: 100 }]}
      ></lit-grid>
    `);

    await el.updateComplete;

    const handle = el.shadowRoot!.querySelector('.resize-handle') as HTMLElement;

    // Simulate drag
    const startEvent = new MouseEvent('mousedown', {
      clientX: 100,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    handle.dispatchEvent(startEvent);

    const moveEvent = new MouseEvent('mousemove', {
      clientX: 150, // +50px
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(moveEvent);

    const endEvent = new MouseEvent('mouseup', {
      bubbles: true,
      composed: true
    });
    document.dispatchEvent(endEvent);

    await el.updateComplete;

    // Check new width in column state
    // We need to access the internal state or check the rendered style
    const headerCell = el.shadowRoot!.querySelector('.header-cell') as HTMLElement;
    expect(headerCell.style.width).to.equal('150px');
  });

  it('should emit column-resized event', async () => {
    const el = await fixture<LitGrid>(html`
      <lit-grid
        .columnDefs=${[{ field: 'name', headerName: 'Name', width: 100 }]}
      ></lit-grid>
    `);

    await el.updateComplete;

    const handle = el.shadowRoot!.querySelector('.resize-handle') as HTMLElement;

    // Listen for event
    const listener = oneEvent(el, 'column-resized');

    // Simulate drag
    handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, bubbles: true, composed: true }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, bubbles: true, composed: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));

    const { detail } = await listener;
    expect(detail.field).to.equal('name');
    expect(detail.width).to.equal(150);
  });
});
