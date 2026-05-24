import { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { fetchCourseEdges } from '../api/courses';
import { computeLayout } from '../utils/layout';
import { CourseNode } from './CourseNode';

const nodeTypes = { courseNode: CourseNode };

interface CourseTreeProps {
  deptCode: string;
}

export function CourseTree({ deptCode }: CourseTreeProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deptCode) return;
    setLoading(true);
    setError(null);

    fetchCourseEdges(deptCode)
      .then((apiEdges) => {
        const { nodes: n, edges: e } = computeLayout(apiEdges, deptCode);
        setNodes(n);
        setEdges(e);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [deptCode]);

  // Re-fit the view whenever the code (and therefore node set) changes.
  // We accomplish this by changing the key, which remounts ReactFlow cleanly.
  const flowKey = useMemo(() => deptCode, [deptCode]);

  if (loading) {
    return (
      <div style={centerStyle}>
        <span style={{ color: '#64748b', fontSize: 16 }}>Loading {deptCode} tree…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <span style={{ color: '#ef4444', fontSize: 16 }}>{error}</span>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div style={centerStyle}>
        <span style={{ color: '#64748b', fontSize: 16 }}>
          No prerequisite data for <strong>{deptCode}</strong>.
        </span>
      </div>
    );
  }

  return (
    <ReactFlow
      key={flowKey}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.05}
      maxZoom={3}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
    >
      <Background color="#cbd5e1" gap={20} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

const centerStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
