import { useEffect, useState, useCallback } from 'react';
import './App.css';

import { fetchCodes, fetchCourseEdges } from './api/courses';
import { Header } from './components/Header';
import { setCourseRanks } from './utils/TreeSetup';

function App() {
  console.log("TEST");
  setCourseRanks(fetchCourseEdges('CS'));


  const [codes, setCodes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCodes()
      .then((c) => setCodes(c))
      .catch(console.error);
  }, []);

  const handlePrev = useCallback(
    () => setCurrentIndex((i) => Math.max(0, i - 1)),
    [],
  );
  const handleNext = useCallback(
    () => setCurrentIndex((i) => Math.min(codes.length - 1, i + 1)),
    [codes.length],
  );

  const currentCode = codes[currentIndex] ?? '';

  return (
    <div className="app">
      <Header
        codes={codes}
        currentIndex={currentIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}

export default App;
