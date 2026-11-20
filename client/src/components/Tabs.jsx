import { useLayoutEffect, useRef, useState } from 'react';

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(tabs[0].id);
  const [dir, setDir] = useState('none');
  const [pill, setPill] = useState(null);
  const refs = useRef({});
  const current = tabs.find((t) => t.id === active);

  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  const select = (id) => {
    if (id === active) return;
    const from = tabs.findIndex((t) => t.id === active);
    const to = tabs.findIndex((t) => t.id === id);
    setDir(to > from ? 'right' : 'left');
    setActive(id);
  };

  return (
    <>
      <div className="tabs" role="tablist">
        {pill && <span className="tabs-pill" style={{ transform: `translateX(${pill.left - 4}px)`, width: pill.width }} />}
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el; }}
            role="tab"
            aria-selected={t.id === active}
            className={`tab ${t.id === active ? 'active' : ''}`}
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" key={active} className={`tab-panel tab-panel-${dir}`}>{current.render()}</div>
    </>
  );
}
