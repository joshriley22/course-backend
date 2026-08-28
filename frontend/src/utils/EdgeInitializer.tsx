import type { CourseEdgeProps } from '../components/CourseEdge.tsx';
import { CourseEdgeData, getSourceNode, getTargetNode} from'../components/CourseEdge.tsx';

export function getEdgesProps(edges: CourseEdgeData[]) : CourseEdgeProps[] {

    const edgeProps: CourseEdgeProps[] = [];
        for(const edge of edges) {
            const e = edge instanceof CourseEdgeData ? edge : Object.assign(new CourseEdgeData('','','','','','','',''), edge)
            if(e.source_code && e.target_code) {
                const sourceId = getSourceNode(e)!.string();
                const targetId = getTargetNode(e)!.string();
                const edgeProp: CourseEdgeProps = e.getEdgeProps();

                edgeProps.push(edgeProp);
                }
            }
        return edgeProps;
    }