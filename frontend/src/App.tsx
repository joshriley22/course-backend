import { useEffect, useState, useCallback, useRef } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';

import { fetchCodes, fetchCourseEdges, fetchMajors, fetchFields } from './api/courses';
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
  const [majors, setMajors] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [majorIndex, setMajorIndex] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);

  const nodeTypes = { courseNode : CourseNode };
  const edgeTypes = { courseEdge : CourseEdge };

  const onNodesChange = useCallback((changes) => setNodeProps((nds) => applyNodeChanges(changes, nds)),
    []);

  useEffect(() => {
    fetchMajors()
      .then((majors) => setMajors(majors))
      .catch(console.error);
  }, []);

  useEffect(() => {
      if(majors.length == 0) return;
      fetchFields(majors[majorIndex])
        .then((fields) => setFields(fields))
        .catch(console.error);
  }, [majors, majorIndex]);



//    useEffect(() => {
//      if (majors.length === 0) return;
//      fetchCourseEdges(majors[majorIndex])
//        .then((edges) => {
//            setNodeProps(getNodeProps(edges));
//            setEdgeProps(getEdgeProps(edges));
//            })
//        .catch(console.error);
//    }, [majors, majorIndex]);

  const handlePrev = useCallback((set: function) => set((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback((set: function, list: string[]) => set((i) => Math.min(list.length - 1, i + 1)), []);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100vw', height: '100vh', alignItems: 'center' }}>
      <Header codes={majors} currentIndex={majorIndex} onPrev={() => handlePrev(setMajorIndex)} onNext={() => handleNext(setMajorIndex, majors)} height={'60px'} background={'#1e293b'} fontColor={'#ffffff'} />
        <Header codes={fields} currentIndex={fieldIndex} onPrev={() => handlePrev(setFieldIndex)} onNext={() => handleNext(setFieldIndex, fields)} height={'45px'} background={'#ffffff'} fontColor={'2b2727'}/>
        <div id='graph-container' style={{ position: 'relative', flex: '1', width: '90vw', height: '90vh' }}>
        <ReactFlowProvider>
          <Flow nodeProps={nodeProps} edgeProps={edgeProps} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} />
        </ReactFlowProvider>
        </div>
    </div>
  );
}

export default App;
