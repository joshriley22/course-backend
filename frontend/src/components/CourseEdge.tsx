import { CourseNodeData } from './CourseNode';

export interface CourseEdgeData {
    source_code: string
    source_number: string
    source_status: number
    target_code: string
    target_number: string
    target_status: number
    depth: number
}

export function getSourceNode(edge: CourseEdgeData) : CourseNodeData | null {
    if(edge.source_code !== null) {
        return new CourseNodeData(edge.source_code, edge.source_number, edge.depth-1);
       }
    return null;
}

export function getTargetNode(edge: CourseEdgeData) : CourseNodeData | null {
    if(edge.target_code !== null) {
        return new CourseNodeData(edge.target_code, edge.target_number, edge.depth);
        }
    return null;
}