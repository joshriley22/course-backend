import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    SCHEDULE_DAYS,
    SCHEDULE_DAY_LABELS,
    SCHEDULE_START_MINUTES,
    SCHEDULE_END_MINUTES,
    formatBlockTimeRange,
    layoutScheduleBlocks,
    type ScheduledCourse,
} from '../utils/ScheduleFormatter';
import './WeeklySchedule.css';

const HOUR_HEIGHT = 64;
const TOTAL_MINUTES = SCHEDULE_END_MINUTES - SCHEDULE_START_MINUTES;
const HOURS = Array.from(
    { length: Math.ceil(TOTAL_MINUTES / 60) + 1 },
    (_, i) => SCHEDULE_START_MINUTES + i * 60,
);

function formatHourLabel(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
}

export interface WeeklyScheduleProps {
    courses: ScheduledCourse[];
    onSelectCourse?: (course: ScheduledCourse) => void;
}

export function WeeklySchedule({ courses, onSelectCourse }: WeeklyScheduleProps) {
    const blocks = useMemo(() => layoutScheduleBlocks(courses), [courses]);
    const courseByKey = useMemo(() => {
        const map = new Map<string, ScheduledCourse>();
        courses.forEach((c) => map.set(`${c.code}${c.number}`, c));
        return map;
    }, [courses]);

    const gridHeight = (TOTAL_MINUTES / 60) * HOUR_HEIGHT;

    return (
        <div className='weekly-schedule flex flex-col'>
            <div className='weekly-schedule-caption flex flex-row items-center justify-between'>
                <h2>Your Schedule</h2>
                {courses.length === 0 && (
                    <span className='weekly-schedule-hint'>Add a course to make it yours</span>
                )}
            </div>
            <div className='weekly-schedule-scroll'>
                <div className='weekly-schedule-grid' style={{ gridTemplateRows: `36px ${gridHeight}px` }}>
                    <div className='weekly-schedule-corner' />
                    {SCHEDULE_DAYS.map((day) => (
                        <div key={day} className='weekly-schedule-day-label'>{SCHEDULE_DAY_LABELS[day]}</div>
                    ))}

                    <div className='weekly-schedule-hours' style={{ height: gridHeight }}>
                        {HOURS.map((minutes) => (
                            <div
                                key={minutes}
                                className='weekly-schedule-hour-label'
                                style={{ height: HOUR_HEIGHT }}
                            >
                                {formatHourLabel(minutes)}
                            </div>
                        ))}
                    </div>

                    {SCHEDULE_DAYS.map((day) => (
                        <div key={day} className='weekly-schedule-column' style={{ height: gridHeight }}>
                            {HOURS.slice(0, -1).map((minutes) => (
                                <div key={minutes} className='weekly-schedule-cell' style={{ height: HOUR_HEIGHT }} />
                            ))}
                            {blocks
                                .filter((block) => block.day === day)
                                .map((block) => {
                                    const course = courseByKey.get(block.key.split('-')[0]);
                                    if (!course) return null;
                                    const top = ((block.startMinutes - SCHEDULE_START_MINUTES) / 60) * HOUR_HEIGHT;
                                    const height = ((block.endMinutes - block.startMinutes) / 60) * HOUR_HEIGHT;
                                    const width = 100 / block.columnCount;
                                    const blockHeight = Math.max(height, 30);
                                    const showName = blockHeight >= 34;
                                    const showTime = blockHeight >= 56;
                                    return (
                                        <motion.button
                                            type='button'
                                            key={block.key}
                                            className='weekly-schedule-block weekly-schedule-block--selected'
                                            style={{
                                                top,
                                                height: blockHeight,
                                                left: `${block.column * width}%`,
                                                width: `calc(${width}% - 3px)`,
                                            }}
                                            initial={{ opacity: 0, scale: 0.92 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            onClick={() => onSelectCourse?.(course)}
                                        >
                                            <span className='weekly-schedule-block-code'>{course.code} {course.number}</span>
                                            {showName && <span className='weekly-schedule-block-name'>{course.name}</span>}
                                            {showTime && (
                                                <span className='weekly-schedule-block-time'>
                                                    {formatBlockTimeRange(block.startMinutes, block.endMinutes)}
                                                </span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                        </div>
                    ))}
                </div>
                {courses.length === 0 && (
                    <div className='weekly-schedule-empty'>
                        Your schedule is empty. Add courses from the search panel to see them here.
                    </div>
                )}
            </div>
        </div>
    );
}
