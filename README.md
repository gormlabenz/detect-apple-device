# detect-apple-device

> Apple device detection approximation based on screen metrics

[![Coverage Status](https://codecov.io/gh/gormlabenz/detect-apple-device/branch/main/graph/badge.svg)](https://codecov.io/gh/gormlabenz/detect-apple-device)
[![npm version](https://badgen.net/npm/v/detect-apple-device)](https://www.npmjs.com/package/detect-apple-device)
[![Downloads](https://badgen.net/npm/dt/detect-apple-device)](https://www.npmjs.com/package/detect-apple-device)

A lightweight, dependency-free TypeScript library that approximates Apple device identification by analyzing screen dimensions and scale factors. Perfect for responsive web applications, analytics, and device-specific optimizations.

**Data Source**: Device specifications are based on [iOS Resolution](https://www.ios-resolution.com/) as of May 27, 2025.

## Features

- 🎯 **Screen-Based Approximation** - Approximates device identification using screen metrics
- 📱 **Comprehensive Database** - Supports iPhone, iPad, Apple Watch, and iPod Touch (2007-2024)
- 🔧 **Flexible Configuration** - Customizable detection parameters and confidence thresholds
- 📏 **Orientation Handling** - Automatic portrait/landscape orientation normalization
- 🌐 **Browser Safe** - Works reliably in all browser environments with proper fallbacks
- 📦 **Zero Dependencies** - Lightweight and self-contained
- 🔒 **TypeScript Ready** - Full type definitions included

## Detection Scope & Limitations

This library provides **approximations** based solely on screen metrics. It is **not** a definitive device identification tool.

### What It Uses

- **`window.screen.width`** - Screen width in logical pixels
- **`window.screen.height`** - Screen height in logical pixels
- **`window.devicePixelRatio`** - Device scale factor (1, 2, or 3)

### What It Does NOT Use

- **User-Agent strings** - For User-Agent based detection, consider [UAParser.js](https://github.com/faisalman/ua-parser-js)
- **Hardware fingerprinting** - No access to device-specific hardware identifiers
- **Browser features** - No feature detection or capability analysis

### Detection Behavior

- **Multiple Matches**: The library evaluates all device models and may return multiple devices with identical confidence scores
- **Shared Specifications**: Many Apple devices share identical screen specifications, making definitive identification impossible
- **Approximation Only**: Results should be treated as educated guesses, not definitive identifications

## Quick Start

```bash
npm install detect-apple-device
```

### Basic Usage

```typescript
import { detectAppleDevice } from 'detect-apple-device';

// Automatic detection using current browser metrics
const result = detectAppleDevice();

// Find all perfect matches (confidence = 1.0)
const perfectMatches = result.matches.filter(match => match.confidence === 1.0);

if (perfectMatches.length > 0) {
  console.log(`Found ${perfectMatches.length} possible device(s):`);
  perfectMatches.forEach(match => {
    console.log(`- ${match.device.name} (${match.device.type})`);
  });
} else if (result.matches.length > 0) {
  console.log(`Best approximation: ${result.matches[0].device.name}`);
  console.log(`Confidence: ${result.matches[0].confidence}`);
} else {
  console.log('No matching Apple devices found');
}
```

### Manual Device Identification

```typescript
import { detectAppleDevice } from 'detect-apple-device';

// Identify device using custom metrics
const result = detectAppleDevice.identify({
  logicalWidth: 393,
  logicalHeight: 852,
  scaleFactor: 3,
});

// May return multiple devices: iPhone 15 Pro, iPhone 14 Pro, etc.
// (devices with identical screen specifications)
```

## API Reference

### `detectAppleDevice(options?)`

Automatically detects the current device using browser metrics.

**Parameters:**

- `options` _(optional)_: `DetectionOptions` - Configuration object

**Default Options:**

```typescript
{
  deviceTypes: [],              // No filtering (all types)
  minReleaseDate: '',          // No date filtering
  minConfidence: 1,            // Perfect matches only
  useWidth: true,              // Include width in matching
  useHeight: true,             // Include height in matching
  useScaleFactor: true,        // Include scale factor in matching
  orientation: 'auto',         // Auto-detect orientation
  additionalDevices: []        // No custom devices
}
```

**Returns:** `DetectionResult` - Detection results with matched devices

### `detectAppleDevice.identify(metrics, options?)`

Manually identifies devices using provided screen metrics.

**Parameters:**

- `metrics`: `DeviceMetrics` - Screen dimensions and scale factor
- `options` _(optional)_: `DetectionOptions` - Configuration object

**Returns:** `DetectionResult` - Detection results with matched devices

### Types

#### `DeviceMetrics`

```typescript
interface DeviceMetrics {
  logicalWidth: number; // Screen width in logical pixels
  logicalHeight: number; // Screen height in logical pixels
  scaleFactor: number; // Device pixel ratio (1, 2, or 3)
}
```

#### `DetectionOptions`

```typescript
interface DetectionOptions {
  deviceTypes?: string[]; // Filter by device type ['phone', 'tablet', 'watch'] (default: [])
  minReleaseDate?: string; // Filter by minimum release date YYYY-MM-DD (default: '')
  minConfidence?: number; // Minimum confidence threshold 0-1 (default: 1)
  useWidth?: boolean; // Include width in matching (default: true)
  useHeight?: boolean; // Include height in matching (default: true)
  useScaleFactor?: boolean; // Include scale factor in matching (default: true)
  orientation?: 'auto' | 'portrait' | 'landscape'; // Orientation handling (default: 'auto')
  additionalDevices?: Device[]; // Custom device definitions (default: [])
}
```

#### `DetectionResult`

```typescript
interface DetectionResult {
  matches: MatchedDevice[];
}

interface MatchedDevice {
  device: {
    name: string; // Device name (e.g., "iPhone 15 Pro")
    type: string; // Device type (phone, tablet, watch, music_player)
    release_date: string; // Release date (YYYY-MM-DD)
    screen: {
      diagonal_inches: number;
      ppi: number;
      scale_factor: number;
      aspect_ratio: string;
      resolution: {
        logical: { width: number; height: number };
        physical: { width: number; height: number };
      };
    };
  };
  confidence: number; // Match confidence (0-1)
  matchDetails: {
    widthMatch: boolean;
    heightMatch: boolean;
    scaleFactorMatch: boolean;
  };
}
```

## Advanced Usage

### Filtering by Device Type

```typescript
// Only detect iPhones
const iphones = detectAppleDevice({
  deviceTypes: ['phone'],
});

// Only detect iPads and Apple Watches
const tablets_and_watches = detectAppleDevice({
  deviceTypes: ['tablet', 'watch'],
});
```

### Confidence Thresholds

```typescript
// Require perfect matches only
const perfectMatches = detectAppleDevice({
  minConfidence: 1.0,
});

// Allow partial matches (66% confidence or higher)
const partialMatches = detectAppleDevice({
  minConfidence: 0.66,
});
```

### Orientation Handling

```typescript
// Force portrait orientation comparison
const portraitResult = detectAppleDevice({
  orientation: 'portrait',
});

// Force landscape orientation comparison
const landscapeResult = detectAppleDevice({
  orientation: 'landscape',
});

// Auto-detect orientation (default)
const autoResult = detectAppleDevice({
  orientation: 'auto',
});
```

### Historical Device Filtering

```typescript
// Only detect devices released after 2020
const modernDevices = detectAppleDevice({
  minReleaseDate: '2020-01-01',
});

// Only detect latest generation devices
const latestDevices = detectAppleDevice({
  minReleaseDate: '2023-01-01',
});
```

### Custom Device Definitions

```typescript
// Add custom or prototype devices
const result = detectAppleDevice({
  additionalDevices: [
    {
      name: 'Custom iPad',
      type: 'tablet',
      release_date: '2024-01-01',
      sizes: [
        {
          screen: {
            diagonal_inches: 11,
            ppi: 264,
            scale_factor: 2,
            aspect_ratio: '4:3',
            resolution: {
              logical: { width: 800, height: 1200 },
              physical: { width: 1600, height: 2400 },
            },
          },
        },
      ],
    },
  ],
});
```

## Supported Devices

The library includes a comprehensive database of Apple devices from 2007 to 2024:

### iPhone Models

- iPhone (1st gen) through iPhone 16 Pro Max
- All iPhone SE models
- Complete screen specification database

### iPad Models

- iPad (1st gen) through iPad Pro 7th gen
- iPad Air, iPad Mini, iPad Pro variants
- All screen sizes and generations

### Apple Watch Models

- Apple Watch Series 0 through Series 10
- Apple Watch SE, Ultra, and Ultra 2
- Both small and large sizes

### iPod Touch Models

- iPod Touch (1st gen) through iPod Touch (7th gen)
- Complete legacy device support

## Browser Compatibility

The library works in all modern browsers and handles various environments gracefully:

- **Client-side**: Uses `window.screen.width`, `window.screen.height`, and `window.devicePixelRatio`
- **Server-side**: Returns empty results safely without errors
- **Fallback**: Graceful degradation when APIs are unavailable

## Limitations

- **Approximation Only**: Results are educated guesses, not definitive device identification
- **Browser Environment**: Automatic detection only works in browser environments with access to `window.screen`
- **Screen Metrics Only**: Uses only screen dimensions and scale factor - no User-Agent or hardware fingerprinting
- **Multiple Matches**: Many Apple devices share identical screen specifications, resulting in multiple possible matches
- **Viewport vs Screen**: Uses screen dimensions, not viewport dimensions
- **Future Devices**: Database needs updates for new Apple device releases

## Performance

- **Zero Dependencies**: No external dependencies for optimal bundle size
- **Efficient Matching**: Optimized algorithm for fast device lookup
- **Memory Efficient**: Minimal memory footprint
- **Tree Shakeable**: Only imports what you use

## Use Cases

### Responsive Design

```typescript
const result = detectAppleDevice();
const mobileDevices = result.matches.filter(
  match => match.device.type === 'phone'
);
if (mobileDevices.length > 0) {
  // Apply mobile-specific styling
}
```

### Analytics

```typescript
const result = detectAppleDevice();
if (result.matches.length > 0) {
  // Log all possible matches for comprehensive analytics
  result.matches.forEach(match => {
    if (match.confidence >= 0.8) {
      analytics.track('device_approximation', {
        name: match.device.name,
        type: match.device.type,
        confidence: match.confidence,
        release_year: match.device.release_date.split('-')[0],
      });
    }
  });
}
```

### Feature Detection

```typescript
const result = detectAppleDevice();
const hasRetinaDisplay = result.matches.some(
  match => match.device.screen.scale_factor >= 2
);
if (hasRetinaDisplay) {
  // Load high-resolution images
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for:

- New device additions
- Bug fixes
- Documentation improvements
- Performance optimizations

## License

MIT © [Gorm Labenz](https://github.com/gormlabenz)

---

**Note**: This library focuses specifically on Apple devices. For broader device detection including Android, Windows, and other platforms, consider using a more comprehensive solution like UAParser.js or similar libraries.
