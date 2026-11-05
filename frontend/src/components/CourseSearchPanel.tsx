import { useEffect, useMemo, useState } from 'react';
import { CourseListItem } from './CourseListItem';
import { searchScheduleCourses } from '../api/courses';
import { CREDIT_CAP, courseKeyOf } from '../utils/ScheduleFormatter';
import type { EligibleCourse } from '../types';
import './CourseSearchPanel.css';

const SEARCH_DEBOUNCE_MS = 250;

interface SearchState {
    query: string;
    results: EligibleCourse[];
    error: string | null;
}

/** Keeps the first course per code + number so the list never renders duplicate cards. */
function uniqueByKey(courses: EligibleCourse[]): EligibleCourse[] {
    const seen = new Set<string>();
    return courses.filter((course) => {
        const key = courseKeyOf(course);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

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
    // The latest backend answer, tagged with the query it answers; it is stale while the user keeps typing.
    const [search, setSearch] = useState<SearchState | null>(null);

    const trimmedQuery = query.trim();

    // A typed query searches the whole catalog in the database, not just the preloaded suggestions.
    useEffect(() => {
        if (!trimmedQuery) return;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            searchScheduleCourses(trimmedQuery, controller.signal)
                .then((results) => setSearch({ query: trimmedQuery, results, error: null }))
                .catch((err) => {
                    if (controller.signal.aborted) return;
                    console.error(err);
                    setSearch({ query: trimmedQuery, results: [], error: 'Could not search courses. Try again shortly.' });
                });
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [trimmedQuery]);

    const searchSettled = search != null && search.query === trimmedQuery;
    const visibleCourses = useMemo(() => {
        if (!trimmedQuery) return uniqueByKey(courses);
        return searchSettled ? uniqueByKey(search.results) : [];
    }, [courses, search, searchSettled, trimmedQuery]);
    const shownError = trimmedQuery ? (searchSettled ? search.error : null) : error;
    const shownLoading = trimmedQuery ? !searchSettled : loading;

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
            </div>

            <div className='course-search-panel-scroll flex flex-col'>
                {shownError && <div className='course-search-panel-error'>{shownError}</div>}
                {!shownError && shownLoading && (
                    <>
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className='course-list-item-skeleton' />
                        ))}
                    </>
                )}
                {!shownError && !shownLoading && visibleCourses.length === 0 && (
                    <div className='course-search-panel-empty'>
                        {trimmedQuery ? 'No courses match your search' : 'No suggested courses yet'}
                    </div>
                )}
                {!shownError && !shownLoading && visibleCourses.map((course) => {
                    const key = courseKeyOf(course);
                    const isSelected = selectedKeys.has(key);
                    const disabledByCap = !isSelected && totalCredits + (course.credits ?? 0) > CREDIT_CAP;
                    return (
                        <CourseListItem
                            key={key}
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
