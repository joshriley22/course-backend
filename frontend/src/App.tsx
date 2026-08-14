import { useEffect, useState, useCallback, useRef } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';

import { fetchCodes, fetchCourseEdges } from './api/courses';
import { Header } from './components/Header';
import { CourseNode } from './components/CourseNode';
import { getNodeProps } from './utils/NodeInitializer';
import { getEdgeProps } from './utils/EdgeInitializer';
import { ReactFlow } from '@xyflow/react';
import dagre from '@dagrejs/dagre';


function App() {
  const [nodeProps, setNodeProps] = useState([]);
  const [edgeProps, setEdgeProps] = useState([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const nodeTypes = { courseNode : CourseNode };

  useEffect(() => {
    fetchCodes()
      .then((codes) => setCodes(codes))
      .catch(console.error);
  }, []);

  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (codes.length === 0) return;
    const graph = graphRef.current;
    if (!graph) return;
    const graphWidth = graph.offsetWidth;
    const graphHeight = graph.offsetHeight;
    fetchCourseEdges(codes[currentIndex])
      .then((edges) => {
          setNodeProps(getNodeProps(edges, graphWidth, graphHeight));
          setEdgeProps(getEdgeProps(edges));
          })
      .catch(console.error);
  }, [codes, currentIndex]);

  const handlePrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex((i) => Math.min(codes.length - 1, i + 1)), [codes.length]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100vw', height: '100vh', gap: '2rem', alignItems: 'center' }}>
      <Header codes={codes} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />
        <div id='graph-container' ref={graphRef} style={{ position: 'relative', flex: '1', width: '90vw', height: '90vh' }}>
        <ReactFlow nodes={nodeProps} nodeTypes={nodeTypes}/>
        </div>
    </div>
  );
}

export default App;
