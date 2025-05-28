import { defaultDeviceDatabase } from './database';
import { identifyWithMetrics } from './detection';
import type {
  DetectAppleDeviceFunction,
  DetectionOptions,
  DetectionResult,
  DeviceMetrics,
  RequiredDetectionOptions,
} from './types';
import { getCurrentMetrics, isValidMetrics } from './utils';

/**
 * Device detection function
 */
function detectDevice(options: DetectionOptions = {}): DetectionResult {
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

  const mergedOptions: RequiredDetectionOptions = {
    ...defaultOptions,
    ...options,
  };

  const database = {
    devices: [
      ...defaultDeviceDatabase.devices,
      ...(mergedOptions.additionalDevices || []),
    ],
  };

  const currentMetrics = getCurrentMetrics();

  if (!isValidMetrics(currentMetrics)) {
    return { matches: [] };
  }

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
  if (!isValidMetrics(metrics)) {
    return { matches: [] };
  }

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

  const mergedOptions: RequiredDetectionOptions = {
    ...defaultOptions,
    ...options,
  };

  const database = {
    devices: [
      ...defaultDeviceDatabase.devices,
      ...(mergedOptions.additionalDevices || []),
    ],
  };

  return identifyWithMetrics(metrics, database, mergedOptions);
};

export * from './types';
export { detectAppleDevice };
