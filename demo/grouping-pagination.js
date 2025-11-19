import '../src/index.js';

// Sample data generator
function generateEmployee(id) {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses = ['Active', 'Inactive', 'On Leave'];
  const locations = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin'];

  const dept = departments[Math.floor(Math.random() * departments.length)];
  let salary = Math.floor(Math.random() * 100000) + 40000;

  // Make engineering salaries higher on average
  if (dept === 'Engineering') {
    salary += 20000;
  }

  return {
    id: id,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `user${id}@company.com`,
    age: Math.floor(Math.random() * 40) + 22,
    department: dept,
    salary: salary,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    hireDate: new Date(2015 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
  };
}

function generateEmployees(count) {
  return Array.from({ length: count }, (_, i) => generateEmployee(i + 1));
}

// Column definitions
const employeeColumns = [
  { field: 'id', headerName: 'ID', width: 80, type: 'number' },
  { field: 'firstName', headerName: 'First Name', width: 130 },
  { field: 'lastName', headerName: 'Last Name', width: 130 },
  { field: 'email', headerName: 'Email', width: 220 },
  { field: 'department', headerName: 'Department', width: 130 },
  { field: 'status', headerName: 'Status', width: 110 },
  { field: 'salary', headerName: 'Salary', width: 120, type: 'number' },
  { field: 'age', headerName: 'Age', width: 80, type: 'number' },
  { field: 'location', headerName: 'Location', width: 130 }
];

window.addEventListener('load', () => {
  // Demo 1: Basic Pagination
  const paginationGrid = document.getElementById('paginationGrid');
  paginationGrid.data = generateEmployees(500);
  paginationGrid.columnDefs = employeeColumns;
  paginationGrid.enablePagination = true;
  paginationGrid.enableSorting = true;
  paginationGrid.pageSize = 25;
  paginationGrid.pageSizeOptions = [10, 25, 50, 100];

  paginationGrid.addEventListener('page-changed', (e) => {
    console.log('Page changed:', e.detail);
  });

  // Demo 2: Row Grouping with Aggregations
  const groupingGrid = document.getElementById('groupingGrid');
  groupingGrid.data = generateEmployees(200);
  groupingGrid.columnDefs = employeeColumns;
  groupingGrid.enableGrouping = true;
  groupingGrid.enableSorting = true;

  // Define aggregations
  groupingGrid.aggregations = [
    { field: 'salary', func: 'avg' },
    { field: 'salary', func: 'sum' },
    { field: 'age', func: 'avg' }
  ];

  // Grouping controls
  document.getElementById('expandAllBtn').addEventListener('click', () => {
    groupingGrid.expandAllGroups();
  });

  document.getElementById('collapseAllBtn').addEventListener('click', () => {
    groupingGrid.collapseAllGroups();
  });

  document.getElementById('groupByDeptBtn').addEventListener('click', () => {
    groupingGrid.groupBy = [
      { field: 'department' }
    ];
  });

  document.getElementById('groupByStatusBtn').addEventListener('click', () => {
    groupingGrid.groupBy = [
      { field: 'status' }
    ];
  });

  document.getElementById('clearGroupBtn').addEventListener('click', () => {
    groupingGrid.groupBy = [];
  });

  groupingGrid.addEventListener('group-expanded', (e) => {
    console.log('Group expanded:', e.detail);
  });

  // Demo 3: Multi-level Grouping
  const multiGroupGrid = document.getElementById('multiGroupGrid');
  multiGroupGrid.data = generateEmployees(300);
  multiGroupGrid.columnDefs = employeeColumns;
  multiGroupGrid.enableGrouping = true;
  multiGroupGrid.enableSorting = true;
  multiGroupGrid.aggregations = [
    { field: 'salary', func: 'avg' },
    { field: 'salary', func: 'sum' }
  ];

  document.getElementById('multiGroupBtn').addEventListener('click', () => {
    multiGroupGrid.groupBy = [
      { field: 'department' },
      { field: 'status' }
    ];
    // Expand first level by default
    setTimeout(() => {
      multiGroupGrid.expandAllGroups();
    }, 100);
  });

  document.getElementById('clearMultiGroupBtn').addEventListener('click', () => {
    multiGroupGrid.groupBy = [];
  });

  // Demo 4: Combined Pagination + Grouping
  const combinedGrid = document.getElementById('combinedGrid');
  const combinedData = generateEmployees(1000);
  combinedGrid.data = combinedData;
  combinedGrid.columnDefs = employeeColumns;
  combinedGrid.enablePagination = true;
  combinedGrid.enableGrouping = true;
  combinedGrid.enableSorting = true;
  combinedGrid.pageSize = 50;
  combinedGrid.pageSizeOptions = [25, 50, 100, 200];
  combinedGrid.aggregations = [
    { field: 'salary', func: 'avg' },
    { field: 'salary', func: 'sum' },
    { field: 'age', func: 'avg' }
  ];

  document.getElementById('combinedInfo').textContent =
    `Total rows: ${combinedData.length.toLocaleString()}`;

  document.getElementById('combinedGroupBtn').addEventListener('click', () => {
    combinedGrid.groupBy = [
      { field: 'department' }
    ];
    setTimeout(() => {
      combinedGrid.expandAllGroups();
    }, 100);
  });

  document.getElementById('combinedClearBtn').addEventListener('click', () => {
    combinedGrid.groupBy = [];
  });

  combinedGrid.addEventListener('page-changed', (e) => {
    console.log('Combined grid - page changed:', e.detail);
  });

  // Log all group expansion events
  document.querySelectorAll('lit-grid').forEach(grid => {
    grid.addEventListener('group-expanded', (e) => {
      console.log(`Group ${e.detail.expanded ? 'expanded' : 'collapsed'}:`, e.detail.groupKey);
    });
  });
});
