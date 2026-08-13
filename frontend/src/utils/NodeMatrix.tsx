import type { CourseEdgeData } from '../components/CourseEdge';
import { getSourceNode, getTargetNode } from '../components/CourseEdge';
import type { CourseNodeData } from '../components/CourseNode';

export function setNodeMatrix(edges: CourseEdgeData[], course_code: string) : CourseNodeData[][] {
    const nodes : CourseNodeData[] = [];
    const nodePos: CourseNodeData[][] = [];

    console.log(edges);

    nodePos.push([]);

    for (const edge of edges) {
        const depth = edge.depth;
        const source : CourseNodeData = getSourceNode(edge);
        const target : CourseNodeData = getTargetNode(edge);

        if(target !== null) {
            while(target.getDepth() >= nodePos.length) {
                nodePos.push([]);
                }
            if(!contains(nodes, target)) {
                nodePos[target.getDepth()].push(target);
                nodes.push(target);
                }
            }

        if(!contains(nodes, source)) {
                nodePos[source.getDepth()].push(source);
                nodes.push(source);
            }


    }

    return nodePos;

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


