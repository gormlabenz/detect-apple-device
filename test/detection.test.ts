import { identifyWithMetrics } from '../src/detection';
import {
  DeviceMetrics,
  DeviceDatabase,
  RequiredDetectionOptions,
} from '../src/types';
import { testDevices } from './data/devices';

describe('detection', () => {
  describe('identifyWithMetrics', () => {
    // Create test database
    const testDatabase: DeviceDatabase = {
      devices: testDevices,
    };

    // Default test options
    const defaultOptions: RequiredDetectionOptions = {
      deviceTypes: [],
      minReleaseDate: '',
      minConfidence: 1,
      useWidth: true,
      useHeight: true,
      useScaleFactor: true,
      orientation: 'auto',
      additionalDevices: [],
    };

    it('should return exact match with perfect metrics', () => {
      // iPhone 16 Pro metrics
      const metrics: DeviceMetrics = {
        logicalWidth: 402,
        logicalHeight: 874,
        scaleFactor: 3,
      };

      const result = identifyWithMetrics(metrics, testDatabase, defaultOptions);

      // Should match iPhone 16 Pro
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1);
      expect(result.matches[0].matchDetails).toEqual({
        widthMatch: true,
        heightMatch: true,
        scaleFactorMatch: true,
      });
    });

    it('should return no matches with non-matching metrics and minConfidence=1', () => {
      // Non-matching metrics
      const metrics: DeviceMetrics = {
        logicalWidth: 400, // Doesn't match any test device
        logicalHeight: 800,
        scaleFactor: 3,
      };

      const result = identifyWithMetrics(metrics, testDatabase, defaultOptions);

      // Should not match any device
      expect(result.matches.length).toBe(0);
    });

    it('should return partial matches with lower minConfidence', () => {
      // Partial match metrics (only width matches)
      const metrics: DeviceMetrics = {
        logicalWidth: 402, // Matches iPhone 16 Pro
        logicalHeight: 800, // Doesn't match
        scaleFactor: 2, // Doesn't match
      };

      const options = {
        ...defaultOptions,
        minConfidence: 0.33, // Require at least 1/3 match
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match iPhone 16 Pro with 1/3 confidence
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBeCloseTo(0.33, 2);
      expect(result.matches[0].matchDetails).toEqual({
        widthMatch: true,
        heightMatch: false,
        scaleFactorMatch: false,
      });
    });

    it('should filter by device type', () => {
      // iPad Mini metrics
      const metrics: DeviceMetrics = {
        logicalWidth: 744,
        logicalHeight: 1133,
        scaleFactor: 2,
      };

      // Only match tablets
      const options = {
        ...defaultOptions,
        deviceTypes: ['tablet'],
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match iPad Mini
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPad Mini (7th gen)');
      expect(result.matches[0].device.type).toBe('tablet');
    });

    it('should filter by release date', () => {
      // All metrics that match devices from 2024-09-20 and later
      const metrics: DeviceMetrics = {
        logicalWidth: 744,
        logicalHeight: 1133,
        scaleFactor: 2,
      };

      // Only match recent devices
      const options = {
        ...defaultOptions,
        minReleaseDate: '2024-09-20',
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match iPad Mini (7th gen) which was released on 2024-10-23
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPad Mini (7th gen)');
      expect(result.matches[0].device.release_date).toBe('2024-10-23');
    });

    it('should ignore specified detection parameters', () => {
      // Match width and scale factor, but not height
      const metrics: DeviceMetrics = {
        logicalWidth: 402, // Matches iPhone 16 Pro
        logicalHeight: 800, // Doesn't match
        scaleFactor: 3, // Matches iPhone 16 Pro
      };

      // Ignore height check
      const options = {
        ...defaultOptions,
        useHeight: false,
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match iPhone 16 Pro with 100% confidence since height is ignored
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1);
      expect(result.matches[0].matchDetails).toEqual({
        widthMatch: true,
        heightMatch: false, // Height doesn't match
        scaleFactorMatch: true,
      });
    });

    it('should handle landscape orientation correctly', () => {
      // iPhone 16 Pro in landscape (width and height swapped)
      const metrics: DeviceMetrics = {
        logicalWidth: 874, // Height becomes width in landscape
        logicalHeight: 402, // Width becomes height in landscape
        scaleFactor: 3,
      };

      // Auto-detect orientation
      const options: RequiredDetectionOptions = {
        ...defaultOptions,
        orientation: 'auto',
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match iPhone 16 Pro
      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1);
    });

    it('should sort matches by confidence in descending order', () => {
      // Metrics that partially match multiple devices
      const metrics: DeviceMetrics = {
        logicalWidth: 402, // Matches iPhone 16 Pro
        logicalHeight: 874, // Matches iPhone 16 Pro
        scaleFactor: 2, // Matches iPad Mini and Apple Watch
      };

      const options: RequiredDetectionOptions = {
        ...defaultOptions,
        minConfidence: 0.33,
      };
      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should return matches sorted by confidence
      expect(result.matches.length).toBeGreaterThan(1);

      // Verify descending sort
      for (let i = 1; i < result.matches.length; i++) {
        expect(result.matches[i - 1].confidence).toBeGreaterThanOrEqual(
          result.matches[i].confidence
        );
      }
    });

    it('should handle no enabled checks gracefully', () => {
      const metrics: DeviceMetrics = {
        logicalWidth: 123,
        logicalHeight: 456,
        scaleFactor: 1,
      };

      // Disable all checks
      const options = {
        ...defaultOptions,
        useWidth: false,
        useHeight: false,
        useScaleFactor: false,
      };

      const result = identifyWithMetrics(metrics, testDatabase, options);

      // Should match all devices with 0 confidence
      expect(result.matches.length).toBe(0);
    });
  });
});
