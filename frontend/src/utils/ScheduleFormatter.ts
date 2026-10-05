import type { EligibleCourseSession } from '../types';

export const SCHEDULE_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr'] as const;
export const SCHEDULE_DAY_LABELS: Record<string, string> = {
    Mo: 'Mon',
    Tu: 'Tue',
    We: 'Wed',
    Th: 'Thu',
    Fr: 'Fri',
};

export const SCHEDULE_START_MINUTES = 8 * 60;
export const SCHEDULE_END_MINUTES = 21 * 60;

export const CREDIT_CAP = 20;

function parseTimeToMinutes(raw: string | null | undefined): number | null {
    if (!raw) return null;
    const [hourStr, minuteStr] = raw.split('.');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr ?? '0', 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
}

function parseDayCodes(days: string | null | undefined): string[] {
    if (!days) return [];
    const codes: string[] = [];
    for (let i = 0; i < days.length; i += 2) {
        const chunk = days.slice(i, i + 2);
        if ((SCHEDULE_DAYS as readonly string[]).includes(chunk)) codes.push(chunk);
    }
    return codes;
}

export interface ScheduleBlock {
    key: string;
    day: string;
    startMinutes: number;
    endMinutes: number;
    column: number;
    columnCount: number;
}

export interface ScheduledCourse {
    code: string;
    number: string;
    name: string;
    rating?: number | null;
    sessions: EligibleCourseSession[];
}

/** Lays out every session of every course onto the weekly grid, splitting
 * same-day overlaps into side-by-side columns rather than stacking them. */
export function layoutScheduleBlocks(courses: ScheduledCourse[]): ScheduleBlock[] {
    const raw: Omit<ScheduleBlock, 'column' | 'columnCount'>[] = [];

    courses.forEach((course) => {
        course.sessions.forEach((session, sessionIndex) => {
            const start = parseTimeToMinutes(session.startTime);
            const end = parseTimeToMinutes(session.endTime);
            if (start == null || end == null || end <= start) return;
            parseDayCodes(session.days).forEach((day) => {
                raw.push({
                    key: `${course.code}${course.number}-${sessionIndex}-${day}`,
                    day,
                    startMinutes: start,
                    endMinutes: end,
                });
            });
        });
    });

    const blocks: ScheduleBlock[] = [];
    SCHEDULE_DAYS.forEach((day) => {
        const dayBlocks = raw
            .filter((b) => b.day === day)
            .sort((a, b) => a.startMinutes - b.startMinutes);

        const columnEnds: number[] = [];
        const assigned = dayBlocks.map((block) => {
            let column = columnEnds.findIndex((end) => end <= block.startMinutes);
            if (column === -1) {
                column = columnEnds.length;
                columnEnds.push(block.endMinutes);
            } else {
                columnEnds[column] = block.endMinutes;
            }
            return { ...block, column };
        });

        const columnCount = Math.max(1, columnEnds.length);
        assigned.forEach((block) => blocks.push({ ...block, columnCount }));
    });

    return blocks;
}

export function meetingSessions(sessions: EligibleCourseSession[]): EligibleCourseSession[] {
    return sessions.filter((s) => s.days && s.startTime && s.endTime);
}

export function sessionGroups(sessions: EligibleCourseSession[]): { lectures: EligibleCourseSession[]; labs: EligibleCourseSession[] } {
    const meetings = meetingSessions(sessions);
    return {
        lectures: meetings.filter((s) => !s.isLab),
        labs: meetings.filter((s) => s.isLab),
    };
}

export function courseKeyOf(course: { code: string; number: string }): string {
    return `${course.code}${course.number}`;
}

export function formatBlockTimeRange(startMinutes: number, endMinutes: number): string {
    const clockPart = (total: number) => {
        const hour = Math.floor(total / 60);
        const minute = total % 60;
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return minute === 0 ? `${displayHour}` : `${displayHour}:${String(minute).padStart(2, '0')}`;
    };
    const startPeriod = startMinutes >= 12 * 60 ? 'PM' : 'AM';
    const endPeriod = endMinutes >= 12 * 60 ? 'PM' : 'AM';
    if (startPeriod === endPeriod) {
        return `${clockPart(startMinutes)}–${clockPart(endMinutes)} ${endPeriod}`;
    }
    return `${clockPart(startMinutes)} ${startPeriod}–${clockPart(endMinutes)} ${endPeriod}`;
}
