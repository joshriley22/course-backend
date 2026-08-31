import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';
import { fetchCourseInfo } from '../api/courses.ts';
import type { CourseData, CourseDetails, PrerequisiteRelationship } from '../types';

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

    export interface CourseNodeProps {
        id: string;
        type: string;
        position: { x: number; y: number };
        data: CourseData;
        style?: CSSProperties;
        measured?: { width?: number; height?: number };
        setNodeInfo?: (nodeInfo: CourseDetails) => void;
        detailMode : boolean;
        setDetailMode : (detailMode: boolean) => void;
    }


const HOVER_Z_INDEX = 1000;

export function CourseNode(
    { id, data, setNodeInfo, detailMode, setDetailMode }: CourseNodeProps) {
    const { code, number, name, rating } = data;
    const ANIMATION_DURATION = 0.2;

    const [opened, setOpened] = useState<boolean>(false);
    const { updateNode } = useReactFlow();

    const loadCourseInfo = async (code: string, number: string) => {
        try {
            const info = await fetchCourseInfo(code, number);
            setNodeInfo?.(info);
            } catch(err) {
                console.error('Failed to retrieve course info');
                }
        }

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
        >
        <MotionConfig transition={{ ease: 'easeOut', duration: ANIMATION_DURATION }}>
            <motion.div style={{
                display: 'flex', position: 'relative', borderRadius: '24px',
                width: '250px',
                cursor: 'grab', flexDirection: 'column', alignItems: 'stretch',
                backgroundColor: 'white', justifyContent: 'flex-start',
                outline: '2px solid #414141',
                transformOrigin: 'top',
            }} animate={{ height: opened ? 150 : 110, scale: opened ? 1.06 : 1 }}
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
               }} >


            <Handle type="target" style={{visibility:'hidden'}} position={Position.Top} />
            <motion.div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap:'15px', padding: '15px', flex: '1', zIndex: '200', fontWeight: '500', fontSize: '16px' }}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div id='course-title' style={{textAlign: 'left'}} >
                        <span>{name}<br></br>({code} {number})</span>
                    </div>
                    <div id='course-rating' style={{flexShrink: '0', textAlign: 'right'}}>
                        <span>{rating}/5</span>
                    </div>
                </div>
            {opened && (
                <motion.div style={{ alignItems: 'center', justifyContent: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: ANIMATION_DURATION + 0.1 }}>
                    <button style={{width: '100%', height: '35px', borderRadius: '16px', border: '1px solid #E4E4E4', backgroundColor: '#F5F5F5', cursor: 'pointer', fontWeight: '500'}} onClick={ () => {setDetailMode(true), loadCourseInfo(code, number)} }>More Details</button>
                </motion.div>
                    )}
                </motion.div>
                <Handle type="source" style={{visibility:'hidden'}} position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
