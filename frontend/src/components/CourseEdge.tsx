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

export function getSourceNode(edge: CourseEdgeData) : CourseNodeData {
    return {
        code: edge.source_code,
        number: edge.source_number,
        elective_status: edge.source_status
        }
    }


export function getTargetNode(edge: CourseEdgeData) : CourseNodeData {
    return {
        code: edge.target_code,
        number: edge.target_number,
        elective_status: edge.target_status
        }
    }