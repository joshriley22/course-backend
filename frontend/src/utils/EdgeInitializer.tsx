import type { CourseEdgeData, CourseEdgeProps } from '../components/CourseEdge.tsx';
import { getSourceNode, getTargetNode } from'../components/CourseEdge.tsx';

export function getEdgeProps(edges: CourseEdgeData[]) : CourseEdgeProps[] {

    const edgeProps: CourseEdgeProps[] = [];
        for(const edge of edges) {
            if(edge.source_code && edge.target_code) {
                const sourceId = getSourceNode(edge)!.string();
                const targetId = getTargetNode(edge)!.string();
                const edgeProp: CourseEdgeProps = {
                id:`${sourceId}->${targetId}`,
                source: sourceId,
                target: targetId,
                type: "courseEdge"
                 };

             console.log(edgeProp);

                edgeProps.push(edgeProp);
                }
            }
        return edgeProps;
    }