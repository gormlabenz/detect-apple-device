import {
  DetectionOptions,
  DetectionResult,
  DeviceMetrics,
  RequiredDetectionOptions,
  DetectAppleDeviceFunction,
} from './types';
import { defaultDeviceDatabase } from './database';
import { getCurrentMetrics, isValidMetrics } from './utils';
import { identifyWithMetrics } from './detection';

/**
 * Main device detection function
 */
function detectDevice(options: DetectionOptions = {}): DetectionResult {
  // Set default options
  const defaultOptions: RequiredDetectionOptions = {
    deviceTypes: [],
    minReleaseDate: '',
    minConfidence: 1, // Default to 1 (perfect match) as requested
    useWidth: true,
    useHeight: true,
    useScaleFactor: true,
    orientation: 'auto',
    additionalDevices: [],
  };

  // Merge with provided options
  const mergedOptions: RequiredDetectionOptions = {
    ...defaultOptions,
    ...options,
  };

  // Create combined device database
  const database = {
    devices: [
      ...defaultDeviceDatabase.devices,
      ...(mergedOptions.additionalDevices || []),
    ],
  };

  // Get current device metrics
  const currentMetrics = getCurrentMetrics();

  // If we're in a non-browser environment or couldn't get metrics
  if (!isValidMetrics(currentMetrics)) {
    return { matches: [] };
  }

  // Run device detection
  return identifyWithMetrics(currentMetrics!, database, mergedOptions);
}

/**
 * Main export function with additional methods
 */
const detectAppleDevice = function (
  options: DetectionOptions = {}
): DetectionResult {
  return detectDevice(options);
} as DetectAppleDeviceFunction;

/**
 * Method for manual identification
 */
detectAppleDevice.identify = function (
  metrics: DeviceMetrics,
  options: DetectionOptions = {}
): DetectionResult {
  // Validate input metrics
  if (!isValidMetrics(metrics)) {
    return { matches: [] };
  }

  // Set default options
  const defaultOptions: RequiredDetectionOptions = {
    deviceTypes: [],
    minReleaseDate: '',
    minConfidence: 1, // Default to 1 (perfect match) as requested
    useWidth: true,
    useHeight: true,
    useScaleFactor: true,
    orientation: 'auto',
    additionalDevices: [],
  };

  // Merge with provided options
  const mergedOptions: RequiredDetectionOptions = {
    ...defaultOptions,
    ...options,
  };

  // Create combined device database
  const database = {
    devices: [
      ...defaultDeviceDatabase.devices,
      ...(mergedOptions.additionalDevices || []),
    ],
  };

  return identifyWithMetrics(metrics, database, mergedOptions);
};

export { detectAppleDevice };
export * from './types';
