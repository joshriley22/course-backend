interface HeaderProps {
  codes: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  height: string;
  background: string;
  fontColor: string;
}

export function Header({ codes, currentIndex, onPrev, onNext, height, background, fontColor }: HeaderProps) {

    const code = codes[currentIndex];


  return (
    <header
      style={{
        height: `${height}`,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        color: `${fontColor}`,
        flexShrink: 0,
        userSelect: 'none',
        background:`${background}`,
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
  padding: '0px 8px',
  borderRadius: 6,
  transition: 'color 0.15s',
  lineHeight: 1,
};
