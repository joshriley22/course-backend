import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';

export class CourseNodeData {

    code: string;
    number: string;
    name: string;

    constructor(code: string, number: string, name: string, rating: number) {
        this.code = code;
        this.number = number;
        this.name = name;
        this.rating = rating;
       }

    equals(other: CourseNodeData): boolean {
        return this.code === other.code && this.number === other.number;
       }

    string(): string {
        return `${this.code}${this.number}`;
       }

    getId() : string {
        return string();
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
       return {id : this.string(), type : "courseNode", position : {x, y}, data : { code: this.code, number: this.number, name: this.name, rating: this.rating }}
       }

}

    interface CourseData {
        code: string;
        number: string;
        name: string;
        rating: number;
    }



    export interface CourseNodeProps {
        id: string;
        type: string;
        position: { x: number; y: number };
        data: CourseData;
        style?: CSSProperties;
        measured?: { width?: number; height?: number };
    }

const HOVER_Z_INDEX = 1000;

export function CourseNode(
    { id, data }: CourseNodeProps) {
    const { code, number, name, rating } = data;

    const [opened, setOpened] = useState<boolean>(false);
    const { updateNode } = useReactFlow();

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
        >
        <MotionConfig transition={{ ease: 'easeOut', duration: 0.3 }}>
            <motion.div style={{
                display: 'flex', position: 'relative', borderRadius: '25%',
                width: '250px',
                cursor: 'grab', alignItems: 'center',
                backgroundColor: 'white', justifyContent: 'center',
                outline: '2px solid #414141',
            }} animate={{ height: opened ? 220 : 100 }}
               onHoverStart={ () => {
                   setOpened(true);
                   updateNode(id, (node) => ({ style: { ...node.style, zIndex: HOVER_Z_INDEX } }));
               } }
               onHoverEnd={ () => {
                   setOpened(false);
                   updateNode(id, (node) => {
                       const { zIndex: _zIndex, ...style } = node.style ?? {};
                       return { style };
                   });
               } } >


            <Handle type="target" style={{visibility:'hidden'}} position={Position.Top} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'absolute', padding: '15px', top: '0', zIndex: 200, fontWeight: 500, fontSize: '16px' }}>
                <div>
                    <span>{name}<br></br>({code} {number})</span>
                </div>
                <div style={{flexShrink: '0'}}>
                    <span>{rating}/5</span>
                </div>
            </div>
            <Handle type="source" style={{visibility:'hidden'}} position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
