import dagre from '@dagrejs/dagre';
import type { CourseEdgeProps } from '../components/CourseEdge.tsx';
import type { CourseNodeProps } from '../components/CourseNode.tsx';
import { CourseNodeData } from '../components/CourseNode.tsx';

const NODE_W = 80;
const NODE_H = 80;

export const CODE_FILTER_THRESHOLD = 3;

export function getPositionsWithNodeProps(nodes : CourseNodeData[], edgeProps: CourseEdgeProps[] ) : CourseNodeProps[] {
    const codes = new Set(nodes.map((n) => n.getCode()));
    if (codes.size < CODE_FILTER_THRESHOLD) {
        return layout(nodes, edgeProps);
    }

    const props : CourseNodeProps[] = [];
    codes.forEach((code) => {
        const group = nodes.filter((n) => n.getCode() === code);
        const ids = new Set(group.map((n) => n.string()));
        const groupEdges = edgeProps.filter((e) => ids.has(e.source) && ids.has(e.target));
        props.push(...layout(group, groupEdges));
    });
    return props;
}

function layout(nodes : CourseNodeData[], edgeProps: CourseEdgeProps[]) : CourseNodeProps[] {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach(node => {
        graph.setNode(node.string(), { width: NODE_W, height: NODE_H });
    });

    edgeProps.forEach(edge => {
        if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
            graph.setEdge(edge.source, edge.target);
        }
    });

    dagre.layout(graph);

    return nodes.map((n) => {
        const { x, y } = graph.node(n.string());
        return n.getProps(x - NODE_W / 2, y - NODE_H / 2);
    });
}
