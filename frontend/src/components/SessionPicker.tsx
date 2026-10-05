import { useEffect, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { formatSessionDays, formatSessionTime } from '../utils/SessionFormatter';
import { sessionGroups } from '../utils/ScheduleFormatter';
import type { EligibleCourse, EligibleCourseSession } from '../types';
import './Picker.css';
import './SessionPicker.css';

export interface SessionPickerProps {
    course: EligibleCourse;
    onChoose: (sessions: EligibleCourseSession[]) => void;
    onClose: () => void;
}

function CloseIcon() {
    return (
        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
            <path d='M5 5l10 10M15 5 5 15' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

interface SessionGroupProps {
    title: string;
    name: string;
    sessions: EligibleCourseSession[];
    chosen: EligibleCourseSession | null;
    onPick: (session: EligibleCourseSession) => void;
}

function SessionGroup({ title, name, sessions, chosen, onPick }: SessionGroupProps) {
    return (
        <fieldset className='session-picker-group flex flex-col'>
            <legend className='session-picker-group-title'>{title}</legend>
            <ul className='picker-list flex flex-col'>
                {sessions.map((session, i) => {
                    const isChosen = chosen === session;
                    return (
                        <li key={i}>
                            <label className={`picker-row session-picker-option flex flex-row items-center${isChosen ? ' session-picker-option--chosen' : ''}`}>
                                <input
                                    type='radio'
                                    name={name}
                                    checked={isChosen}
                                    onChange={() => onPick(session)}
                                />
                                <div className='picker-info flex flex-col'>
                                    <span className='picker-name'>{formatSessionDays(session.days)}</span>
                                    <span className='session-picker-time'>{formatSessionTime(session.startTime, session.endTime)}</span>                                </div>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
}

export function SessionPicker({ course, onChoose, onClose }: SessionPickerProps) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const { lectures, labs } = sessionGroups(course.sessions);
    // A group with a single option has nothing to choose, so it starts selected.
    const [lecture, setLecture] = useState<EligibleCourseSession | null>(lectures.length === 1 ? lectures[0] : null);
    const [lab, setLab] = useState<EligibleCourseSession | null>(labs.length === 1 ? labs[0] : null);

    const ready = (lectures.length === 0 || lecture != null) && (labs.length === 0 || lab != null);

    return (
        <MotionConfig transition={{ ease: 'easeOut', duration: 0.22 }}>
            <motion.div
                className='picker-backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className='picker-panel session-picker-panel flex flex-col'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='session-picker-title'
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='picker-head flex flex-row items-start justify-between'>
                        <div className='flex flex-col'>
                            <span className='picker-code'>{course.code} {course.number}</span>
                            <h2 id='session-picker-title'>Choose your sessions</h2>
                            <span className='session-picker-subtitle'>{course.name}</span>
                        </div>
                        <button type='button' className='picker-close' onClick={onClose} aria-label='Close'>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className='picker-results session-picker-results flex flex-col'>
                        {lectures.length > 0 && (
                            <SessionGroup
                                title='Lecture'
                                name='session-picker-lecture'
                                sessions={lectures}
                                chosen={lecture}
                                onPick={setLecture}
                            />
                        )}
                        {labs.length > 0 && (
                            <SessionGroup
                                title='Lab / Discussion'
                                name='session-picker-lab'
                                sessions={labs}
                                chosen={lab}
                                onPick={setLab}
                            />
                        )}
                    </div>

                    <div className='picker-footer flex flex-row items-center justify-end session-picker-footer'>
                        <button type='button' className='session-picker-cancel' onClick={onClose}>Cancel</button>
                        <button
                            type='button'
                            className='picker-done'
                            disabled={!ready}
                            onClick={() => onChoose([lecture, lab].filter((s): s is EligibleCourseSession => s != null))}
                        >
                            Add to Schedule
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
}
