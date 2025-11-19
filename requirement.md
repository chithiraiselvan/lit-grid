Role: You are an expert software architect and senior technical writer specializing in high-performance, scalable web components using Lit.

Objective: Generate a comprehensive development plan, technical specification, and documentation strategy for building a new, feature-complete data grid component using Lit 3.0. This component (let's call it lit-grid) should aim to be a modern, lightweight, and extensible alternative to existing solutions like ag-grid.

Key Requirements:

Your response must be detailed and structured into the following sections:

1. Core Architecture (Lit 3.0 Implementation)

Component Structure: Define the primary components (e.g., <lit-grid>, <grid-column>). How should they interact? How will column definitions be passed (e.g., via slotted children, or a columns property)?

Reactivity: Explain how Lit's reactive properties (@property) and state (@state) will be used to manage grid data, column state (visibility, order, width), and UI state (sort direction, filter values).

Performance: Detail the strategy for handling large datasets. This must include a plan for DOM virtualization (virtual scrolling) for both rows and columns.

Data Handling: Describe the approach for both client-side and server-side data operations (sorting, filtering, pagination).

2. Feature Set (Parity with ag-grid)
Provide a development plan for implementing the following essential grid features. For each feature, briefly describe the proposed API and implementation concept:

Sorting: Client-side (single and multi-column) and server-side.

Filtering: Basic text filtering, per-column filters (text, number, date), and a mechanism for custom filter components.

Pagination: Client-side and server-side, including page size options.

Row & Cell Selection: Single row, multi-row (with mouse and keyboard), and cell range selection.

In-Cell Editing: Built-in editors for common types (text, number, boolean) and an API to provide custom Lit components as editors.

Column Manipulation: Column resizing, column reordering (drag-and-drop), and showing/hiding columns.

Row Grouping: (If feasible in a core version) Basic row grouping with aggregate data.

Custom Rendering: A clear API for providing custom Lit templates or components for cell rendering (e.g., for badges, buttons, or custom data formats).

3. Theming and Styling Strategy

CSS Custom Properties: Define a robust theming API based entirely on CSS Custom Properties. All colors, fonts, spacing, and borders should be customizable.

Theme Options: Provide the complete CSS variable list for at least two built-in themes: a "light" (default) theme and a "dark" theme.

Part API: Explain how Lit's part attribute will be used to allow users to target and style specific internal elements of the grid components (e.g., part="header-cell", part="row-even").

4. Documentation and Showcase

API Reference: Generate a sample of the API documentation for the <lit-pro-grid> component, detailing its key properties (e.g., data, columnDefs), methods (e.g., getSelectedRows()), and events (e.g., cell-clicked, sort-changed).

"How-to" Guides: Write a "Getting Started" guide showing how to install and display a simple grid.

Showcase Examples: Provide code for at least three self-contained showcase components demonstrating:

A basic grid with data.

A grid with sorting, filtering, and pagination enabled.

A grid demonstrating custom cell renderers and in-cell editing.

Advantages: Write a short section explaining the "Why lit-pro-grid?" advantages, focusing on bundle size, performance (Lit's fast rendering), and ease of integration into any framework.

5. Testing Strategy

Unit & Integration Tests: Describe a comprehensive testing plan using a modern framework (e.g., Web Test Runner, Playwright).

Sample Test Cases: Provide example test cases (in pseudocode or actual test code) for the following functionalities:

Verifying the grid renders the correct number of rows.

Simulating a column header click and asserting that the data is sorted correctly.

Testing the in-cell editing workflow (double-click, edit, press Enter, verify data change).

Testing the theme: verifying that changing a CSS Custom Property correctly updates the grid's appearance.