import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';

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
       return {id : this.string(), type : "courseNode", position : {x, y}, data : { code: this.code, number: this.number,name: this.name }}
       }

}

    interface CourseData {
        code: string;
        number: string;
        name: string;
    }



    export interface CourseNodeProps {
        id: string;
        type: string;
        position: { x: number; y: number };
        data: CourseData;
        style?: CSSProperties;
        measured?: { width?: number; height?: number };
    }

// zIndex applied to a node's React Flow wrapper (not this component's own
// markup) while it's hovered, so it stacks above sibling nodes instead of
// just gaining a zIndex trapped inside its own wrapper's stacking context.
const HOVER_Z_INDEX = 1000;

export function CourseNode(
    { id, data }: CourseNodeProps) {
    const { code, number, name } = data;

    const [opened, setOpened] = useState<boolean>(false);
    const { updateNode } = useReactFlow();

    return (
        <div
            style={{ display: 'flex', width: '150px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
        <MotionConfig transition={{ ease: 'easeOut', duration: 0.3 }}>
            <motion.div style={{
                display: 'flex', minWidth: '7vh', minHeight: '5vh', borderRadius: '25%',
                width: '100%', gap: '10px', padding: '15px',
                cursor: 'grab', alignItems: 'center',
                backgroundColor: 'white', justifyContent: 'center',
                outline: '2px solid #414141', width: '180px',
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
            <span style={{ zIndex: 200, fontWeight: 400, fontSize: '16px'}}>{name} ({code} {number})</span>
            <Handle type="source" style={{visibility:'hidden'}} position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
