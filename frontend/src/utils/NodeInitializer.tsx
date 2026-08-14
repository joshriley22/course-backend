import type { CourseNodeProps } from '../components/CourseNode.tsx';
import { CourseNodeData } from '../components/CourseNode.tsx';
import type { CourseEdgeData } from '../components/CourseEdge.tsx';
import { getSourceNode, getTargetNode } from '../components/CourseEdge.tsx';
import { getEdgeProps } from './EdgeInitializer.tsx';
import { getPositionsWithNodeProps } from './NodePositionInitializer.tsx';



export function getNodeProps(edges: CourseEdgeData[], graphWidth: number, graphHeight: number) : CourseNodeProps[] {
    const props : CourseNodeProps[] = [];
    const nodes : CourseNodeData[] = parseNodesFromEdges(edges);
    const edgeProps : CourseEdgeProps[] = getEdgeProps(edges);
    return getPositionsWithNodeProps(nodes, edgeProps);
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

// function getMaxDepth(edges: CourseEdgeData[]) : number {
//     if(!edges || edges.length === 0) {
//         return 0;
//         }
//     return edges[0].depth;
//     }

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

// function getNodesPerDepth(nodes : CourseNodeData[], maxDepth: number) : number[] {
//     const nodesPerDepth : number[] = [];
//     for( let i = 0; i <= maxDepth; i++  ) {
//         nodesPerDepth[i] = 0;
//         }
//     for(const node of nodes) {
//         nodesPerDepth[node.depth]++;
//         }
//
//     return nodesPerDepth;
//     }