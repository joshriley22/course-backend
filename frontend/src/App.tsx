import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';

import { fetchCodes, fetchCourseEdges, fetchCoPrereqEdges, fetchMajors, fetchFields } from './api/courses';
import { LoginPanel } from './components/LoginPanel';
import { Header } from './components/Header';
import { CourseNode } from './components/CourseNode';
import { CourseEdge, CoPrereqEdge } from './components/CourseEdge';
import type {FieldDetails, CourseData, CourseDetails} from './types';
import { getNodeProps } from './utils/NodeInitializer';
import { getEdgesProps } from './utils/EdgeInitializer';
import { formatFields } from './utils/FieldFormatter';
import {  formatPrerequisites } from './utils/PrerequisiteFormatter';
import { useCollisionSimulation } from './utils/useCollisionSimulation';
import { ReactFlow, ReactFlowProvider, useReactFlow, applyNodeChanges } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';

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
  const [codeIndex, setCodeIndex] = useState(0);
  const [nodeInfo, setNodeInfo] = useState<CourseDetails | null>(null);
  const [detailMode, setDetailMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const nodeTypes = useMemo(() => ({ courseNode: (props) => <CourseNode {...props} setNodeInfo={setNodeInfo} detailMode={detailMode} setDetailMode={setDetailMode}/>}), [setNodeInfo, detailMode, setDetailMode]);
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
     if (majors.length === 0 || fields.length === 0) return;
     fetchCourseEdges(majors[majorIndex], fields[fieldIndex])
       .then((edges) => {
           setNodeProps(getNodeProps(edges));
           setCourseEdgeProps(getEdgesProps(edges));
           setCodeIndex(0);
           })
       .catch(console.error);
   }, [majors, majorIndex, fields, fieldIndex]);

  const handlePrev = useCallback((set, list: string[]) => set((i) => i == 0 ? list.length - 1 : i - 1), []);
  const handleNext = useCallback((set, list: string[]) => set((i) => i == list.length - 1 ? 0 : i + 1), []);

  const codes = useMemo(
    () => Array.from(new Set(nodeProps.map((n) => n.data.code))).sort(),
    [nodeProps],
  );
  const visibleNodeProps = useMemo(
    () => (codes.length >= 5 ? nodeProps.filter((n) => n.data.code === codes[codeIndex]) : nodeProps),
    [nodeProps, codes, codeIndex],
  );
  const visibleNodeIds = useMemo(() => new Set(visibleNodeProps.map((n) => n.id)), [visibleNodeProps]);
  const visibleEdgeProps = useMemo(
    () => (codes.length >= 5 ? edgeProps.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)) : edgeProps),
    [edgeProps, codes, visibleNodeIds],
  );

  const { onNodeDragStart, onNodeDrag, onNodeDragStop, layoutTick } = useCollisionSimulation(visibleNodeProps, setNodeProps);

  return (
    <>
   {!loggedIn && (<LoginPanel setLoggedIn={setLoggedIn} />)}
        { loggedIn && (
            <div id='body-container' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh' }}>

             <div id='sidebar' style={{ height: '100%', flex: '0.125', backgroundColor: '#ffffff'}}>PLACEHOLDER</div>
            <div id='graph-container' style={{ display: 'flex', flexDirection: 'column', flex: '0.875', alignItems: 'center', width: '100%', height: '100%' }}>
                  <Header codes={majors} currentIndex={majorIndex} onPrev={() => handlePrev(setMajorIndex, majors)} onNext={() => handleNext(setMajorIndex, majors)} height={'60px'} background={'#1e293b'} fontColor={'#ffffff'} />
                  <Header codes={formattedFields} currentIndex={fieldIndex} onPrev={() => handlePrev(setFieldIndex, fields)} onNext={() => handleNext(setFieldIndex, fields)} height={'45px'} background={'#ffffff'} fontColor={'2b2727'}/>
                  {codes.length >= 5 && (
                    <Header codes={codes} currentIndex={codeIndex} onPrev={() => handlePrev(setCodeIndex, codes)} onNext={() => handleNext(setCodeIndex, codes)} height={'40px'} background={'#f1f5f9'} fontColor={'#1e293b'}/>
                  )}
                  <ReactFlowProvider>
                      <Flow
                        nodeProps={visibleNodeProps}
                        edgeProps={visibleEdgeProps}
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
        { detailMode && nodeInfo != null && (
            <MotionConfig transition={{ ease: 'easeInOut', duration: '0.4' }}>
            <motion.div style={{width: '30%', height: '100%', position: 'absolute', top: '105px', right:'-30%', backgroundColor: '#ffffff', zOrder: '1000'}} initial={{ opacity: 1}} animate={{ opacity: 1, x: '-100%' }}>
                <h1>{nodeInfo?.name}</h1>
                <h2>{nodeInfo?.code} {nodeInfo?.number}</h2>
                <p>Credits: {nodeInfo?.credits}</p>
                <p>Satisfies: {nodeInfo?.fields.map((field : FieldDetails) => `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} for ${field.major_name}`).join(', ')}</p>
                <p>Prerequisites: {formatPrerequisites(nodeInfo?.prerequisites)}</p>
                <p>Children: {nodeInfo?.children.map((child : CourseData) => `${child.code} ${child.number}`).join(', ')}</p>
                <button>Create Review</button>
                <button onClick={() => {setDetailMode(false); setNodeInfo(null)}}>Close</button>
            </motion.div>
            </MotionConfig>
            )}
    </div> )}
    </>
  );
}

export default App;
