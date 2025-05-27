import { detectAppleDevice } from '../src';
import { testDevices } from './data/devices';

const mockWindow = () => {
  // @ts-ignore: mock window for testing
  global.window = {
    innerWidth: 402,
    innerHeight: 874,
    devicePixelRatio: 3,
    screen: {
      width: 402,
      height: 874,
      availWidth: 402,
      availHeight: 874,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: {},
    } as Screen,
  };
};

// Remove window mock
const cleanupWindow = () => {
  // @ts-ignore: cleanup window mock
  delete global.window;
};

describe('index', () => {
  describe('detectAppleDevice', () => {
    beforeEach(() => {
      cleanupWindow();
    });

    it('should return empty result when window is not defined', () => {
      const result = detectAppleDevice();
      expect(result.matches).toEqual([]);
    });

    it('should detect device from window metrics', () => {
      // Mock window with iPhone 16 Pro dimensions
      mockWindow();

      const result = detectAppleDevice({
        // Add test devices to database for detection
        additionalDevices: testDevices,
        minConfidence: 1,
      });

      // log matches

      // Should match iPhone 16 Pro
      expect(result.matches.length).toBe(2);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1);
    });

    it('should filter devices by type', () => {
      // Mock window with iPhone 16 Pro dimensions
      mockWindow();

      // Only match tablets
      const result = detectAppleDevice({
        additionalDevices: testDevices,
        deviceTypes: ['tablet'],
        minConfidence: 0.5, // Lower confidence to get partial matches
      });

      // Should not match any tablets with iPhone dimensions
      expect(result.matches.length).toBe(0);
    });

    it('should respect minConfidence setting', () => {
      // Mock window with phone dimensions that partially match
      // @ts-ignore: mock window for testing
      global.window = {
        innerWidth: 402, // Matches iPhone 16 Pro
        innerHeight: 800, // Doesn't match
        devicePixelRatio: 2, // Doesn't match
        screen: {
          width: 402, // Matches iPhone 16 Pro
          height: 800, // Doesn't match
          availWidth: 402,
          availHeight: 800,
          colorDepth: 24,
          pixelDepth: 24,
          orientation: {},
        } as Screen,
      };

      // Test with different confidence values
      const highConfidence = detectAppleDevice({
        additionalDevices: testDevices,
        minConfidence: 0.8, // Requires almost perfect match
      });

      const lowConfidence = detectAppleDevice({
        additionalDevices: testDevices,
        minConfidence: 0.3, // Accepts partial matches
      });

      // High confidence should find no matches
      expect(highConfidence.matches.length).toBe(0);

      // Low confidence should find partial matches
      expect(lowConfidence.matches.length).toBeGreaterThan(0);
      expect(lowConfidence.matches[0].confidence).toBeGreaterThanOrEqual(0.3);
    });

    it('should work with manual identify method', () => {
      // iPhone 16 Pro metrics
      const metrics = {
        logicalWidth: 402,
        logicalHeight: 874,
        scaleFactor: 3,
      };

      const result = detectAppleDevice.identify(metrics, {
        additionalDevices: testDevices,
      });

      // Should match iPhone 16 Pro
      expect(result.matches.length).toBe(2);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1);
    });

    it('should handle invalid manual metrics', () => {
      // Invalid metrics
      const metrics = {
        logicalWidth: 0, // Invalid
        logicalHeight: 874,
        scaleFactor: 3,
      };

      const result = detectAppleDevice.identify(metrics, {
        additionalDevices: testDevices,
      });

      // Should return empty results
      expect(result.matches).toEqual([]);
    });

    it('should combine default and additional devices', () => {
      // Mock window with iPhone 16 Pro dimensions
      mockWindow();

      // Create a unique custom device that should match perfectly
      const customDevice = {
        name: 'Custom Test Device',
        type: 'custom',
        release_date: '2025-01-01',
        sizes: [
          {
            variant: 'default',
            screen: {
              diagonal_inches: 6.3,
              ppi: 460,
              scale_factor: 3,
              aspect_ratio: '201:437',
              resolution: {
                logical: {
                  width: 402,
                  height: 874,
                },
                physical: {
                  width: 1206,
                  height: 2622,
                },
              },
            },
          },
        ],
      };

      const result = detectAppleDevice({
        additionalDevices: [customDevice],
        minConfidence: 1,
      });
      // Should match the custom device
      expect(result.matches.length).toBe(2);
      expect(result.matches[1].device.name).toBe('Custom Test Device');
      expect(result.matches[1].device.type).toBe('custom');
    });
  });
});
