import { fixture, html, expect, nextFrame } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import '../src/index.js';

describe('LitGrid - Scroll Event', () => {
    it('should handle scroll events after data update', async () => {
        // 1. Render with empty data
        const el = await fixture<LitGrid>(html`<lit-grid></lit-grid>`);
        await el.updateComplete;

        // 2. Update data to trigger re-render of viewport
        el.data = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
        el.columnDefs = [{ field: 'name', headerName: 'Name' }];
        await el.updateComplete;
        await nextFrame();

        // 3. Get viewport and scroll it
        const viewport = el.shadowRoot!.querySelector('.grid-viewport') as HTMLElement;
        expect(viewport).to.exist;

        // Mock scroll
        viewport.scrollTop = 500;
        viewport.dispatchEvent(new Event('scroll'));

        await el.updateComplete;
        await nextFrame();

        // 4. Check if rendered rows updated
        // If scroll is handled, we should see rows around index 12 (500/40)
        // If not handled, we still see rows around index 0

        const rows = el.shadowRoot!.querySelectorAll('.grid-row');
        const firstRow = rows[0] as HTMLElement;

        // The first rendered row should NOT be index 0 if virtual scroll worked
        // Index is stored in data-row-index attribute
        const firstRowIndex = firstRow.getAttribute('data-row-index');

        // If scrollTop is 500, start index should be around 12 (minus buffer 5 = 7)
        // If it's 0, it will be 0.
        expect(Number(firstRowIndex)).to.be.greaterThan(0);
    });
});
