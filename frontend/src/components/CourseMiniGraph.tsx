import { useMemo } from 'react';
import { ReactFlow, Handle, Position } from '@xyflow/react';
import type { CourseDetails, PrerequisiteRelationship } from '../types';
import './CourseMiniGraph.css';

type MiniRole = 'center' | 'prereq' | 'child';

interface MiniNodeData {
  code: string;
  number: string;
  role: MiniRole;
}

function MiniNode({ data }: { data: MiniNodeData }) {
  return (
    <div className={`mini-node mini-node--${data.role}`}>
      <Handle type="target" position={Position.Left} className="mini-node-handle" />
      <span>{data.code} {data.number}</span>
      <Handle type="source" position={Position.Right} className="mini-node-handle" />
    </div>
  );
}

const nodeTypes = { miniCourse: MiniNode };

function courseKey(code: string, number: string) {
  return `${code}${number}`;
}

function uniqueCourses(list: { code: string; number: string }[]): { code: string; number: string }[] {
  const seen = new Map<string, { code: string; number: string }>();
  for (const c of list) {
    if (c.code && c.number) seen.set(courseKey(c.code, c.number), { code: c.code, number: c.number });
  }
  return Array.from(seen.values());
}

function prereqsFromRelationships(prereqs: PrerequisiteRelationship[]): { code: string; number: string }[] {
  const flat: { code: string; number: string }[] = [];
  for (const p of prereqs ?? []) {
    if (p.prereq1_code) flat.push({ code: p.prereq1_code, number: p.prereq1_number });
    if (p.prereq2_code) flat.push({ code: p.prereq2_code, number: p.prereq2_number! });
  }
  return uniqueCourses(flat);
}

const ROW_GAP = 60;
const COLUMN_GAP = 170;

export function CourseMiniGraph({ course }: { course: CourseDetails }) {
  const { nodes, edges } = useMemo(() => {
    const prereqs = prereqsFromRelationships(course.prerequisites);
    const children = uniqueCourses(course.children ?? []);
    const centerId = courseKey(course.code, course.number);
    const rowCount = Math.max(prereqs.length, children.length, 1);
    const centerY = ((rowCount - 1) * ROW_GAP) / 2;

    const nodes = [
      {
        id: centerId,
        type: 'miniCourse',
        position: { x: COLUMN_GAP, y: centerY },
        data: { code: course.code, number: course.number, role: 'center' as MiniRole },
        draggable: false,
        selectable: false,
      },
      ...prereqs.map((p, i) => ({
        id: `prereq-${courseKey(p.code, p.number)}`,
        type: 'miniCourse',
        position: { x: 0, y: i * ROW_GAP },
        data: { code: p.code, number: p.number, role: 'prereq' as MiniRole },
        draggable: false,
        selectable: false,
      })),
      ...children.map((c, i) => ({
        id: `child-${courseKey(c.code, c.number)}`,
        type: 'miniCourse',
        position: { x: COLUMN_GAP * 2, y: i * ROW_GAP },
        data: { code: c.code, number: c.number, role: 'child' as MiniRole },
        draggable: false,
        selectable: false,
      })),
    ];

    const edges = [
      ...prereqs.map((p) => ({
        id: `e-prereq-${courseKey(p.code, p.number)}`,
        source: `prereq-${courseKey(p.code, p.number)}`,
        target: centerId,
        type: 'smoothstep',
        style: { stroke: 'var(--blue-300)', strokeWidth: 1.75 },
      })),
      ...children.map((c) => ({
        id: `e-child-${courseKey(c.code, c.number)}`,
        source: centerId,
        target: `child-${courseKey(c.code, c.number)}`,
        type: 'smoothstep',
        style: { stroke: 'var(--blue-300)', strokeWidth: 1.75 },
      })),
    ];

    return { nodes, edges };
  }, [course]);

  return (
    <div className="mini-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
      />
    </div>
  );
}
