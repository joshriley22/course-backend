import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import '../App.css';

import { fetchCodes, fetchCourseEdges, fetchCoPrereqEdges, fetchMajorNames, fetchFields, fetchScheduleCourse, fetchCourseInfo } from '../api/courses';
import { Header } from '../components/Header';
import { MajorSearch } from '../components/MajorSearch';
import { CourseNode } from '../components/CourseNode';
import type { CourseNodeProps } from '../components/CourseNode';
import { GraphActions } from '../components/GraphActions';
import type { GraphActionsValue } from '../components/GraphActions';
import { CourseEdge, CoPrereqEdge } from '../components/CourseEdge';
import { NodeDetails } from '../components/NodeDetails';
import { SessionPicker } from '../components/SessionPicker';
import { SelectedCoursesList } from '../utils/SelectedCoursesList';
import type { CourseDetails, EligibleCourse, EligibleCourseSession } from '../types';
import { getNodeProps } from '../utils/NodeInitializer';
import { getEdgesProps } from '../utils/EdgeInitializer';
import { CODE_FILTER_THRESHOLD } from '../utils/NodePositionInitializer';
import { formatFields } from '../utils/FieldFormatter';
import { useCollisionSimulation } from '../utils/useCollisionSimulation';
import { pageTransition } from '../utils/pageTransition';
import { ReactFlow, ReactFlowProvider, useReactFlow, applyNodeChanges, Background, BackgroundVariant, Controls } from '@xyflow/react';
import './Explore.css';

const edgeTypes = { courseEdge: CourseEdge, coprereqEdge: CoPrereqEdge };
// Module-level so its identity never changes; a new nodeTypes object makes
// React Flow remount every node and lose keyboard focus.
const nodeTypes = { courseNode: CourseNode };

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
      // Keyboard: prerequisite lines aren't actionable, so keep them out of the Tab order,
      // and don't let Backspace delete courses from the graph.
      edgesFocusable={false}
      deleteKeyCode={null}
    >
      <Background variant={BackgroundVariant.Dots} gap={26} size={1.5} color="var(--gray-300)" />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function Explore() {
  const [nodeProps, setNodeProps] = useState([]);
  const [edgeProps, setEdgeProps] = useState([]);
  const [majors, setMajors] = useState<string[]>([]);
  // Major name -> long name, so the search matches either ("CS" or "Computer Science")
  const [longNames, setLongNames] = useState<Record<string, string>>({});
  const [fields, setFields] = useState<string[]>([]);
  // Credits each field needs, aligned with `fields`
  const [credits, setCredits] = useState<number[]>([]);
  const [majorIndex, setMajorIndex] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [nodeInfo, setNodeInfo] = useState<CourseDetails | null>(null);
  const [detailMode, setDetailMode] = useState(false);

  const [sessionChoice, setSessionChoice] = useState<EligibleCourse | null>(null);

  // Load every session the course offers, then let the user pick before anything is added.
  const handleAddToSchedule = useCallback((course: { code: string; number: string }) => {
    fetchScheduleCourse(course.code, course.number)
      .then(setSessionChoice)
      .catch(console.error);
  }, []);

  const handleSessionsChosen = useCallback((sessions: EligibleCourseSession[]) => {
    if (sessionChoice) SelectedCoursesList.getInstance().addCourse(sessionChoice, sessions);
    setSessionChoice(null);
  }, [sessionChoice]);

  const graphActions = useMemo<GraphActionsValue>(() => ({
    openDetails: (course) => {
      fetchCourseInfo(course.code, course.number)
        .then((info) => { setNodeInfo(info); setDetailMode(true); })
        .catch(() => console.error('Failed to retrieve course info'));
    },
    addToSchedule: handleAddToSchedule,
  }), [handleAddToSchedule]);

  const onNodesChange = useCallback((changes) => setNodeProps((nds) => applyNodeChanges(changes, nds)),
    []);

  useEffect(() => {
    fetchMajorNames()
      .then((majorNames) => {
          const newMajors = majorNames.map((m) => m.name).filter(course => course != "Arts & Sciences General Requirements" && course != "Engineering General Requirements")
          newMajors.unshift("Arts & Sciences General Requirements", "Engineering General Requirements");
          setMajors(newMajors);
          setLongNames(Object.fromEntries(majorNames.map((m) => [m.name, m.longName])));
          })
      .catch(console.error);
  }, []);


  useEffect(() => {
      if(majors.length == 0) return;
      let stale = false;
      fetchFields(majors[majorIndex])
        .then(({ fields, credits }) => {
            if (stale) return;
            setFields(fields);
            setCredits(credits);
        })
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
           setEdgeProps(getEdgesProps(edges));
           setCodeIndex(0);
           })
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
  // Tab order follows DOM order, which follows this array: sort top-to-bottom,
  // then left-to-right so keyboard focus reads the graph in rows. The rank is
  // taken from the initial layout and only recomputed when the set of nodes
  // changes; re-sorting on every collision tick would shuffle DOM nodes and
  // could knock focus off the node the user is on.
  const nodeIdKey = (visibleNodeProps as CourseNodeProps[]).map((n) => n.id).join('|');
  const nodeRank = useMemo(() => {
    const sorted = [...(visibleNodeProps as CourseNodeProps[])].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
    return new Map(sorted.map((n, i) => [n.id, i]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeIdKey]);
  const orderedNodeProps = useMemo(
    () => [...visibleNodeProps].sort((a, b) => (nodeRank.get(a.id) ?? 0) - (nodeRank.get(b.id) ?? 0)),
    [visibleNodeProps, nodeRank],
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
                  <Header codes={majors} currentIndex={majorIndex} onPrev={() => handlePrev(setMajorIndex, majors)} onNext={() => handleNext(setMajorIndex, majors)} tier='major'>
                    <MajorSearch majors={majors} longNames={longNames} onSelect={(major) => setMajorIndex(majors.indexOf(major))} />
                  </Header>
                  <Header codes={formattedFields} currentIndex={fieldIndex} onPrev={() => handlePrev(setFieldIndex, fields)} onNext={() => handleNext(setFieldIndex, fields)} tier='field' />
                  {codes.length >= CODE_FILTER_THRESHOLD && (
                    <Header codes={codes} currentIndex={codeIndex} onPrev={() => handlePrev(setCodeIndex, codes)} onNext={() => handleNext(setCodeIndex, codes)} tier='code' />
                  )}
                  <ReactFlowProvider>
                    <GraphActions.Provider value={graphActions}>
                      <Flow
                        nodeProps={orderedNodeProps}
                        edgeProps={visibleEdgeProps}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onNodeDragStart={onNodeDragStart}
                        onNodeDrag={onNodeDrag}
                        onNodeDragStop={onNodeDragStop}
                        layoutTick={layoutTick}
                      />
                    </GraphActions.Provider>
                </ReactFlowProvider>
                  {credits[fieldIndex] != null && (
                    <div className='field-credits' aria-label={`${credits[fieldIndex]} credits needed for this field`}>
                      <span className='field-credits-value'>{credits[fieldIndex]}</span>
                      <span className='field-credits-label'>credits required</span>
                    </div>
                  )}
        </motion.div>
        <AnimatePresence>
        { detailMode && nodeInfo != null && (
            <NodeDetails key={`${nodeInfo.code}${nodeInfo.number}`} nodeInfo={nodeInfo} onClose={() => setDetailMode(false)} />
            )}
        </AnimatePresence>
        <AnimatePresence>
        { sessionChoice != null && (
            <SessionPicker course={sessionChoice} onChoose={handleSessionsChosen} onClose={() => setSessionChoice(null)} />
            )}
        </AnimatePresence>
    </>
  );
}
