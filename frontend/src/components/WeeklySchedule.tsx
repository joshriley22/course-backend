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

const dayIndexOf = (day: string) => (SCHEDULE_DAYS as readonly string[]).indexOf(day);

function formatHourLabel(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
}

export interface WeeklyScheduleProps {
    courses: ScheduledCourse[];
    onSelectCourse?: (course: ScheduledCourse) => void;
    onGenerate: () => void;
    generating: boolean;
    notice: string | null;
}

export function WeeklySchedule({ courses, onSelectCourse, onGenerate, generating, notice }: WeeklyScheduleProps) {
    // DOM order is Tab order, so render blocks top-to-bottom, then left-to-right
    // across the days, rather than one day column at a time.
    const blocks = useMemo(
        () => layoutScheduleBlocks(courses).sort((a, b) =>
            a.startMinutes - b.startMinutes
            || dayIndexOf(a.day) - dayIndexOf(b.day)
            || a.column - b.column),
        [courses],
    );
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
                <div className='weekly-schedule-actions flex flex-row items-center'>
                    {notice && <span className='weekly-schedule-notice' role='status'>{notice}</span>}
                    <button
                        type='button'
                        className='weekly-schedule-generate'
                        onClick={onGenerate}
                        disabled={generating}
                    >
                        {generating ? 'Generating…' : 'Generate Recommendations'}
                    </button>
                </div>
            </div>
            {/* Browsers make a scroll area a Tab stop when it has nothing focusable inside
                (an empty schedule), so give it a name a screen reader can announce. */}
            <div className='weekly-schedule-scroll' role='region' aria-label='Weekly schedule grid'>
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

                    {SCHEDULE_DAYS.map((day, dayIndex) => (
                        <div
                            key={day}
                            className='weekly-schedule-column'
                            style={{ height: gridHeight, gridColumn: dayIndex + 2 }}
                        >
                            {HOURS.slice(0, -1).map((minutes) => (
                                <div key={minutes} className='weekly-schedule-cell' style={{ height: HOUR_HEIGHT }} />
                            ))}
                        </div>
                    ))}

                    {/* Blocks are direct grid children placed in their day's column, so they can
                        sit in reading order in the DOM while still drawing inside that column. */}
                    {blocks.map((block) => {
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
                                    // Explicit spans: an absolutely positioned grid item with
                                    // an auto end line stretches to the grid's edge instead.
                                    gridRow: '2 / span 1',
                                    gridColumn: `${dayIndexOf(block.day) + 2} / span 1`,
                                    top,
                                    height: blockHeight,
                                    // +1px clears the column's left border
                                    left: `calc(${block.column * width}% + 1px)`,
                                    width: `calc(${width}% - 4px)`,
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
                {courses.length === 0 && (
                    <div className='weekly-schedule-empty'>
                        Your schedule is empty. Add courses from the search panel to see them here.
                    </div>
                )}
            </div>
        </div>
    );
}
