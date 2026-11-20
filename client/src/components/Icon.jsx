const PATHS = {
  dashboard: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z',
  device: 'M9 2v2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2M9 10h6M9 14h6',
  home: 'M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5',
  sensor: 'M3 12h4l3-8 4 16 3-8h4',
  events: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2',
  scenario: 'M13 2 4 14h7l-1 8 9-12h-7z',
  report: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  book: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM18 20h2V6',
  logout: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  play: 'M7 4v16l13-8z',
  power: 'M12 3v9M6.4 6.4a8 8 0 1 0 11.2 0',
  close: 'M6 6l12 12M18 6 6 18',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  alert: 'M12 3 2 21h20zM12 10v5M12 18v.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
