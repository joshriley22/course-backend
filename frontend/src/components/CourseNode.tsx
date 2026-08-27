import { useRef, useCallback } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Position, Handle } from '@xyflow/react';
import { motion } from 'framer-motion';

export class CourseNodeData {

    code: string;
    number: string;
    name: string;

    constructor(code: string, number: string, name: string) {
        this.code = code;
        this.number = number;
        this.name = name;
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

   getName(): string {
        return this.name;
       }

   getProps(x : number, y : number ): CourseNodeProps {
       return {id : this.string(), type : "courseNode", position : {x, y}, data : { name: this.name }}
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
    const { name } = data;
    return (
        <motion.div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style }} whileHover= {{scale: 1.1}}
        >
            <div style={{
                display: 'flex', minWidth: '7vh', minHeight: '5vh', borderRadius: '25%',
                width: 'fit-content', gap: '10px', padding: '15px',
                cursor: 'grab', alignItems: 'center',
                backgroundColor: 'white', justifyContent: 'center',
                outline: '2px solid #414141'
            }} >


            <Handle type="target" style={{visibility:'hidden'}} position={Position.Top} />
            <span style={{ zIndex: 100, fontWeight: 400, fontSize: '16px'}} >{name}</span>
            <Handle type="source" style={{visibility:'hidden'}} position={Position.Bottom} />
            </div>

        </motion.div>
    );
}
