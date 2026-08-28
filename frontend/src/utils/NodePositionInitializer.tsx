import dagre from '@dagrejs/dagre';
import type { CourseEdgeProps } from '../components/CourseEdge.tsx';
import type { CourseNodeProps } from '../components/CourseNode.tsx';
import { CourseNodeData } from '../components/CourseNode.tsx';

const NODE_W = 80;
const NODE_H = 80;

export function getPositionsWithNodeProps(nodes : CourseNodeData[], edgeProps: CourseEdgeProps[] ) : CourseNodeProps[] {

    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(node => {
        graph.setNode(node.string(), { width: NODE_W, height: NODE_H });
    });

    edgeProps.forEach(edge => {
        graph.setEdge(edge.source, edge.target);
    });

    dagre.layout(graph);

    const graphCenterX = graph.graph().width! / 2;

    const positioned = nodes.map((n) => {
        const { x, y } = graph.node(n.string());
        const row = parseInt(n.number, 10) >= 4000 ? 1 : 0;
        return { n, x, y: y + row * NODE_H * 2, row };
    });

    const rows = new Map<number, typeof positioned>();
    positioned.forEach((p) => {
        const bucket = rows.get(p.row) ?? [];
        bucket.push(p);
        rows.set(p.row, bucket);
    });

    rows.forEach((rowNodes) => {
        const minX = Math.min(...rowNodes.map((p) => p.x));
        const maxX = Math.max(...rowNodes.map((p) => p.x));
        const rowCenterX = (minX + maxX) / 2;
        const shift = graphCenterX - rowCenterX;
        rowNodes.forEach((p) => (p.x += shift));
    });

    return positioned.map((p) => p.n.getProps(p.x - NODE_W / 2, p.y - NODE_H / 2));

    }