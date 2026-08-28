import { BezierEdge, StraightEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { CourseNodeData } from './CourseNode';

export class CourseEdgeData {
    source_code: string
    source_number: string
    source_name: string
    target_code: string
    target_number: string
    target_name: string
    for_course_code?: string | undefined
    for_course_number?: string | undefined
    relationship?: string | undefined

}

export function edgesEqual(edge: CourseEdgeData, other: CourseEdgeData): boolean {
    return edge.source_code === other.source_code &&
        edge.source_number === other.source_number &&
        edge.target_code === other.target_code &&
        edge.target_number === other.target_number
}

export function getForCourseId(edge: CourseEdgeData) : string {
    return `${edge.for_course_code}${edge.for_course_number}`;
    }

export function getEdgeSourceId(edge: CourseEdgeData) : string {
    return `${edge.source_code}${edge.source_number}`;
    }

export function getEdgeTargetId(edge: CourseEdgeData) : string {
    return `${edge.target_code}${edge.target_number}`;
    }

export function getEdgeProps(edge: CourseEdgeData) : CourseEdgeProps {
    return {id: `${getEdgeSourceId(edge)}->${getEdgeTargetId(edge)}`, source: getEdgeSourceId(edge), target: getEdgeTargetId(edge), type: (edge.relationship === undefined) ? 'courseEdge' : 'coPrereqEdge'}
    }

export interface CourseEdgeProps {
    id: string
    source: string
    target: string
    type: string
    }

export function CourseEdge(props: EdgeProps) {
    return <BezierEdge {...props} />;
}

export function CoPrereqEdge(props: EdgeProps) {
    return <StraightEdge {...props} />
    }

export function getSourceNode(edge: CourseEdgeData) : CourseNodeData | null {
    if(edge.source_code !== null) {
        return new CourseNodeData(edge.source_code, edge.source_number, edge.source_name);
       }
    return null;
}

export function getTargetNode(edge: CourseEdgeData) : CourseNodeData | null {
    if(edge.target_code !== null) {
        return new CourseNodeData(edge.target_code, edge.target_number, edge.target_name);
        }
    return null;
}