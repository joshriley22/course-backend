import { useEffect, useState, useCallback, useRef } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';

import { fetchCodes, fetchCourseEdges } from './api/courses';
import { Header } from './components/Header';
import { CourseNode } from './components/CourseNode';
import { CourseEdge } from './components/CourseEdge';
import { getNodeProps } from './utils/NodeInitializer';
import { getEdgeProps } from './utils/EdgeInitializer';
import { ReactFlow, ReactFlowProvider, useReactFlow, applyNodeChanges } from '@xyflow/react';


function Flow({ nodeProps, edgeProps, nodeTypes, edgeTypes, onNodesChange }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeProps.length > 0) {
      fitView();
    }
  }, [nodeProps, fitView]);

  return <ReactFlow nodes={nodeProps} nodeTypes={nodeTypes} edges={edgeProps} edgeTypes={edgeTypes} onNodesChange={onNodesChange} fitView/>;
}

function App() {
  const [nodeProps, setNodeProps] = useState([]);
  const [edgeProps, setEdgeProps] = useState([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nodeTypes = { courseNode : CourseNode };
  const edgeTypes = { courseEdge : CourseEdge };

  const onNodesChange = useCallback((changes) => setNodeProps((nds) => applyNodeChanges(changes, nds)),
    []);

  useEffect(() => {
    fetchCodes()
      .then((codes) => setCodes(codes))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (codes.length === 0) return;
    fetchCourseEdges(codes[currentIndex])
      .then((edges) => {
          setNodeProps(getNodeProps(edges));
          setEdgeProps(getEdgeProps(edges));
          })
      .catch(console.error);
  }, [codes, currentIndex]);

  const handlePrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex((i) => Math.min(codes.length - 1, i + 1)), [codes.length]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100vw', height: '100vh', gap: '2rem', alignItems: 'center' }}>
      <Header codes={codes} currentIndex={currentIndex} onPrev={handlePrev} onNext={handleNext} />
        <div id='graph-container' style={{ position: 'relative', flex: '1', width: '90vw', height: '90vh' }}>
        <ReactFlowProvider>
          <Flow nodeProps={nodeProps} edgeProps={edgeProps} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} />
        </ReactFlowProvider>
        </div>
    </div>
  );
}

export default App;
