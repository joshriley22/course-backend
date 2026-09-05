import './Header.css';

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
      className='header-bar flex items-center justify-center'
      style={{ height: `${height}`, color: `${fontColor}`, background: `${background}` }}
    >
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        aria-label="Previous department"
        className='header-arrow'
      >
        ←
      </button>

      <span className='header-label'>
        {code}
      </span>

      <button
        onClick={onNext}
        disabled={currentIndex >= codes.length - 1}
        aria-label="Next department"
        className='header-arrow'
      >
        →
      </button>
    </header>
  );
}
