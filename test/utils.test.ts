import {
  getCurrentMetrics,
  normalizeDimensions,
  isValidMetrics,
} from '../src/utils';

// Mock global window object
const mockWindow = () => {
  // @ts-ignore: mock window for testing
  global.window = {
    innerWidth: 390,
    innerHeight: 844,
    devicePixelRatio: 3,
  };
};

// Remove window mock
const cleanupWindow = () => {
  // @ts-ignore: cleanup window mock
  delete global.window;
};

describe('utils', () => {
  describe('getCurrentMetrics', () => {
    beforeEach(() => {
      cleanupWindow();
    });

    it('should return null when window is not defined', () => {
      const metrics = getCurrentMetrics();
      expect(metrics).toBeNull();
    });

    it('should return device metrics from window object', () => {
      mockWindow();

      const metrics = getCurrentMetrics();

      expect(metrics).toEqual({
        logicalWidth: 390,
        logicalHeight: 844,
        scaleFactor: 3,
      });
    });

    it('should handle missing window properties gracefully', () => {
      // @ts-ignore: partial window mock for testing
      global.window = {};

      const metrics = getCurrentMetrics();

      expect(metrics).toBeNull();
    });

    it('should handle exceptions gracefully', () => {
      // @ts-ignore: create a window object that throws when accessing properties
      global.window = {
        get innerWidth() {
          throw new Error('Simulated error');
          return 0;
        },
      };

      const metrics = getCurrentMetrics();

      expect(metrics).toBeNull();
    });
  });

  describe('normalizeDimensions', () => {
    it('should keep dimensions in portrait orientation by default with auto setting', () => {
      const [width, height] = normalizeDimensions(300, 500, 'auto');
      expect(width).toBe(300);
      expect(height).toBe(500);
    });

    it('should swap dimensions to portrait orientation with auto setting', () => {
      const [width, height] = normalizeDimensions(500, 300, 'auto');
      expect(width).toBe(300);
      expect(height).toBe(500);
    });

    it('should force landscape orientation regardless of input', () => {
      // Already in landscape
      const [width1, height1] = normalizeDimensions(500, 300, 'landscape');
      expect(width1).toBe(500);
      expect(height1).toBe(300);

      // Convert to landscape
      const [width2, height2] = normalizeDimensions(300, 500, 'landscape');
      expect(width2).toBe(500);
      expect(height2).toBe(300);
    });

    it('should force portrait orientation regardless of input', () => {
      // Already in portrait
      const [width1, height1] = normalizeDimensions(300, 500, 'portrait');
      expect(width1).toBe(300);
      expect(height1).toBe(500);

      // Convert to portrait
      const [width2, height2] = normalizeDimensions(500, 300, 'portrait');
      expect(width2).toBe(300);
      expect(height2).toBe(500);
    });
  });

  describe('isValidMetrics', () => {
    it('should return false for null metrics', () => {
      expect(isValidMetrics(null)).toBe(false);
    });

    it('should return true for valid metrics', () => {
      const metrics = {
        logicalWidth: 390,
        logicalHeight: 844,
        scaleFactor: 3,
      };

      expect(isValidMetrics(metrics)).toBe(true);
    });

    it('should return false for metrics with zero or negative values', () => {
      const metrics1 = {
        logicalWidth: 0,
        logicalHeight: 844,
        scaleFactor: 3,
      };

      const metrics2 = {
        logicalWidth: 390,
        logicalHeight: -1,
        scaleFactor: 3,
      };

      const metrics3 = {
        logicalWidth: 390,
        logicalHeight: 844,
        scaleFactor: 0,
      };

      expect(isValidMetrics(metrics1)).toBe(false);
      expect(isValidMetrics(metrics2)).toBe(false);
      expect(isValidMetrics(metrics3)).toBe(false);
    });

    it('should return false for metrics with non-numeric values', () => {
      const metrics = {
        logicalWidth: 'not a number' as unknown as number,
        logicalHeight: 844,
        scaleFactor: 3,
      };

      expect(isValidMetrics(metrics)).toBe(false);
    });
  });
});
