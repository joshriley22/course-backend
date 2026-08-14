import { useRef, useCallback } from 'react';
import type { CSSProperties, PointerEvent } from 'react';

export class CourseNodeData {

    code: string;
    number: string;
    depth: number;

    constructor(code: string, number: string, depth: number) {
        this.code = code;
        this.number = number;
        this.depth = depth;
       }

    equals(other: CourseNodeData): boolean {
        return this.code === other.code && this.number === other.number;
       }

    string(): string {
        return `${this.code}${this.number}`;
       }

    getCode() : string {
        return this.code;
       }

   getNumber() : number {
       return parseInt(this.number, 10);
       }

   getDepth(): number {
        return this.depth;
       }

   getProps(x : number, y : number ): CourseNodeProps {
       return {id : this.string(), type : "courseNode", position : {x, y}, data : {code : this.getCode(), number : this.getNumber().toString() }}
       }

}

    interface CourseData {
        code: string;
        number: string;
    }



    export interface CourseNodeProps {
        id: string;
        type: string;
        position: { x: number; y: number };
        data: CourseData;
        style?: CSSProperties;
    }

export function CourseNode(
    { data, style }: CourseNodeProps) {
    const { code, number } = data;
    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style }}
        >
            <div style={{
                width: '7vh', height: '7vh', borderRadius: '50%',
                cursor: 'grab', textAlign: 'center',
                backgroundColor: 'white', justifyContent: 'center',
                outline: '2px solid black'
            }} />
            <span style={{ zIndex: 100 }}>{code}{number}</span>
        </div>
    );
}
