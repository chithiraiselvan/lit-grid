import {
  RowData,
  GroupRow,
  GridRow,
  GroupConfig,
  ColumnDef,
  ColumnAggregation
} from '../types/index.js';

export class GroupingController {
  private expandedGroups: Set<string> = new Set();

  /**
   * Apply grouping to data
   */
  applyGrouping(
    data: RowData[],
    groupConfigs: GroupConfig[],
    columnDefs: ColumnDef[],
    aggregations?: ColumnAggregation[]
  ): GridRow[] {
    if (groupConfigs.length === 0) {
      return data;
    }

    return this.groupData(data, groupConfigs, 0, columnDefs, aggregations);
  }

  /**
   * Recursively group data by multiple fields
   */
  private groupData(
    data: RowData[],
    groupConfigs: GroupConfig[],
    level: number,
    columnDefs: ColumnDef[],
    aggregations?: ColumnAggregation[]
  ): GridRow[] {
    if (level >= groupConfigs.length) {
      return data;
    }

    const config = groupConfigs[level];
    const column = columnDefs.find(col => col.field === config.field);

    // Group data by the current field
    const groups = new Map<any, RowData[]>();

    for (const row of data) {
      const value = this.getGroupValue(row, column);
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(row);
    }

    // Convert groups to GridRow array
    const result: GridRow[] = [];

    // Sort groups if comparator provided
    const sortedKeys = Array.from(groups.keys());
    if (config.comparator) {
      sortedKeys.sort(config.comparator);
    } else {
      sortedKeys.sort((a, b) => {
        if (a === b) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return a < b ? -1 : 1;
      });
    }

    for (const groupValue of sortedKeys) {
      const children = groups.get(groupValue)!;
      const groupKey = this.createGroupKey(config.field, groupValue, level);

      // Calculate aggregations for this group
      const groupAggregations = this.calculateAggregations(children, aggregations);

      const groupRow: GroupRow = {
        isGroup: true,
        groupKey,
        groupValue,
        groupField: config.field,
        children: level < groupConfigs.length - 1
          ? this.groupData(children, groupConfigs, level + 1, columnDefs, aggregations) as RowData[]
          : children,
        expanded: this.expandedGroups.has(groupKey),
        level,
        aggregations: groupAggregations
      };

      result.push(groupRow);

      // Add children if expanded
      if (groupRow.expanded) {
        if (level < groupConfigs.length - 1) {
          // More levels to group
          const childGroups = this.groupData(children, groupConfigs, level + 1, columnDefs, aggregations);
          result.push(...childGroups);
        } else {
          // Leaf level - add actual data rows
          result.push(...children);
        }
      }
    }

    return result;
  }

  /**
   * Get value for grouping from row
   */
  private getGroupValue(row: RowData, column?: ColumnDef): any {
    if (!column) return null;
    if (column.valueGetter) {
      return column.valueGetter(row);
    }
    return row[column.field];
  }

  /**
   * Create unique group key
   */
  private createGroupKey(field: string, value: any, level: number): string {
    return `group_${level}_${field}_${String(value)}`;
  }

  /**
   * Calculate aggregations for a group
   */
  private calculateAggregations(
    rows: RowData[],
    aggregations?: ColumnAggregation[]
  ): Record<string, any> {
    if (!aggregations || aggregations.length === 0) {
      return { count: rows.length };
    }

    const result: Record<string, any> = { count: rows.length };

    for (const agg of aggregations) {
      const values = rows.map(row => row[agg.field]).filter(v => v != null);

      if (values.length === 0) {
        result[agg.field] = null;
        continue;
      }

      switch (agg.func) {
        case 'sum':
          result[agg.field] = values.reduce((sum, val) => sum + Number(val), 0);
          break;

        case 'avg':
          result[agg.field] = values.reduce((sum, val) => sum + Number(val), 0) / values.length;
          break;

        case 'min':
          result[agg.field] = Math.min(...values.map(Number));
          break;

        case 'max':
          result[agg.field] = Math.max(...values.map(Number));
          break;

        case 'count':
          result[agg.field] = values.length;
          break;

        case 'first':
          result[agg.field] = values[0];
          break;

        case 'last':
          result[agg.field] = values[values.length - 1];
          break;
      }
    }

    return result;
  }

  /**
   * Toggle group expansion
   */
  toggleGroup(groupKey: string): boolean {
    if (this.expandedGroups.has(groupKey)) {
      this.expandedGroups.delete(groupKey);
      return false;
    } else {
      this.expandedGroups.add(groupKey);
      return true;
    }
  }

  /**
   * Expand all groups
   */
  expandAll(rows: GridRow[]): void {
    this.expandedGroups.clear();
    this.collectGroupKeys(rows).forEach(key => this.expandedGroups.add(key));
  }

  /**
   * Collapse all groups
   */
  collapseAll(): void {
    this.expandedGroups.clear();
  }

  /**
   * Check if group is expanded
   */
  isGroupExpanded(groupKey: string): boolean {
    return this.expandedGroups.has(groupKey);
  }

  /**
   * Collect all group keys from rows
   */
  private collectGroupKeys(rows: GridRow[]): string[] {
    const keys: string[] = [];

    for (const row of rows) {
      if (this.isGroupRow(row)) {
        keys.push(row.groupKey);
        if (row.children) {
          keys.push(...this.collectGroupKeys(row.children as GridRow[]));
        }
      }
    }

    return keys;
  }

  /**
   * Type guard for group rows
   */
  isGroupRow(row: GridRow): row is GroupRow {
    return (row as GroupRow).isGroup === true;
  }

  /**
   * Get total row count including nested groups
   */
  getTotalRowCount(rows: GridRow[]): number {
    let count = 0;

    for (const row of rows) {
      count++;
      if (this.isGroupRow(row) && row.expanded && row.children) {
        count += this.getTotalRowCount(row.children as GridRow[]);
      }
    }

    return count;
  }

  /**
   * Flatten grouped data to visible rows only
   */
  flattenVisibleRows(rows: GridRow[]): GridRow[] {
    const result: GridRow[] = [];

    for (const row of rows) {
      result.push(row);

      if (this.isGroupRow(row) && row.expanded && row.children) {
        result.push(...this.flattenVisibleRows(row.children as GridRow[]));
      }
    }

    return result;
  }
}
