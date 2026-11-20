export const CHART = {
  primary: '#1d1d1f',
  secondary: '#a1a1a6',
  palette: ['#1d1d1f', '#a1a1a6', '#6e6e73', '#d1d1d6'],
  grid: '#ececf0',
  axis: '#86868b',
  states: { ON: '#34c759', OFF: '#c7c7cc', ERROR: '#ff3b30', OFFLINE: '#ff9f0a' },
};

export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 12 },
  axisLine: false,
  tickLine: false,
};

export const tooltipProps = {
  contentStyle: {
    background: 'rgba(29,29,31,0.92)', border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,.18)', padding: '8px 12px',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: '#d1d1d6', marginBottom: 2 },
  cursor: { fill: 'rgba(0,0,0,0.04)' },
};
