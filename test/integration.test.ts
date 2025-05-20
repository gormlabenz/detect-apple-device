import { detectAppleDevice } from '../src';

// This test file combines multiple aspects of the library to test real-world scenarios

// Mock device database import
jest.mock('../src/data/devices', () => {
  return {
    devices: [
      {
        name: 'iPhone 15 Pro',
        type: 'phone',
        release_date: '2023-09-22',
        sizes: [
          {
            screen: {
              diagonal_inches: 6.1,
              ppi: 460,
              scale_factor: 3,
              aspect_ratio: '131:284',
              resolution: {
                logical: {
                  width: 393,
                  height: 852,
                },
                physical: {
                  width: 1179,
                  height: 2556,
                },
              },
            },
          },
        ],
      },
    ],
    testDevices: [
      {
        name: 'iPhone 16 Pro',
        type: 'phone',
        release_date: '2024-09-09',
        sizes: [
          {
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
      },
      {
        name: 'iPad Mini (7th gen)',
        type: 'tablet',
        release_date: '2024-10-23',
        sizes: [
          {
            screen: {
              diagonal_inches: 8.3,
              ppi: 326,
              scale_factor: 2,
              aspect_ratio: '744:1133',
              resolution: {
                logical: {
                  width: 744,
                  height: 1133,
                },
                physical: {
                  width: 1488,
                  height: 2266,
                },
              },
            },
          },
        ],
      },
    ],
  };
});

describe('Integration tests', () => {
  // Setup and cleanup for window mocking
  const originalWindow = global.window;

  afterEach(() => {
    // @ts-ignore: restore original window
    global.window = originalWindow;
  });

  describe('Real-world device detection scenarios', () => {
    it('should identify iPhone when in landscape orientation', () => {
      // iPhone 15 Pro in landscape mode (width and height swapped)
      // @ts-ignore: mock window
      global.window = {
        innerWidth: 852, // Height becomes width in landscape
        innerHeight: 393, // Width becomes height in landscape
        devicePixelRatio: 3,
      };

      const result = detectAppleDevice();

      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 15 Pro');
      expect(result.matches[0].confidence).toBe(1);
    });

    it('should identify new devices when using minReleaseDate filter', () => {
      // iPad Mini (7th gen) metrics
      // @ts-ignore: mock window
      global.window = {
        innerWidth: 744,
        innerHeight: 1133,
        devicePixelRatio: 2,
      };

      const result = detectAppleDevice({
        additionalDevices: [
          {
            name: 'iPad Mini (7th gen)',
            type: 'tablet',
            release_date: '2024-10-23',
            sizes: [
              {
                screen: {
                  diagonal_inches: 8.3,
                  ppi: 326,
                  scale_factor: 2,
                  aspect_ratio: '744:1133',
                  resolution: {
                    logical: {
                      width: 744,
                      height: 1133,
                    },
                    physical: {
                      width: 1488,
                      height: 2266,
                    },
                  },
                },
              },
            ],
          },
        ],
        minReleaseDate: '2024-01-01',
      });

      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPad Mini (7th gen)');
      expect(result.matches[0].device.release_date).toBe('2024-10-23');
    });

    it('should handle non-standard device dimensions', () => {
      // Non-standard metrics that don't exactly match any device
      const metrics = {
        logicalWidth: 400, // Close to iPhone 16 Pro (402)
        logicalHeight: 870, // Close to iPhone 16 Pro (874)
        scaleFactor: 3,
      };

      // Lower confidence to allow partial matches
      const result = detectAppleDevice.identify(metrics, {
        additionalDevices: [
          {
            name: 'iPhone 16 Pro',
            type: 'phone',
            release_date: '2024-09-09',
            sizes: [
              {
                screen: {
                  diagonal_inches: 6.3,
                  ppi: 460,
                  scale_factor: 3,
                  aspect_ratio: '201:437',
                  resolution: {
                    logical: { width: 402, height: 874 },
                    physical: { width: 1206, height: 2622 },
                  },
                },
              },
            ],
          },
        ],
        minConfidence: 0.7, // Lower confidence for partial match
        // Only use scale factor for matching
        useWidth: false,
        useHeight: false,
        useScaleFactor: true,
      });

      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 16 Pro');
      expect(result.matches[0].confidence).toBe(1); // Perfect match on scale factor
      expect(result.matches[0].matchDetails.widthMatch).toBe(false);
      expect(result.matches[0].matchDetails.heightMatch).toBe(false);
      expect(result.matches[0].matchDetails.scaleFactorMatch).toBe(true);
    });

    it('should handle detection with partial metrics when some parameters are ignored', () => {
      // iPhone 15 Pro with correct width but wrong height and scale factor
      // @ts-ignore: mock window
      global.window = {
        innerWidth: 393, // Correct width for iPhone 15 Pro
        innerHeight: 800, // Wrong height
        devicePixelRatio: 2, // Wrong scale factor
      };

      // Only use width for detection
      const result = detectAppleDevice({
        useWidth: true,
        useHeight: false,
        useScaleFactor: false,
        minConfidence: 1,
      });

      expect(result.matches.length).toBe(1);
      expect(result.matches[0].device.name).toBe('iPhone 15 Pro');
      expect(result.matches[0].confidence).toBe(1); // Perfect match on width only
      expect(result.matches[0].matchDetails.widthMatch).toBe(true);
      expect(result.matches[0].matchDetails.heightMatch).toBe(false);
      expect(result.matches[0].matchDetails.scaleFactorMatch).toBe(false);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle corrupted window object gracefully', () => {
      // @ts-ignore: deliberately create a problematic window object
      global.window = {
        get innerWidth() {
          throw new Error('Simulated error');
          // TypeScript braucht einen Rückgabewert, auch wenn er nie erreicht wird
          return 0;
        },
        innerHeight: 800,
        devicePixelRatio: 2,
      };

      const result = detectAppleDevice();

      // Should return empty results
      expect(result.matches).toEqual([]);
    });

    it('should handle partial window object gracefully', () => {
      // @ts-ignore: deliberately create incomplete window object
      global.window = {
        // Missing innerWidth
        innerHeight: 800,
        devicePixelRatio: 2,
      };

      const result = detectAppleDevice();

      // Should return empty results
      expect(result.matches).toEqual([]);
    });
  });
});
