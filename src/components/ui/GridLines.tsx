/** Decorative grid-line texture — same subtle background used on Auth and
 * Dashboard. Render as the first child of a `position: relative` container;
 * give the real content `position: relative, zIndex: 1` so it paints above. */
export function GridLines() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, opacity: 'var(--grid-line-opacity)', pointerEvents: 'none',
        backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      } as React.CSSProperties}
    />
  )
}
