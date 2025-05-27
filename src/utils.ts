import { DeviceMetrics } from './types';

/**
 * Safely gets current device metrics from browser environment
 * Falls back to null values when window is not available (server-side)
 */
export function getCurrentMetrics(): DeviceMetrics | null {
  try {
    // Umfassende Prüfung
    if (
      typeof window !== 'undefined' &&
      window.screen &&
      typeof window.screen.width === 'number' &&
      typeof window.screen.height === 'number' &&
      window.screen.width > 0 &&
      window.screen.height > 0
    ) {
      return {
        logicalWidth: window.screen.width,
        logicalHeight: window.screen.height,
        scaleFactor:
          typeof window.devicePixelRatio === 'number'
            ? window.devicePixelRatio
            : 1,
      };
    }
    return null;
  } catch (error) {
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
