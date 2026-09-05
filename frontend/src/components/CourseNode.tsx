import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';
import { fetchCourseInfo, fetchCourseUuid } from '../api/courses.ts';
import { CoursesTakenList } from '../utils/CoursesTakenList.ts';
import type { CourseData, CourseDetails, PrerequisiteRelationship } from '../types';
import './CourseNode.css';

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

    const addCourseToTaken = async (code: string, number: string) => {
        try {
            const uuid = await fetchCourseUuid(code, number);
            CoursesTakenList.getInstance().addCourse(uuid);
            } catch(err) {
                console.error('Failed to retrieve course uuid');
                }
        }

    return (
        <div className='course-node-wrapper flex flex-col items-center justify-center'>
        <MotionConfig transition={{ ease: 'easeOut', duration: ANIMATION_DURATION }}>
            <motion.div className='course-node-card flex flex-col relative'
               animate={{ height: opened ? 150 : 110, scale: opened ? 1.06 : 1 }}
               onClick={ () => addCourseToTaken(code, number) }
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


            <Handle type="target" className='hidden-visibility' position={Position.Top} />
            <motion.div className='course-node-body flex flex-col justify-between'>
                <div className='flex flex-row items-center justify-between'>
                    <div id='course-title' className='text-left' >
                        <span>{name}<br></br>({code} {number})</span>
                    </div>
                    <div id='course-rating' className='shrink-0 text-right'>
                        <span>{rating}/5</span>
                    </div>
                </div>
            {opened && (
                <motion.div className='items-center justify-center' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: ANIMATION_DURATION + 0.1 }}>
                    <button className='course-node-details-btn' onClick={ (e) => {e.stopPropagation(); setDetailMode(true); loadCourseInfo(code, number);} }>More Details</button>
                </motion.div>
                    )}
                </motion.div>
                <Handle type="source" className='hidden-visibility' position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
