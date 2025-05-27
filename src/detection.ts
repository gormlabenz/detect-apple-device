import {
  DetectionResult,
  DeviceDatabase,
  DeviceMetrics,
  MatchedDevice,
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

  const [checkWidth, checkHeight] = normalizeDimensions(
    metrics.logicalWidth,
    metrics.logicalHeight,
    options.orientation
  );

  for (const device of database.devices) {
    if (
      options.deviceTypes.length > 0 &&
      !options.deviceTypes.includes(device.type)
    ) {
      continue;
    }

    if (
      options.minReleaseDate &&
      device.release_date < options.minReleaseDate
    ) {
      continue;
    }

    for (const variant of device.sizes) {
      const widthMatch =
        !options.useWidth ||
        variant.screen.resolution.logical.width === checkWidth;

      const heightMatch =
        !options.useHeight ||
        variant.screen.resolution.logical.height === checkHeight;

      const scaleFactorMatch =
        !options.useScaleFactor ||
        variant.screen.scale_factor === metrics.scaleFactor;

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

      const confidence = totalChecks > 0 ? matchCount / totalChecks : 0;

      if (confidence >= options.minConfidence) {
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

  matches.sort((a, b) => b.confidence - a.confidence);

  return { matches };
}
