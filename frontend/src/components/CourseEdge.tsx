import { BezierEdge, StraightEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { CourseNodeData } from './CourseNode';

export class CourseEdgeData {
    source_code: string;
    source_number: string;
    source_name: string;
    source_rating: number;
    target_code: string;
    target_number: string;
    target_name: string;
    target_rating: number;
    for_course_code?: string | undefined;
    for_course_number?: string | undefined;
    relationship?: string | undefined;

    constructor(source_code: string, source_number: string, source_name: string, source_rating: number, target_code: string, target_number: string, target_name: string, target_rating: number, for_course_code: string, for_course_number: string, relationship?: string) {
        this.source_code = source_code;
        this.source_number = source_number;
        this.source_name = source_name;
        this.source_rating = source_rating;
        this.target_code = target_code;
        this.target_number = target_number;
        this.target_name = target_name;
        this.target_rating = target_rating;
        this.for_course_code = for_course_code;
        this.for_course_number = for_course_number;
        this.relationship = relationship;
    }


    equals(other: CourseEdgeData): boolean {
    return this.source_code === other.source_code &&
        this.source_number === other.source_number &&
        this.target_code === other.target_code &&
        this.target_number === other.target_number;
}

    getForCourseId() : string {
    return `${this.for_course_code}${this.for_course_number}`;
    }

    getEdgeSourceId(this: CourseEdgeData) : string {
    return `${this.source_code}${this.source_number}`;
    }

    getEdgeTargetId(this: CourseEdgeData) : string {
    return `${this.target_code}${this.target_number}`;
    }

    getEdgeProps() : CourseEdgeProps {
    return {
                id: this.getEdgeSourceId() + '->' + this.getEdgeTargetId()  + ((this.relationship === undefined) ? '' : `For ${this.for_course_code}${this.for_course_number}${this.relationship}`),
                source: this.getEdgeSourceId(),
                target: this.getEdgeTargetId(),
                type: (this.relationship) ? "coprereqEdge" : "courseEdge",
                label: (this.relationship) ? this.relationship.toUpperCase() : "",
                 };
    }
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
        return new CourseNodeData(edge.source_code, edge.source_number, edge.source_name, edge.source_rating);
       }
    return null;
}

export function getTargetNode(edge: CourseEdgeData) : CourseNodeData | null {
    if(edge.target_code !== null) {
        return new CourseNodeData(edge.target_code, edge.target_number, edge.target_name, edge.target_rating);
        }
    return null;
}