import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import '../App.css';

import { fetchCodes, fetchCourseEdges, fetchCoPrereqEdges, fetchMajorRelEdges, fetchMajors, fetchFields } from '../api/courses';
import { Header } from '../components/Header';
import { CourseNode } from '../components/CourseNode';
import { CourseEdge, CoPrereqEdge } from '../components/CourseEdge';
import { NodeDetails } from '../components/NodeDetails';
import type {CourseDetails} from '../types';
import { getNodeProps } from '../utils/NodeInitializer';
import { getEdgesProps } from '../utils/EdgeInitializer';
import { CODE_FILTER_THRESHOLD } from '../utils/NodePositionInitializer';
import { formatFields } from '../utils/FieldFormatter';
import { useCollisionSimulation } from '../utils/useCollisionSimulation';
import { pageTransition } from '../utils/pageTransition';
import { ReactFlow, ReactFlowProvider, useReactFlow, applyNodeChanges, Background, BackgroundVariant, Controls } from '@xyflow/react';
import './Explore.css';

const edgeTypes = { courseEdge: CourseEdge, coprereqEdge: CoPrereqEdge };
const MAJOR_REL_EDGE_LIMIT = 3;

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
      minZoom={0.2}
      maxZoom={1.5}
    >
      <Background variant={BackgroundVariant.Dots} gap={26} size={1.5} color="var(--gray-300)" />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function Explore() {
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

  const nodeTypes = useMemo(() => ({ courseNode: (props) => <CourseNode {...props} setNodeInfo={setNodeInfo} detailMode={detailMode} setDetailMode={setDetailMode}/>}), [setNodeInfo, detailMode, setDetailMode]);

  const onNodesChange = useCallback((changes) => setNodeProps((nds) => applyNodeChanges(changes, nds)),
    []);

  useEffect(() => {
    fetchMajors()
      .then((majors) => {
          const newMajors = majors.filter(course => course != "Arts & Sciences General Requirements" && course != "Engineering General Requirements")
          newMajors.unshift("Arts & Sciences General Requirements", "Engineering General Requirements");
          setMajors(newMajors);
          })
      .catch(console.error);
  }, []);


  useEffect(() => {
      if(majors.length == 0) return;
      let stale = false;
      fetchFields(majors[majorIndex])
        .then((fields) => { if (!stale) setFields(fields); })
        .catch(console.error);
      setFieldIndex(0);
      return () => { stale = true; };
  }, [majors, majorIndex]);

  const formattedFields = formatFields(fields);

   useEffect(() => {
     if (majors.length === 0 || fields.length === 0) return;
     let stale = false;
     fetchCourseEdges(majors[majorIndex], fields[fieldIndex])
       .then((edges) => {
           if (stale) return;
           setNodeProps(getNodeProps(edges));
           setCourseEdgeProps(getEdgesProps(edges));
           setCodeIndex(0);
           })
       .catch(console.error);
     fetchMajorRelEdges(majors[majorIndex], fields[fieldIndex])
       .then((edges) => { if (!stale) setCoprereqEdgeProps(edges.length < MAJOR_REL_EDGE_LIMIT ? getEdgesProps(edges) : []); })
       .catch(console.error);
     return () => { stale = true; };
   }, [majors, majorIndex, fields, fieldIndex]);

  const handlePrev = useCallback((set, list: string[]) => set((i) => i == 0 ? list.length - 1 : i - 1), []);
  const handleNext = useCallback((set, list: string[]) => set((i) => i == list.length - 1 ? 0 : i + 1), []);

  const codes = useMemo(
    () => Array.from(new Set(nodeProps.map((n) => n.data.code))).sort(),
    [nodeProps],
  );
  const visibleNodeProps = useMemo(
    () => (codes.length >= CODE_FILTER_THRESHOLD ? nodeProps.filter((n) => n.data.code === codes[codeIndex]) : nodeProps),
    [nodeProps, codes, codeIndex],
  );
  const visibleNodeIds = useMemo(() => new Set(visibleNodeProps.map((n) => n.id)), [visibleNodeProps]);
  const visibleEdgeProps = useMemo(
    () => (codes.length >= CODE_FILTER_THRESHOLD ? edgeProps.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)) : edgeProps),
    [edgeProps, codes, visibleNodeIds],
  );

  const { onNodeDragStart, onNodeDrag, onNodeDragStop, layoutTick } = useCollisionSimulation(visibleNodeProps, setNodeProps);

  return (
    <>
            <motion.div id='graph-container' className='main-content flex flex-col items-center full-width full-height' {...pageTransition}>
                  <Header codes={majors} currentIndex={majorIndex} onPrev={() => handlePrev(setMajorIndex, majors)} onNext={() => handleNext(setMajorIndex, majors)} tier='major' />
                  <Header codes={formattedFields} currentIndex={fieldIndex} onPrev={() => handlePrev(setFieldIndex, fields)} onNext={() => handleNext(setFieldIndex, fields)} tier='field' />
                  {codes.length >= CODE_FILTER_THRESHOLD && (
                    <Header codes={codes} currentIndex={codeIndex} onPrev={() => handlePrev(setCodeIndex, codes)} onNext={() => handleNext(setCodeIndex, codes)} tier='code' />
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
        </motion.div>
        <AnimatePresence>
        { detailMode && nodeInfo != null && (
            <NodeDetails key={`${nodeInfo.code}${nodeInfo.number}`} nodeInfo={nodeInfo} onClose={() => setDetailMode(false)} />
            )}
        </AnimatePresence>
    </>
  );
}
