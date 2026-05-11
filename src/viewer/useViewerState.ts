import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback } from 'react';
import { defaultDevice, devices, findDevice, type Device } from './devices';
import type { ViewerSearch } from '../routes/viewer';

export type ViewerState = {
  device: Device | null;       // null means "custom"
  deviceId: string;            // 'custom' or a device id
  w: number;                   // logical viewport width (pre-rotate)
  h: number;                   // logical viewport height (pre-rotate)
  rot: 0 | 1;
  zoom: number | 'fit';
  touch: boolean;              // simulate touch input inside iframe
  // Effective render dimensions (post-rotate)
  renderW: number;
  renderH: number;
};

export function useViewerState() {
  const search = useSearch({ from: '/' }) as ViewerSearch;
  const navigate = useNavigate({ from: '/' });

  const device = search.device === 'custom' ? null : findDevice(search.device) ?? defaultDevice;
  const w = search.w;
  const h = search.h;
  const rot = search.rot;
  const renderW = rot === 1 ? h : w;
  const renderH = rot === 1 ? w : h;

  const touch =
    search.touch === 1
      ? true
      : search.touch === 0
        ? false
        : device?.group === 'phone' || device?.group === 'tablet';

  const state: ViewerState = {
    device,
    deviceId: device ? device.id : 'custom',
    w,
    h,
    rot,
    zoom: search.zoom,
    touch,
    renderW,
    renderH,
  };

  const update = useCallback(
    (next: Partial<ViewerSearch>) => {
      navigate({
        search: (prev) => ({ ...prev, ...next }) as ViewerSearch,
        replace: true,
      });
    },
    [navigate],
  );

  const setDevice = useCallback(
    (id: string) => {
      const d = findDevice(id);
      if (!d) return;
      // Reset touch to auto-derived on device change.
      update({ device: d.id, w: d.w, h: d.h, touch: 'auto' });
    },
    [update],
  );

  const setTouch = useCallback(
    (enabled: boolean) => {
      update({ touch: enabled ? 1 : 0 });
    },
    [update],
  );

  const setSize = useCallback(
    (w: number, h: number) => {
      update({ device: 'custom', w, h });
    },
    [update],
  );

  const rotate = useCallback(() => {
    update({ rot: rot === 1 ? 0 : 1 });
  }, [update, rot]);

  const setZoom = useCallback(
    (zoom: number | 'fit') => {
      update({ zoom });
    },
    [update],
  );

  const cycleDevice = useCallback(
    (dir: 1 | -1) => {
      const idx = devices.findIndex((d) => d.id === state.deviceId);
      const base = idx === -1 ? 0 : idx;
      const next = devices[(base + dir + devices.length) % devices.length];
      setDevice(next.id);
    },
    [state.deviceId, setDevice],
  );

  return { state, setDevice, setSize, rotate, setZoom, setTouch, cycleDevice };
}
