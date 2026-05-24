import { graphlib, layout as dagreLayout } from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { CourseEdge } from '../types';

const NODE_W = 84;
const NODE_H = 84;
const CROSS_DEPT_X_OFFSET = 320; // px to the left of the leftmost same-dept node

export function computeLayout(
  apiEdges: CourseEdge[],
  deptCode: string,
): { nodes: Node[]; edges: Edge[] } {
  if (apiEdges.length === 0) return { nodes: [], edges: [] };

  // ── 1. Collect unique nodes ──────────────────────────────────────────────
  const nodeMap = new Map<
    string,
    { code: string; number: string; isCrossDept: boolean }
  >();

  for (const e of apiEdges) {
    const srcId = `${e.source_code}-${e.source_number}`;
    const tgtId = `${e.target_code}-${e.target_number}`;
    nodeMap.set(srcId, {
      code: e.source_code,
      number: e.source_number,
      isCrossDept: e.source_code !== deptCode,
    });
    nodeMap.set(tgtId, {
      code: e.target_code,
      number: e.target_number,
      isCrossDept: e.target_code !== deptCode,
    });
  }

  // ── 2. Build dagre graph ─────────────────────────────────────────────────
  const g = new graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    ranksep: 120,
    nodesep: 70,
    marginx: 40,
    marginy: 40,
  });

  for (const id of nodeMap.keys()) {
    g.setNode(id, { width: NODE_W, height: NODE_H });
  }

  // Deduplicate edges before adding to dagre
  const edgeSet = new Set<string>();
  for (const e of apiEdges) {
    const key = `${e.source_code}-${e.source_number}→${e.target_code}-${e.target_number}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      g.setEdge(
        `${e.source_code}-${e.source_number}`,
        `${e.target_code}-${e.target_number}`,
      );
    }
  }

  dagreLayout(g);

  // ── 3. Find leftmost x among same-dept nodes ─────────────────────────────
  let minSameDeptX = Infinity;
  for (const [id, data] of nodeMap) {
    if (!data.isCrossDept) {
      const { x } = g.node(id);
      if (x < minSameDeptX) minSameDeptX = x;
    }
  }
  const crossDeptX = minSameDeptX - CROSS_DEPT_X_OFFSET;

  // ── 4. Build React Flow nodes ────────────────────────────────────────────
  const rfNodes: Node[] = [];
  for (const [id, data] of nodeMap) {
    const dagreNode = g.node(id);
    const x = data.isCrossDept ? crossDeptX : dagreNode.x;
    const y = dagreNode.y;
    rfNodes.push({
      id,
      type: 'courseNode',
      position: { x: x - NODE_W / 2, y: y - NODE_H / 2 },
      data: {
        code: data.code,
        number: data.number,
        isCrossDept: data.isCrossDept,
      },
    });
  }

  // ── 5. Build React Flow edges (deduplicated) ─────────────────────────────
  const rfEdges: Edge[] = [];
  const addedEdges = new Set<string>();
  for (const e of apiEdges) {
    const key = `${e.source_code}-${e.source_number}→${e.target_code}-${e.target_number}`;
    if (!addedEdges.has(key)) {
      addedEdges.add(key);
      rfEdges.push({
        id: `edge-${key}`,
        source: `${e.source_code}-${e.source_number}`,
        target: `${e.target_code}-${e.target_number}`,
        type: 'smoothstep',
      });
    }
  }

  return { nodes: rfNodes, edges: rfEdges };
}
