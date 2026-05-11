import { devices, groupLabels, type DeviceGroup } from './devices';
import type { ViewerState } from './useViewerState';

type Props = {
  state: ViewerState;
  setDevice: (id: string) => void;
  setSize: (w: number, h: number) => void;
  rotate: () => void;
  setZoom: (zoom: number | 'fit') => void;
  setTouch: (enabled: boolean) => void;
};

const ZOOM_PRESETS: Array<number | 'fit'> = ['fit', 0.5, 0.75, 1, 1.25, 1.5];

export function Toolbar({ state, setDevice, setSize, rotate, setZoom, setTouch }: Props) {
  const groups: DeviceGroup[] = ['phone', 'tablet', 'desktop'];

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-800/80 bg-zinc-950 px-3 text-zinc-200">
      <div className="flex items-center gap-2 pr-2">
        <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
        <span className="text-sm font-semibold tracking-tight">mockingbird</span>
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-800" />

      <select
        value={state.deviceId}
        onChange={(e) => {
          const id = e.target.value;
          if (id === 'custom') return;
          setDevice(id);
        }}
        className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
      >
        {state.deviceId === 'custom' && <option value="custom">Custom</option>}
        {groups.map((group) => (
          <optgroup key={group} label={groupLabels[group]}>
            {devices
              .filter((d) => d.group === group)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} — {d.w}×{d.h}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      <DimensionInput
        value={state.w}
        onChange={(v) => setSize(v, state.h)}
        label="W"
      />
      <span className="text-zinc-600">×</span>
      <DimensionInput
        value={state.h}
        onChange={(v) => setSize(state.w, v)}
        label="H"
      />

      <button
        onClick={rotate}
        className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-sm text-zinc-200 hover:border-zinc-600"
        title="Rotate (R)"
      >
        ⟲
      </button>

      <button
        onClick={() => setTouch(!state.touch)}
        className={`h-8 rounded-md border px-2 text-sm transition ${
          state.touch
            ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
            : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-600'
        }`}
        title="Toggle touch simulation (T)"
        aria-pressed={state.touch}
      >
        Touch
      </button>

      <div className="mx-1 h-5 w-px bg-zinc-800" />

      <select
        value={state.zoom === 'fit' ? 'fit' : String(state.zoom)}
        onChange={(e) => {
          const v = e.target.value;
          setZoom(v === 'fit' ? 'fit' : Number(v));
        }}
        className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        title="Zoom"
      >
        {ZOOM_PRESETS.map((z) => (
          <option key={String(z)} value={z === 'fit' ? 'fit' : String(z)}>
            {z === 'fit' ? 'Fit' : `${Math.round(z * 100)}%`}
          </option>
        ))}
      </select>

      <div className="ml-auto flex items-center gap-3 text-[11px] text-zinc-500">
        <Hint k="R" label="rotate" />
        <Hint k="[ ]" label="device" />
        <Hint k="+ −" label="zoom" />
        <Hint k="F" label="fit" />
        <Hint k="T" label="touch" />
        <a
          href="/app"
          target="_blank"
          rel="noreferrer"
          className="ml-2 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
        >
          Open /app
        </a>
      </div>
    </header>
  );
}

function DimensionInput({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-zinc-500">
      <span>{label}</span>
      <input
        type="number"
        min={50}
        max={4000}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n > 0) onChange(n);
        }}
        className="h-8 w-[68px] rounded-md border border-zinc-800 bg-zinc-900 px-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
      />
    </label>
  );
}

function Hint({ k, label }: { k: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
        {k}
      </kbd>
      <span>{label}</span>
    </span>
  );
}
