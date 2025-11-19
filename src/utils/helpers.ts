/**
 * Debounce function to delay execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get nested property value from an object using dot notation
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Set nested property value in an object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const props = path.split('.');
  const last = props.pop()!;
  const target = props.reduce((current, prop) => {
    if (!current[prop]) current[prop] = {};
    return current[prop];
  }, obj);
  target[last] = value;
}

/**
 * Clone an object deeply
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;

  const clonedObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * Check if value is empty (null, undefined, empty string)
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format date to locale string
 */
export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString();
}
