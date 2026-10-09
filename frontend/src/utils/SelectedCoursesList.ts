import { useSyncExternalStore } from 'react';
import { courseKeyOf, CREDIT_CAP } from './ScheduleFormatter';
import type { EligibleCourse, EligibleCourseSession } from '../types';

export type ScheduleAddResult = 'added' | 'duplicate' | 'credit-cap';

/** Shared, app-wide schedule selection. Lets any view (the search panel on
 * Home, a graph node on Explore, ...) add/remove courses and stay in sync
 * with everyone else without threading props through the tree. */
export class SelectedCoursesList {
    private static instance: SelectedCoursesList;
    private courses: EligibleCourse[] = [];
    private listeners = new Set<() => void>();

    private constructor() {}

    public static getInstance(): SelectedCoursesList {
        if (!SelectedCoursesList.instance) {
            SelectedCoursesList.instance = new SelectedCoursesList();
        }
        return SelectedCoursesList.instance;
    }

    /** Calls `listener` whenever the list changes; returns an unsubscribe function. */
    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    private notify() {
        this.listeners.forEach((listener) => listener());
    }

    public getCourses(): EligibleCourse[] {
        return this.courses;
    }

    public getTotalCredits(): number {
        return this.courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
    }

    public isSelected(course: { code: string; number: string }): boolean {
        const key = courseKeyOf(course);
        return this.courses.some((c) => courseKeyOf(c) === key);
    }

    /** Adds `course` with the given sessions. No-ops (and reports why) if it's
     * already selected or would push total credits past the cap. */
    public addCourse(course: EligibleCourse, sessions?: EligibleCourseSession[]): ScheduleAddResult {
        const key = courseKeyOf(course);
        if (this.courses.some((c) => courseKeyOf(c) === key)) return 'duplicate';
        if (this.getTotalCredits() + (course.credits ?? 0) > CREDIT_CAP) return 'credit-cap';
        this.courses = [...this.courses, { ...course, sessions: sessions ?? course.sessions }];
        this.notify();
        return 'added';
    }

    public removeCourse(course: { code: string; number: string }) {
        const key = courseKeyOf(course);
        if (!this.courses.some((c) => courseKeyOf(c) === key)) return;
        this.courses = this.courses.filter((c) => courseKeyOf(c) !== key);
        this.notify();
    }

    public toggleCourse(course: EligibleCourse, sessions?: EligibleCourseSession[]): ScheduleAddResult | 'removed' {
        if (this.isSelected(course)) {
            this.removeCourse(course);
            return 'removed';
        }
        return this.addCourse(course, sessions);
    }

    /** Patches fields (e.g. a rating refreshed after a review post) on an already-selected course. */
    public updateCourse(course: { code: string; number: string }, patch: Partial<EligibleCourse>) {
        const key = courseKeyOf(course);
        if (!this.courses.some((c) => courseKeyOf(c) === key)) return;
        this.courses = this.courses.map((c) => (courseKeyOf(c) === key ? { ...c, ...patch } : c));
        this.notify();
    }

    public replaceAll(courses: EligibleCourse[]) {
        this.courses = courses;
        this.notify();
    }

    public clear() {
        if (this.courses.length === 0) return;
        this.courses = [];
        this.notify();
    }
}

/** Subscribes the calling component to the shared schedule selection. */
export function useSelectedCourses(): EligibleCourse[] {
    const store = SelectedCoursesList.getInstance();
    return useSyncExternalStore(
        (listener) => store.subscribe(listener),
        () => store.getCourses(),
    );
}
