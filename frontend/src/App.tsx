import { useEffect, useState, useCallback, useRef } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';

import { fetchCodes, fetchCourseEdges, fetchCoPrereqEdges, fetchMajors, fetchFields } from './api/courses';
import { Header } from './components/Header';
import { CourseNode } from './components/CourseNode';
import { CourseEdge, CoPrereqEdge } from './components/CourseEdge';
import { getNodeProps } from './utils/NodeInitializer';
import { getEdgesProps } from './utils/EdgeInitializer';
import { formatFields } from './utils/FieldFormatter';
import { ReactFlow, ReactFlowProvider, useReactFlow, applyNodeChanges } from '@xyflow/react';
import { useCollisionSimulation } from './utils/useCollisionSimulation';


function Flow({ nodeProps, edgeProps, nodeTypes, edgeTypes, onNodesChange, onNodeDragStart, onNodeDrag, onNodeDragStop, layoutTick }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeProps.length > 0) {
      fitView();
    }
    // Re-fit throughout the collision pass (throttled in
    // useCollisionSimulation) so the camera tracks the growing layout
    // bounds instead of jumping once at the end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutTick, fitView]);

  return (
    <ReactFlow
      nodes={nodeProps}
      nodeTypes={nodeTypes}
      edges={edgeProps}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      fitView
    />
  );
}

function App() {
  const [nodeProps, setNodeProps] = useState([]);
  const [courseEdgeProps, setCourseEdgeProps] = useState([]);
  const [coprereqEdgeProps, setCoprereqEdgeProps] = useState([]);
  const edgeProps = courseEdgeProps.concat(coprereqEdgeProps);
  const [majors, setMajors] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [majorIndex, setMajorIndex] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);

  const nodeTypes = { courseNode : CourseNode };
  const edgeTypes = { courseEdge : CourseEdge, coprereqEdge : CoPrereqEdge };

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
      setFieldIndex(0);
  }, [majors, majorIndex]);

  const formattedFields = formatFields(fields);


   useEffect(() => {
     if (majors.length === 0) return;
     fetchCourseEdges(majors[majorIndex], fields[fieldIndex])
       .then((edges) => {
           setNodeProps(getNodeProps(edges));
           setCourseEdgeProps(getEdgesProps(edges));
           })
       .catch(console.error);
   }, [majors, majorIndex, fields, fieldIndex]);

   useEffect(() => {
     if (majors.length === 0 || fields.length === 0) return;
     fetchCoPrereqEdges(majors[majorIndex], fields[fieldIndex])
       .then((coprereqEdges) => {
         setCoprereqEdgeProps(getEdgesProps(coprereqEdges));
       })
       .catch(console.error);
   }, [majors, majorIndex, fields, fieldIndex]);

  const handlePrev = useCallback((set, list: string[]) => set((i) => i == 0 ? list.length - 1 : i - 1), []);
  const handleNext = useCallback((set, list: string[]) => set((i) => i == list.length - 1 ? 0 : i + 1), []);

  const { onNodeDragStart, onNodeDrag, onNodeDragStop, layoutTick } = useCollisionSimulation(nodeProps, setNodeProps);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100vw', height: '100vh', alignItems: 'center' }}>
      <Header codes={majors} currentIndex={majorIndex} onPrev={() => handlePrev(setMajorIndex, majors)} onNext={() => handleNext(setMajorIndex, majors)} height={'60px'} background={'#1e293b'} fontColor={'#ffffff'} />
        <Header codes={formattedFields} currentIndex={fieldIndex} onPrev={() => handlePrev(setFieldIndex, fields)} onNext={() => handleNext(setFieldIndex, fields)} height={'45px'} background={'#ffffff'} fontColor={'2b2727'}/>
        <div id='graph-container' style={{ position: 'relative', flex: '1', width: '90vw', height: '90vh' }}>
        <ReactFlowProvider>
          <Flow
            nodeProps={nodeProps}
            edgeProps={edgeProps}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            layoutTick={layoutTick}
          />
        </ReactFlowProvider>
        </div>
    </div>
  );
}

export default App;
