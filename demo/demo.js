import { html } from 'lit';
import '../src/index.js';

// Sample data generators
function generatePerson(id) {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses = ['active', 'inactive', 'pending'];

  return {
    id: id,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `user${id}@example.com`,
    age: Math.floor(Math.random() * 40) + 20,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
  };
}

function generateData(count) {
  return Array.from({ length: count }, (_, i) => generatePerson(i + 1));
}

// Basic column definitions
const basicColumns = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'firstName', headerName: 'First Name', width: 150 },
  { field: 'lastName', headerName: 'Last Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'age', headerName: 'Age', width: 80, type: 'number' }
];

// Columns with custom renderers
const customColumns = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'firstName', headerName: 'First Name', width: 150 },
  { field: 'lastName', headerName: 'Last Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    cellRenderer: (params) => {
      const badgeClass = params.value;
      return html`<span class="badge ${badgeClass}">${params.value}</span>`;
    }
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 120,
    type: 'number',
    cellRenderer: (params) => {
      return html`$${params.value.toLocaleString()}`;
    }
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    sortable: false,
    cellRenderer: (params) => {
      return html`
        <button @click=${(e) => handleEdit(e, params.data)} style="margin-right: 5px; padding: 4px 8px; font-size: 12px;">
          Edit
        </button>
        <button @click=${(e) => handleDelete(e, params.data)} style="padding: 4px 8px; font-size: 12px; background: #f44336;">
          Delete
        </button>
      `;
    }
  }
];

function handleEdit(e, data) {
  e.stopPropagation();
  console.log('Edit:', data);
  alert(`Editing: ${data.firstName} ${data.lastName}`);
}

function handleDelete(e, data) {
  e.stopPropagation();
  console.log('Delete:', data);
  if (confirm(`Delete ${data.firstName} ${data.lastName}?`)) {
    alert('Deleted!');
  }
}

// Initialize grids
window.addEventListener('load', () => {
  // Demo 1: Basic Grid
  const basicGrid = document.getElementById('basicGrid');
  basicGrid.data = generateData(100);
  basicGrid.columnDefs = basicColumns;

  // Demo 2: Sorting & Selection Grid
  const sortingGrid = document.getElementById('sortingGrid');
  sortingGrid.data = generateData(500);
  sortingGrid.columnDefs = basicColumns;
  sortingGrid.enableSorting = true;
  sortingGrid.enableSelection = true;
  sortingGrid.selectionMode = 'multiple';

  // Selection event listener
  sortingGrid.addEventListener('selection-changed', (e) => {
    const count = e.detail.selectedRows.length;
    document.getElementById('selectionInfo').textContent = `Selected: ${count} rows`;
  });

  // Selection controls
  document.getElementById('selectAllBtn').addEventListener('click', () => {
    sortingGrid.selectAll();
  });

  document.getElementById('clearSelectionBtn').addEventListener('click', () => {
    sortingGrid.clearSelection();
  });

  document.getElementById('getSelectedBtn').addEventListener('click', () => {
    const selected = sortingGrid.getSelectedRows();
    console.log('Selected rows:', selected);
    alert(`Selected ${selected.length} rows. Check console for details.`);
  });

  // Demo 3: Custom Renderers
  const customGrid = document.getElementById('customGrid');
  customGrid.data = generateData(200);
  customGrid.columnDefs = customColumns;

  // Demo 4: Virtual Scrolling
  const virtualGrid = document.getElementById('virtualGrid');
  virtualGrid.columnDefs = basicColumns;
  virtualGrid.enableVirtualScroll = true;

  function loadVirtualData(count) {
    const startTime = performance.now();
    virtualGrid.data = generateData(count);
    const endTime = performance.now();
    const renderTime = Math.round(endTime - startTime);
    document.getElementById('virtualInfo').textContent =
      `Rows: ${count.toLocaleString()} | Render time: ${renderTime}ms`;
  }

  document.getElementById('load1kBtn').addEventListener('click', () => loadVirtualData(1000));
  document.getElementById('load10kBtn').addEventListener('click', () => loadVirtualData(10000));
  document.getElementById('load50kBtn').addEventListener('click', () => loadVirtualData(50000));

  // Load initial data
  loadVirtualData(1000);

  // Demo 5: Theme Grid
  const themeGrid = document.getElementById('themeGrid');
  themeGrid.data = generateData(100);
  themeGrid.columnDefs = customColumns;

  document.getElementById('lightThemeBtn').addEventListener('click', () => {
    themeGrid.theme = 'light';
  });

  document.getElementById('darkThemeBtn').addEventListener('click', () => {
    themeGrid.theme = 'dark';
  });

  document.getElementById('compactThemeBtn').addEventListener('click', () => {
    themeGrid.theme = 'compact';
  });

  // Log events for debugging
  document.querySelectorAll('lit-grid').forEach(grid => {
    grid.addEventListener('sort-changed', (e) => {
      console.log('Sort changed:', e.detail);
    });

    grid.addEventListener('cell-clicked', (e) => {
      console.log('Cell clicked:', e.detail);
    });
  });
});
