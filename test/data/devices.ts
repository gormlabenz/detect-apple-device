import { Device } from '../../src';

export const testDevices: Device[] = [
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
  {
    name: 'Apple Watch Series 10 Large',
    type: 'watch',
    release_date: '2024-09-20',
    sizes: [
      {
        screen: {
          diagonal_inches: 1.96,
          ppi: 330,
          scale_factor: 2,
          aspect_ratio: '26:31',
          resolution: {
            logical: {
              width: 208,
              height: 248,
            },
            physical: {
              width: 416,
              height: 496,
            },
          },
        },
      },
    ],
  },
];
