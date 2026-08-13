import { setNodeMatrix } from './NodeMatrix.tsx';
import type { CourseNodeProps } from '../components/CourseNode.tsx';
import { CourseNodeData } from '../components/CourseNode.tsx';
import type { CourseEdgeData } from '../components/CourseEdge.tsx';
import { getSourceNode, getTargetNode } from '../components/CourseEdge.tsx';



export function getNodeProps(edges: CourseEdgeData[], graphWidth: number, graphHeight: number) : CourseNodeProps[] {
    const props : CourseNodeProps[] = [];
    const nodes : CourseNodeData[] = parseNodesFromEdges(edges);
    const maxDepth = getMaxDepth(edges);
    const nodesPerDepth = getNodesPerDepth(nodes, maxDepth);
    const nodesPlacedPerRow = [];
    for(let i = 0; i < maxDepth; i++) {
        nodesPlacedPerRow[i] = 0;
    }
    for(const node of nodes) {
        const xPosition = Number((nodesPlacedPerRow[node.depth] / nodesPerDepth[node.depth]) * graphWidth);
        const yPosition = Number((node.depth/maxDepth) * graphHeight);
        props.push(node.getProps(xPosition, yPosition));
        }
    return props;
    }

function parseNodesFromEdges(edges: CourseEdgeData[]) : CourseNodeData[] {
    const nodes : CourseNodeData[] = [];
    for(const edge of edges) {
        const source = getSourceNode(edge);
        const target = getTargetNode(edge);

        if(!contains(nodes, source) && source !== null) {
            nodes.push(source);
        }

        if(!contains(nodes, target) && target !== null) {
            nodes.push(target);
        }

    }
    return nodes;
}

function getMaxDepth(edges: CourseEdgeData[]) : number {
    if(!edges || edges.length === 0) {
        return 0;
        }
    return edges[0].depth;
    }

function contains(list : CourseNodeData[], node : CourseNodeData) :  boolean {
    if(node === null) {
        return false;
    }
    for(const n of list as CourseNodeData[]) {
        if(n.equals(node)) {
            return true;
        }
    }
    return false;
}

function getNodesPerDepth(nodes : CourseNodeData[], maxDepth: number) : number[] {
    const nodesPerDepth : number[] = [];
    for( let i = 0; i <= maxDepth; i++  ) {
        nodesPerDepth[i] = 0;
        }
    for(const node of nodes) {
        nodesPerDepth[node.depth]++;
        }

    return nodesPerDepth;
    }