export type IconName =
  | "arrow"
  | "clock"
  | "weight"
  | "play"
  | "pause"
  | "volume"
  | "mute"
  | "reset"
  | "back"
  | "check"
  | "leaf"
  | "sun"
  | "skip";

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  weight: (
    <>
      <path d="M5 8v8m3-11v14m8-14v14m3-11v8M8 12h8" />
    </>
  ),
  play: <path d="m9 5 10 7-10 7z" fill="currentColor" strokeWidth="0" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" strokeWidth="3" />
    </>
  ),
  volume: (
    <>
      <path d="m11 5-5 4H3v6h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
    </>
  ),
  mute: (
    <>
      <path d="m11 5-5 4H3v6h3l5 4zM16 9l5 6m0-6-5 6" />
    </>
  ),
  reset: (
    <>
      <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
    </>
  ),
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  leaf: (
    <>
      <path d="M19 4C8 2 2 9 6 16s15 3 13-12ZM5 20 15 9" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  skip: (
    <>
      <path d="m5 6 10 6-10 6zM19 6v12" />
    </>
  ),
};

export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
