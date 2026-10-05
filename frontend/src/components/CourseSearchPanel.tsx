import { useMemo, useState } from 'react';
import { CourseListItem } from './CourseListItem';
import { CREDIT_CAP } from '../utils/ScheduleFormatter';
import type { EligibleCourse } from '../types';
import './CourseSearchPanel.css';

export interface CourseSearchPanelProps {
    courses: EligibleCourse[];
    loading: boolean;
    error: string | null;
    selectedKeys: Set<string>;
    totalCredits: number;
    onToggleSelected: (course: EligibleCourse) => void;
    onShowDetails: (course: EligibleCourse) => void;
    onShowReviews: (course: EligibleCourse) => void;
}

function SearchIcon() {
    return (
        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
            <circle cx='8.5' cy='8.5' r='5.5' fill='none' stroke='currentColor' strokeWidth='1.75' />
            <path d='M16 16l-3.8-3.8' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
        </svg>
    );
}

export function CourseSearchPanel({
    courses,
    loading,
    error,
    selectedKeys,
    totalCredits,
    onToggleSelected,
    onShowDetails,
    onShowReviews,
}: CourseSearchPanelProps) {
    const [query, setQuery] = useState('');

    const visibleCourses = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter((course) => {
            const stack = `${course.code} ${course.number} ${course.name}`.toLowerCase();
            return stack.includes(q);
        });
    }, [courses, query]);

    return (
        <div className='course-search-panel flex flex-col'>
            <div className='course-search-panel-head'>
                <div className='course-search-bar flex flex-row items-center'>
                    <SearchIcon />
                    <input
                        type='text'
                        placeholder='Search courses'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label='Search courses'
                    />
                </div>
                <div className='course-search-modes flex flex-row items-center'>
                    <span className='course-search-mode-chip'>Search By Recommended</span>
                </div>
            </div>

            <div className='course-search-panel-scroll flex flex-col'>
                {error && <div className='course-search-panel-error'>{error}</div>}
                {!error && loading && (
                    <>
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className='course-list-item-skeleton' />
                        ))}
                    </>
                )}
                {!error && !loading && visibleCourses.length === 0 && (
                    <div className='course-search-panel-empty'>
                        No courses match your search
                    </div>
                )}
                {!error && !loading && visibleCourses.map((course) => {
                    const isSelected = selectedKeys.has(`${course.code}${course.number}`);
                    const disabledByCap = !isSelected && totalCredits + (course.credits ?? 0) > CREDIT_CAP;
                    return (
                        <CourseListItem
                            key={`${course.code}${course.number}`}
                            course={course}
                            isSelected={isSelected}
                            disabledByCap={disabledByCap}
                            onToggleSelected={onToggleSelected}
                            onShowDetails={onShowDetails}
                            onShowReviews={onShowReviews}
                        />
                    );
                })}
            </div>
        </div>
    );
}
