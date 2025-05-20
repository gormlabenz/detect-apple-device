// Detection options
export interface DetectionOptions {
  deviceTypes?: string[];
  minReleaseDate?: string;
  minConfidence?: number;
  useWidth?: boolean;
  useHeight?: boolean;
  useScaleFactor?: boolean;
  orientation?: 'auto' | 'portrait' | 'landscape';
  additionalDevices?: Device[];
}

// Custom device metrics for manual identification
export interface DeviceMetrics {
  logicalWidth: number;
  logicalHeight: number;
  scaleFactor: number;
}

// Detection result
export interface DetectionResult {
  matches: MatchedDevice[];
}

// Matched device with confidence and details
export interface MatchedDevice {
  device: {
    name: string;
    type: string;
    release_date: string;
    screen: {
      diagonal_inches: number;
      ppi: number;
      scale_factor: number;
      aspect_ratio: string;
      resolution: {
        logical: {
          width: number;
          height: number;
        };
        physical: {
          width: number;
          height: number;
        };
      };
    };
  };
  confidence: number;
  matchDetails: {
    widthMatch: boolean;
    heightMatch: boolean;
    scaleFactorMatch: boolean;
  };
}

// Device database format
export interface DeviceDatabase {
  devices: Device[];
}

export interface Device {
  name: string;
  type: string;
  release_date: string;
  sizes: DeviceVariant[];
}

export interface DeviceVariant {
  screen: {
    diagonal_inches: number;
    ppi: number;
    scale_factor: number;
    aspect_ratio: string;
    resolution: {
      logical: {
        width: number;
        height: number;
      };
      physical: {
        width: number;
        height: number;
      };
    };
  };
}

// Required version of detection options (with all properties defined)
export type RequiredDetectionOptions = Required<DetectionOptions>;

// Define the extended function type with identify method
export interface DetectAppleDeviceFunction {
  (options?: DetectionOptions): DetectionResult;
  identify: (
    metrics: DeviceMetrics,
    options?: DetectionOptions
  ) => DetectionResult;
}
