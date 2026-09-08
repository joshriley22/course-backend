import { useMemo, useState } from 'react';
import { CourseListItem } from './CourseListItem';
import { CREDIT_CAP } from '../utils/ScheduleFormatter';
import type { EligibleCourse } from '../types';
import './CourseSearchPanel.css';

export interface SessionFilters {
    startsAfter10: boolean;
    endsBefore5: boolean;
    avoidsLunch: boolean;
}

const EMPTY_FILTERS: SessionFilters = { startsAfter10: false, endsBefore5: false, avoidsLunch: false };

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

function FilterIcon() {
    return (
        <svg viewBox='0 0 20 20' width='14' height='14' aria-hidden='true'>
            <path d='M3 5h14M6 10h8M9 15h2' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
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
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<SessionFilters>(EMPTY_FILTERS);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const visibleCourses = useMemo(() => {
        const q = query.trim().toLowerCase();
        return courses.filter((course) => {
            if (q) {
                const haystack = `${course.code} ${course.number} ${course.name}`.toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            if (filters.startsAfter10 && !course.sessions.some((s) => s.startsAfter10)) return false;
            if (filters.endsBefore5 && !course.sessions.some((s) => s.endsBefore5)) return false;
            if (filters.avoidsLunch && !course.sessions.some((s) => s.avoidsLunch)) return false;
            return true;
        });
    }, [courses, query, filters]);

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
                    <div className='course-search-filters relative'>
                        <button
                            type='button'
                            className={`course-search-filters-btn${activeFilterCount > 0 ? ' course-search-filters-btn--active' : ''}`}
                            onClick={() => setFiltersOpen((v) => !v)}
                            aria-expanded={filtersOpen}
                        >
                            <FilterIcon />
                            Other filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                        </button>
                        {filtersOpen && (
                            <div className='course-search-filters-popover flex flex-col'>
                                <label>
                                    <input
                                        type='checkbox'
                                        checked={filters.startsAfter10}
                                        onChange={(e) => setFilters((f) => ({ ...f, startsAfter10: e.target.checked }))}
                                    />
                                    Starts after 10 AM
                                </label>
                                <label>
                                    <input
                                        type='checkbox'
                                        checked={filters.endsBefore5}
                                        onChange={(e) => setFilters((f) => ({ ...f, endsBefore5: e.target.checked }))}
                                    />
                                    Ends before 5 PM
                                </label>
                                <label>
                                    <input
                                        type='checkbox'
                                        checked={filters.avoidsLunch}
                                        onChange={(e) => setFilters((f) => ({ ...f, avoidsLunch: e.target.checked }))}
                                    />
                                    Avoids the lunch block
                                </label>
                            </div>
                        )}
                    </div>
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
                        No courses match your search yet. Try a different keyword or clear a filter.
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
