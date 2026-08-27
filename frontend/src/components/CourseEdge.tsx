import { StraightEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { CourseNodeData } from './CourseNode';

export interface CourseEdgeData {
    source_code: string
    source_number: string
    source_name: string
    target_code: string
    target_number: string
    target_name: string
}

export interface CourseEdgeProps {
    id: string
    source: string
    target: string
    type: string
    }

export function CourseEdge(props: EdgeProps) {
    return <StraightEdge {...props} />;
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