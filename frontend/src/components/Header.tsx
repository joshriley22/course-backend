interface HeaderProps {
  codes: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function Header({ codes, currentIndex, onPrev, onNext }: HeaderProps) {
  const code = codes[currentIndex] ?? '…';

  return (
    <header
      style={{
        height: 60,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: '#1e293b',
        color: '#f1f5f9',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        aria-label="Previous department"
        style={arrowStyle}
      >
        ←
      </button>

      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.05em',
          minWidth: 80,
          textAlign: 'center',
        }}
      >
        {code}
      </span>

      <button
        onClick={onNext}
        disabled={currentIndex >= codes.length - 1}
        aria-label="Next department"
        style={arrowStyle}
      >
        →
      </button>
    </header>
  );
}

const arrowStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  fontSize: 22,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 6,
  transition: 'color 0.15s',
  lineHeight: 1,
};
