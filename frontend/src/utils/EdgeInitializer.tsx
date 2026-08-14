import type { CourseEdgeData, CourseEdgeProps } from '../components/CourseEdge.tsx';

export function getEdgeProps(edges: CourseEdgeData[]) : CourseEdgeProps[] {

    const edgeProps: CourseEdgeProps[] = [];
        for(const edge in edges) {
            if(edge.source_code && edge.target_code) {
                const sourceId = edge.source_code + edge.source_number;
                const targetId = edge.target_code + edge.target_number;
                const edgeProp: CourseEdgeProps = {
                source: sourceId,
                target: targetId
                 };

                edgeProps.push(edgeProp);
                }
            }
        return edgeProps;
    }