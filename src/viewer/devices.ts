import type { ChromeKind } from './chrome';

export type DeviceGroup = 'phone' | 'tablet' | 'desktop';

export type Device = {
  id: string;
  label: string;
  w: number;
  h: number;
  group: DeviceGroup;
  chrome: ChromeKind;
};

export const devices: readonly Device[] = [
  { id: 'iphone15pro', label: 'iPhone 15 Pro', w: 393, h: 852, group: 'phone', chrome: 'iphone-island' },
  { id: 'iphonese', label: 'iPhone SE', w: 375, h: 667, group: 'phone', chrome: 'iphone-classic' },
  { id: 'pixel8', label: 'Pixel 8', w: 412, h: 915, group: 'phone', chrome: 'pixel-punch' },
  { id: 'ipadpro11', label: 'iPad Pro 11"', w: 834, h: 1194, group: 'tablet', chrome: 'tablet' },
  { id: 'ipadair', label: 'iPad Air', w: 820, h: 1180, group: 'tablet', chrome: 'tablet' },
  { id: 'desktop1280', label: 'Desktop 1280', w: 1280, h: 800, group: 'desktop', chrome: 'desktop' },
  { id: 'desktop1440', label: 'Desktop 1440', w: 1440, h: 900, group: 'desktop', chrome: 'desktop' },
  { id: 'desktop1920', label: 'Desktop 1920', w: 1920, h: 1080, group: 'desktop', chrome: 'desktop' },
] as const;

export const defaultDevice = devices[0];

export const groupLabels: Record<DeviceGroup, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

export function findDevice(id: string): Device | undefined {
  return devices.find((d) => d.id === id);
}
