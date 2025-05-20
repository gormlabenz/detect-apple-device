import {
  DeviceMetrics,
  DetectionResult,
  MatchedDevice,
  DeviceDatabase,
  RequiredDetectionOptions,
} from './types';
import { normalizeDimensions } from './utils';

/**
 * Identifies devices based on custom metrics
 */
export function identifyWithMetrics(
  metrics: DeviceMetrics,
  database: DeviceDatabase,
  options: RequiredDetectionOptions
): DetectionResult {
  const matches: MatchedDevice[] = [];

  // Normalize dimensions based on orientation preference
  const [checkWidth, checkHeight] = normalizeDimensions(
    metrics.logicalWidth,
    metrics.logicalHeight,
    options.orientation
  );

  // Check devices against provided metrics
  for (const device of database.devices) {
    // Apply device type filter if specified
    if (
      options.deviceTypes.length > 0 &&
      !options.deviceTypes.includes(device.type)
    ) {
      continue;
    }

    // Apply release date filter if specified
    if (
      options.minReleaseDate &&
      device.release_date < options.minReleaseDate
    ) {
      continue;
    }

    // Check each device variant
    for (const variant of device.sizes) {
      // Check each matching criteria
      const widthMatch =
        !options.useWidth ||
        variant.screen.resolution.logical.width === checkWidth;

      const heightMatch =
        !options.useHeight ||
        variant.screen.resolution.logical.height === checkHeight;

      const scaleFactorMatch =
        !options.useScaleFactor ||
        variant.screen.scale_factor === metrics.scaleFactor;

      // Calculate confidence value (ratio of matching parameters)
      let matchCount = 0;
      let totalChecks = 0;

      if (options.useWidth) {
        totalChecks++;
        if (widthMatch) matchCount++;
      }

      if (options.useHeight) {
        totalChecks++;
        if (heightMatch) matchCount++;
      }

      if (options.useScaleFactor) {
        totalChecks++;
        if (scaleFactorMatch) matchCount++;
      }

      // Avoid division by zero if no checks enabled
      const confidence = totalChecks > 0 ? matchCount / totalChecks : 0;

      // Only add results with sufficient confidence
      if (confidence >= options.minConfidence) {
        // Format device details for output
        const matchedDevice: MatchedDevice = {
          device: {
            name: device.name,
            type: device.type,
            release_date: device.release_date,
            screen: { ...variant.screen },
          },
          confidence,
          matchDetails: {
            widthMatch,
            heightMatch,
            scaleFactorMatch,
          },
        };

        matches.push(matchedDevice);
      }
    }
  }

  // Sort results by confidence (descending)
  matches.sort((a, b) => b.confidence - a.confidence);

  return { matches };
}
