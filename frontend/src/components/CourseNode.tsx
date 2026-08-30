import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig } from 'framer-motion';
import { fetchCourseInfo } from '../api/courses.ts';
import type { CourseData, CourseDetails, PrerequisiteRelationship } from '../types';

function courseKey(code: string, number: string): string {
    return `${code}${number}`;
}

function courseFromPrereq(prereq: PrerequisiteRelationship, index : number) : string {
    if( index === 0) {
        return `${prereq.prereq1_name} (${prereq.prereq1_code} ${prereq.prereq1_number})`;
        }
    else if (index === 1){
        return `${prereq.prereq2_name} (${prereq.prereq2_code} ${prereq.prereq2_number})`;
        }
    }

//claude had this really elegant find-union structure answer but I felt bad about outsourcing the logic (let's call it 'refactoring for readability') so I did this
function formatPrerequisites(prereqs: PrerequisiteRelationship[]): string {
        if(prereqs.length < 2 || prereqs === null) return '';
        let course = courseFromPrereq(prereqs[0], 0);
        const courseList = [course];
        const courseQueue = [course];
        var finalString = course + ' ';
        while(courseQueue.length > 0) {
            const nextEdge = searchPrerequisites(courseQueue[0], prereqs);
                if(nextEdge !== null) {
                    var nextCourse : string = (courseQueue[0] === courseFromPrereq(nextEdge, 0)) ? courseFromPrereq(nextEdge, 1) : courseFromPrereq(nextEdge, 0);
                    if(!contains(courseList, nextCourse)) {
                    finalString += `${nextEdge.relationship} ${nextCourse} `;
                    courseList.push(nextCourse);
                    courseQueue.push(nextCourse);
                    }
                    }
                courseQueue.shift();
            }
        return finalString;
    }

function searchPrerequisites(course: string, prereqs: PrerequisiteRelationship[]): PrerequisiteRelationship | null {
        for(const p of prereqs) {
            if((courseFromPrereq(p, 0) === course || courseFromPrereq(p, 1) === course) && p.relationship) {
                return p;
                }
            }
        return null;
    }

function contains(arr: string[], target: string): boolean {
    for(const item of arr) {
        if(item === target) return true;
        }
    return false;
    }

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
        setDetailMode?: (detailMode: boolean) => void;
    }


const HOVER_Z_INDEX = 1000;

export function CourseNode(
    { id, data, setDetailMode }: CourseNodeProps) {
    const { code, number, name, rating } = data;
    const ANIMATION_DURATION = 0.2;

    const [opened, setOpened] = useState<boolean>(false);
    const { updateNode } = useReactFlow();
    const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);

    useEffect(() => {
        if(!opened) return;
        fetchCourseInfo(code, number)
        .then((info) => setCourseDetails(info))
        .catch(console.error);
        }, [code, number, opened]);

    if(courseDetails) console.log(formatPrerequisites(courseDetails.prerequisites));

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
        >
        <MotionConfig transition={{ ease: 'easeOut', duration: ANIMATION_DURATION }}>
            <motion.div style={{
                display: 'flex', position: 'relative', borderRadius: '24px',
                width: '250px',
                cursor: 'grab', alignItems: 'center',
                backgroundColor: 'white', justifyContent: 'center',
                outline: '2px solid #414141',
            }} animate={{ height: opened ? 150 : 100, scale: opened ? 1.06 : 1 }}
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
            <motion.div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', position: 'absolute', padding: '15px', top: '0', zIndex: 200, fontWeight: 500, fontSize: '16px' }} animate={{ y: opened ? 10 : 0 }}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '15px' }}>
                    <div id='course-title' style={{textAlign: 'left'}}>
                        <span>{name}<br></br>({code} {number})</span>
                    </div>
                    <div id='course-rating' style={{flexShrink: '0', textAlign: 'right'}}>
                        <span>{rating}/5</span>
                    </div>
                </div>
            {opened && courseDetails && (
                <motion.div style={{ alignItems: 'center' , justifyContent: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: ANIMATION_DURATION + 0.1 }}>
                    <button style={{width: '100%', height: '35px', borderRadius: '16px', border: '1px solid #E4E4E4', backgroundColor: '#F5F5F5', cursor: 'pointer', fontWeight: '500'}} onClick={ () => setDetailMode?.(true) }>More Details</button>
                </motion.div>
                    )}
                </motion.div>
                <Handle type="source" style={{visibility:'hidden'}} position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
