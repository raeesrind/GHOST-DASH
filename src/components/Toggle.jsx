export default function Toggle({ enabled, onChange, size = 'md' }) {
  const w = size === 'sm' ? 36 : 42
  const h = size === 'sm' ? 20 : 24
  const d = size === 'sm' ? 14 : 18
  return (
    <button role="switch" aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="toggle focus:outline-none"
      data-on={String(enabled)}
      style={{ width: w, height: h, borderRadius: h / 2 }}
    >
      <div className="toggle-thumb"
        style={{ width: d, height: d, top: (h - d) / 2, left: enabled ? w - d - 3 : 3 }} />
    </button>
  )
}
