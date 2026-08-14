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

    return nodes.map((n) => {
        const { x, y } = graph.node(n.string());
        return n.getProps(x - NODE_W / 2, y - NODE_H / 2);
     });

    }