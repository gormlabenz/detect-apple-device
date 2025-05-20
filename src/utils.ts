import { DeviceMetrics } from './types';

/**
 * Safely gets current device metrics from browser environment
 * Falls back to null values when window is not available (server-side)
 */
export function getCurrentMetrics(): DeviceMetrics | null {
  try {
    // Check if window exists before trying to access its properties
    if (
      typeof window !== 'undefined' &&
      window !== null &&
      'innerWidth' in window &&
      'innerHeight' in window &&
      'devicePixelRatio' in window
    ) {
      return {
        logicalWidth: window.innerWidth,
        logicalHeight: window.innerHeight,
        scaleFactor: window.devicePixelRatio,
      };
    }
    return null;
  } catch (error) {
    // Handle any unexpected errors
    return null;
  }
}

/**
 * Normalizes dimensions based on orientation
 */
export function normalizeDimensions(
  width: number,
  height: number,
  orientation: 'auto' | 'portrait' | 'landscape'
): [number, number] {
  // Auto orientation - portrait is when height > width
  if (orientation === 'auto') {
    return width > height ? [height, width] : [width, height];
  }

  // Explicit landscape - ensure width > height
  if (orientation === 'landscape') {
    return width < height ? [height, width] : [width, height];
  }

  // Explicit portrait - ensure width < height
  if (orientation === 'portrait') {
    return width > height ? [height, width] : [width, height];
  }

  // Default case (should never happen if proper type checking is in place)
  return [width, height];
}

/**
 * Validates device metrics to ensure they have valid values
 */
export function isValidMetrics(metrics: DeviceMetrics | null): boolean {
  return Boolean(
    metrics &&
      typeof metrics.logicalWidth === 'number' &&
      metrics.logicalWidth > 0 &&
      typeof metrics.logicalHeight === 'number' &&
      metrics.logicalHeight > 0 &&
      typeof metrics.scaleFactor === 'number' &&
      metrics.scaleFactor > 0
  );
}
