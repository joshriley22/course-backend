import { motion, AnimatePresence } from 'framer-motion';
import { StarRating } from './StarRating';
import { formatSessionDays, formatSessionTime } from '../utils/SessionFormatter';
import { CREDIT_CAP } from '../utils/ScheduleFormatter';
import type { EligibleCourse } from '../types';
import './SelectedCoursesStrip.css';

export interface SelectedCoursesStripProps {
    courses: EligibleCourse[];
    totalCredits: number;
    onRemove: (course: EligibleCourse) => void;
    onShowDetails: (course: EligibleCourse) => void;
}

function RemoveIcon() {
    return (
        <svg viewBox='0 0 16 16' width='12' height='12' aria-hidden='true'>
            <path d='M4 4l8 8M12 4l-8 8' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

export function SelectedCoursesStrip({ courses, totalCredits, onRemove, onShowDetails }: SelectedCoursesStripProps) {
    return (
        <div className='selected-courses-strip flex flex-col'>
            <div className='selected-courses-strip-caption flex flex-row items-center justify-between'>
                <h2>Selected Courses</h2>
                <span className='selected-courses-strip-count'>{totalCredits}/{CREDIT_CAP} credits</span>
            </div>
            <div className='selected-courses-strip-scroll flex flex-row'>
                {courses.length === 0 && (
                    <div className='selected-courses-strip-empty flex items-center justify-center'>
                        Add courses from the search panel to build your schedule.
                    </div>
                )}
                <AnimatePresence initial={false}>
                    {courses.map((course) => {
                        const session = course.sessions[0];
                        return (
                            <motion.div
                                key={`${course.code}${course.number}`}
                                className='selected-course-card flex flex-col shrink-0'
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                onClick={() => onShowDetails(course)}
                            >
                                <button
                                    type='button'
                                    className='selected-course-remove'
                                    onClick={(e) => { e.stopPropagation(); onRemove(course); }}
                                    aria-label={`Remove ${course.name}`}
                                >
                                    <RemoveIcon />
                                </button>
                                <span className='selected-course-code'>{course.code} {course.number}</span>
                                <span className='selected-course-name'>{course.name}</span>
                                {course.credits != null && (
                                    <span className='selected-course-credits'>{course.credits} credit{course.credits === 1 ? '' : 's'}</span>
                                )}
                                <div className='selected-course-meta flex flex-row items-center justify-between'>
                                    <StarRating rating={course.rating ?? 0} size={11} />
                                    <span>{session ? `${formatSessionDays(session.days)} ${formatSessionTime(session.startTime, session.endTime)}` : 'TBD'}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
