import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Position, Handle, useReactFlow } from '@xyflow/react';
import { motion, MotionConfig, AnimatePresence } from 'framer-motion';
import { addTakenCourse, fetchCourseUuid } from '../api/courses.ts';
import { useGraphActions } from './GraphActions';
import { CoursesTakenList, loadTakenCourses } from '../utils/CoursesTakenList.ts';
import { getUsername } from '../utils/auth.ts';
import { useSelectedCourses } from '../utils/SelectedCoursesList.ts';
import { courseKeyOf } from '../utils/ScheduleFormatter.ts';
import { StarRating } from './StarRating';
import type { CourseData, PrerequisiteRelationship } from '../types';
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
       return {
           id : this.string(),
           type : "courseNode",
           position : {x, y},
           ariaLabel: `${this.name}, ${this.code} ${this.number}, rated ${this.rating} out of 5`,
           data : { code: this.code, number: this.number, name: this.name, rating: this.rating },
       }
       }

}

    export interface CourseNodeProps {
        id: string;
        type: string;
        position: { x: number; y: number };
        ariaLabel?: string;
        data: CourseData;
        style?: CSSProperties;
        measured?: { width?: number; height?: number };
    }


const HOVER_Z_INDEX = 1000;
export function CourseNode({ id, data }: Pick<CourseNodeProps, 'id' | 'data'>) {
    const { code, number, name, rating } = data;
    const ANIMATION_DURATION = 0.2;
    const actions = useGraphActions();
    const scheduled = useSelectedCourses();
    const isScheduled = scheduled.some((c) => courseKeyOf(c) === courseKeyOf(data));

    const cardRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState<boolean>(false);
    // True while keyboard focus is on the node itself or on one of its buttons
    const [focused, setFocused] = useState<boolean>(false);
    const opened = hovered || focused;
    const [uuid, setUuid] = useState<string | null>(null);
    const [taken, setTaken] = useState<boolean>(false);
    const { updateNode } = useReactFlow();

    // React Flow puts focus on its own .react-flow__node wrapper (our parent), so
    // listen there; focusin/focusout also cover the action buttons inside the card.
    useEffect(() => {
        const nodeEl = cardRef.current?.closest('.react-flow__node');
        if (!nodeEl) return;
        const onIn = () => setFocused(true);
        const onOut = (e: Event) => {
            const next = (e as FocusEvent).relatedTarget as Node | null;
            if (!next || !nodeEl.contains(next)) setFocused(false);
        };
        nodeEl.addEventListener('focusin', onIn);
        nodeEl.addEventListener('focusout', onOut);
        return () => {
            nodeEl.removeEventListener('focusin', onIn);
            nodeEl.removeEventListener('focusout', onOut);
        };
    }, []);

    // Lift the open card above its neighbours, whether opened by mouse or keyboard
    useEffect(() => {
        updateNode(id, (node) => {
            const { zIndex: _zIndex, ...style } = node.style ?? {};
            return { style: opened ? { ...style, zIndex: HOVER_Z_INDEX } : style };
        });
    }, [opened, id, updateNode]);

    // Look up the uuid the first time the card opens so the button can show whether it's already taken
    useEffect(() => {
        if (!opened || uuid != null) return;
        let stale = false;
        fetchCourseUuid(code, number)
            .then((courseUuid) => {
                if (stale) return;
                setUuid(courseUuid);
                setTaken(CoursesTakenList.getInstance().hasCourse(courseUuid));
            })
            .catch(() => console.error('Failed to retrieve course uuid'));
        return () => { stale = true; };
    }, [opened, uuid, code, number]);

    const addCourseToTaken = async (code: string, number: string) => {
        try {
            const username = getUsername();
            if (username) {
                await addTakenCourse(username, code, number);
                await loadTakenCourses(username);
            } else {
                CoursesTakenList.getInstance().addCourse(uuid ?? await fetchCourseUuid(code, number));
            }
            setTaken(true);
            } catch(err) {
                console.error('Failed to add course to taken list');
                }
        }

    return (
        <div className='course-node-wrapper flex flex-col items-center justify-center'>
        <MotionConfig transition={{ ease: 'easeOut', duration: ANIMATION_DURATION }}>
            <motion.div className='course-node-card flex flex-col relative'
               ref={cardRef}
               animate={{ height: opened ? 262 : 138, scale: opened ? 1.06 : 1 }}
               onHoverStart={() => setHovered(true)}
               onHoverEnd={() => setHovered(false)} >


            <Handle type="target" className='hidden-visibility' position={Position.Top} />
            <motion.div className='course-node-body flex flex-col'>
                <div id='course-title' className='text-left'>
                    <span>{name}<br></br>({code} {number})</span>
                </div>
                <div className='course-rating-row flex flex-row items-center justify-between'>
                    <StarRating rating={rating} />
                    <span className='course-rating-value'>{rating}/5</span>
                </div>
            <AnimatePresence initial={false}>
            {opened && (
                <motion.div className='course-node-actions-clip'
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: ANIMATION_DURATION }, opacity: { duration: ANIMATION_DURATION + 0.3 } }}>
                <div className='course-node-actions flex flex-col items-center justify-center'>
                    <button className='course-node-details-btn nodrag' onClick={ (e) => {e.stopPropagation(); actions?.openDetails(data);} }>More Details</button>
                    <button
                        className='course-node-details-btn course-node-schedule-btn nodrag'
                        disabled={isScheduled}
                        onClick={ (e) => {e.stopPropagation(); actions?.addToSchedule(data);} }>
                        {isScheduled ? 'Added' : 'Add to Schedule'}
                    </button>
                    <button
                        className='course-node-details-btn course-node-schedule-btn nodrag'
                        disabled={taken}
                        onClick={ (e) => {e.stopPropagation(); addCourseToTaken(code, number);} }>
                        {taken ? 'Taken' : 'Mark as Taken'}
                    </button>
                </div>
                </motion.div>
                    )}
            </AnimatePresence>
                </motion.div>
                <Handle type="source" className='hidden-visibility' position={Position.Bottom} />
            </motion.div>
        </MotionConfig>
    </div>
    );
}
