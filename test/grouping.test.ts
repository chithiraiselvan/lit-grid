import { fixture, html, expect } from '@open-wc/testing';
import { LitGrid } from '../src/components/lit-grid.js';
import { GroupingController } from '../src/controllers/GroupingController.js';
import '../src/index.js';

describe('Grouping', () => {
  describe('GroupingController', () => {
    it('should create groups by field', () => {
      const controller = new GroupingController();
      const testData = [
        { id: 1, department: 'Engineering', salary: 100000 },
        { id: 2, department: 'Engineering', salary: 110000 },
        { id: 3, department: 'Sales', salary: 80000 },
      ];

      const columnDefs = [
        { field: 'id', headerName: 'ID' },
        { field: 'department', headerName: 'Department' },
        { field: 'salary', headerName: 'Salary' },
      ];

      const grouped = controller.applyGrouping(
        testData,
        [{ field: 'department' }],
        columnDefs
      );

      // Should have 2 groups (Engineering and Sales)
      const groups = grouped.filter(row => controller.isGroupRow(row));
      expect(groups.length).to.equal(2);
    });

    it('should calculate aggregations correctly', () => {
      const controller = new GroupingController();
      const testData = [
        { id: 1, department: 'Engineering', salary: 100000 },
        { id: 2, department: 'Engineering', salary: 120000 },
      ];

      const columnDefs = [
        { field: 'department', headerName: 'Department' },
        { field: 'salary', headerName: 'Salary' },
      ];

      const grouped = controller.applyGrouping(
        testData,
        [{ field: 'department' }],
        columnDefs,
        [
          { field: 'salary', func: 'sum' },
          { field: 'salary', func: 'avg' },
        ]
      );

      const group = grouped.find(row => controller.isGroupRow(row)) as any;
      expect(group.aggregations.salary).to.equal(110000); // Average of 100000 and 120000
    });

    it('should support multi-level grouping', () => {
      const controller = new GroupingController();
      const testData = [
        { id: 1, department: 'Engineering', status: 'Active', salary: 100000 },
        { id: 2, department: 'Engineering', status: 'Inactive', salary: 110000 },
        { id: 3, department: 'Sales', status: 'Active', salary: 80000 },
      ];

      const columnDefs = [
        { field: 'department', headerName: 'Department' },
        { field: 'status', headerName: 'Status' },
        { field: 'salary', headerName: 'Salary' },
      ];

      const grouped = controller.applyGrouping(
        testData,
        [{ field: 'department' }, { field: 'status' }],
        columnDefs
      );

      // Should have department groups at level 0
      const topLevelGroups = grouped.filter(
        row => controller.isGroupRow(row) && (row as any).level === 0
      );
      expect(topLevelGroups.length).to.equal(2); // Engineering and Sales
    });

    it('should toggle group expansion', () => {
      const controller = new GroupingController();

      const expanded = controller.toggleGroup('group-1');
      expect(expanded).to.be.true;

      const collapsed = controller.toggleGroup('group-1');
      expect(collapsed).to.be.false;
    });

    it('should expand all groups', () => {
      const controller = new GroupingController();
      const testData = [
        { id: 1, department: 'Engineering' },
        { id: 2, department: 'Sales' },
      ];

      const columnDefs = [{ field: 'department', headerName: 'Department' }];

      const grouped = controller.applyGrouping(
        testData,
        [{ field: 'department' }],
        columnDefs
      );

      controller.expandAll(grouped);

      grouped.forEach(row => {
        if (controller.isGroupRow(row)) {
          expect(controller.isGroupExpanded((row as any).groupKey)).to.be.true;
        }
      });
    });

    it('should collapse all groups', () => {
      const controller = new GroupingController();

      controller.toggleGroup('group-1');
      controller.toggleGroup('group-2');

      controller.collapseAll();

      expect(controller.isGroupExpanded('group-1')).to.be.false;
      expect(controller.isGroupExpanded('group-2')).to.be.false;
    });

    it('should flatten visible rows correctly', () => {
      const controller = new GroupingController();
      const testData = [
        { id: 1, department: 'Engineering' },
        { id: 2, department: 'Engineering' },
        { id: 3, department: 'Sales' },
      ];

      const columnDefs = [{ field: 'department', headerName: 'Department' }];

      const grouped = controller.applyGrouping(
        testData,
        [{ field: 'department' }],
        columnDefs
      );

      // Without expansion, should only show group rows
      const flattened = controller.flattenVisibleRows(grouped);
      const dataRows = flattened.filter(row => !controller.isGroupRow(row));
      expect(dataRows.length).to.equal(0);

      // Expand all
      controller.expandAll(grouped);
      const groupedExpanded = controller.applyGrouping(
        testData,
        [{ field: 'department' }],
        columnDefs
      );
      const flattenedExpanded = controller.flattenVisibleRows(groupedExpanded);
      const dataRowsExpanded = flattenedExpanded.filter(row => !controller.isGroupRow(row));
      expect(dataRowsExpanded.length).to.equal(3);
    });
  });

  describe('Grid with Grouping', () => {
    it('should render group rows when grouping is enabled', async () => {
      const testData = [
        { id: 1, department: 'Engineering', name: 'John' },
        { id: 2, department: 'Engineering', name: 'Jane' },
        { id: 3, department: 'Sales', name: 'Bob' },
      ];

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[
            { field: 'id', headerName: 'ID' },
            { field: 'department', headerName: 'Department' },
            { field: 'name', headerName: 'Name' },
          ]}
          .enableGrouping=${true}
          .groupBy=${[{ field: 'department' }]}
        ></lit-grid>
      `);

      await el.updateComplete;

      const groupRows = el.shadowRoot!.querySelectorAll('.group-row');
      expect(groupRows.length).to.equal(2); // Engineering and Sales groups
    });

    it('should show aggregations in group rows', async () => {
      const testData = [
        { id: 1, department: 'Engineering', salary: 100000 },
        { id: 2, department: 'Engineering', salary: 120000 },
      ];

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[
            { field: 'department', headerName: 'Department' },
            { field: 'salary', headerName: 'Salary' },
          ]}
          .enableGrouping=${true}
          .groupBy=${[{ field: 'department' }]}
          .aggregations=${[{ field: 'salary', func: 'avg' }]}
        ></lit-grid>
      `);

      await el.updateComplete;

      const groupRow = el.shadowRoot!.querySelector('.group-row');
      expect(groupRow?.textContent).to.include('110000'); // Average
    });

    it('should expand/collapse groups on click', async () => {
      const testData = [
        { id: 1, department: 'Engineering', name: 'John' },
        { id: 2, department: 'Engineering', name: 'Jane' },
      ];

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
          .enableGrouping=${true}
          .groupBy=${[{ field: 'department' }]}
        ></lit-grid>
      `);

      await el.updateComplete;

      // Initially collapsed - should only see group row
      let allRows = el.shadowRoot!.querySelectorAll('.grid-row');
      let groupRows = el.shadowRoot!.querySelectorAll('.group-row');
      expect(groupRows.length).to.equal(1);
      expect(allRows.length).to.equal(1); // Only group row

      // Click to expand
      const groupRow = el.shadowRoot!.querySelector('.group-row') as HTMLElement;
      groupRow.click();

      await el.updateComplete;

      // Should now see group row + data rows
      allRows = el.shadowRoot!.querySelectorAll('.grid-row');
      expect(allRows.length).to.be.greaterThan(1);
    });

    it('should support expandAllGroups method', async () => {
      const testData = [
        { id: 1, department: 'Engineering', name: 'John' },
        { id: 2, department: 'Sales', name: 'Jane' },
      ];

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
          .enableGrouping=${true}
          .groupBy=${[{ field: 'department' }]}
        ></lit-grid>
      `);

      await el.updateComplete;

      el.expandAllGroups();
      await el.updateComplete;

      const expandIcons = el.shadowRoot!.querySelectorAll('.group-expand-icon.expanded');
      expect(expandIcons.length).to.be.greaterThan(0);
    });

    it('should support collapseAllGroups method', async () => {
      const testData = [
        { id: 1, department: 'Engineering', name: 'John' },
        { id: 2, department: 'Sales', name: 'Jane' },
      ];

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
          .enableGrouping=${true}
          .groupBy=${[{ field: 'department' }]}
        ></lit-grid>
      `);

      await el.updateComplete;

      el.expandAllGroups();
      await el.updateComplete;

      el.collapseAllGroups();
      await el.updateComplete;

      const expandIcons = el.shadowRoot!.querySelectorAll('.group-expand-icon.expanded');
      expect(expandIcons.length).to.equal(0);
    });
  });

  describe('Grouping with Pagination', () => {
    it('should work together with pagination', async () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        department: i < 50 ? 'Engineering' : 'Sales',
        name: `Name ${i + 1}`,
      }));

      const el = await fixture<LitGrid>(html`
        <lit-grid
          .data=${testData}
          .columnDefs=${[{ field: 'name', headerName: 'Name' }]}
          .enableGrouping=${true}
          .enablePagination=${true}
          .groupBy=${[{ field: 'department' }]}
          .pageSize=${50}
        ></lit-grid>
      `);

      await el.updateComplete;

      const pagination = el.shadowRoot!.querySelector('grid-pagination');
      expect(pagination).to.exist;

      const groupRows = el.shadowRoot!.querySelectorAll('.group-row');
      expect(groupRows.length).to.be.greaterThan(0);
    });
  });
});
