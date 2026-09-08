import { StarRating } from './StarRating';
import { formatSessionDays, formatSessionTime } from '../utils/SessionFormatter';
import type { EligibleCourse } from '../types';
import './CourseListItem.css';

export interface CourseListItemProps {
    course: EligibleCourse;
    isSelected: boolean;
    disabledByCap: boolean;
    onToggleSelected: (course: EligibleCourse) => void;
    onShowDetails: (course: EligibleCourse) => void;
    onShowReviews: (course: EligibleCourse) => void;
}

function PlusIcon() {
    return (
        <svg viewBox='0 0 16 16' width='14' height='14' aria-hidden='true'>
            <path d='M8 2.5v11M2.5 8h11' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox='0 0 16 16' width='14' height='14' aria-hidden='true'>
            <path d='M3 8.5 6.3 12 13 4' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    );
}

export function CourseListItem({ course, isSelected, disabledByCap, onToggleSelected, onShowDetails, onShowReviews }: CourseListItemProps) {
    const nextSession = course.sessions[0];

    const addLabel = isSelected ? 'Added' : disabledByCap ? 'Exceeds Cap' : 'Add to Schedule';

    return (
        <div
            className={`course-list-item flex flex-col${isSelected ? ' course-list-item--selected' : ''}`}
            onClick={() => onShowDetails(course)}
        >
            <div className='course-list-item-head flex flex-row items-center justify-between'>
                <span className='course-list-item-code'>{course.code} {course.number}</span>
                <span className='course-list-item-rating'>
                    <StarRating rating={course.rating ?? 0} size={12} />
                </span>
            </div>
            <h3 className='course-list-item-name'>{course.name}</h3>
            <div className='course-list-item-meta'>
                {nextSession ? (
                    <span>{formatSessionDays(nextSession.days)} &middot; {formatSessionTime(nextSession.startTime, nextSession.endTime)}</span>
                ) : (
                    <span>No sessions on record</span>
                )}
            </div>
            <div className='course-list-item-actions flex flex-row items-center'>
                <button
                    type='button'
                    className={`course-list-item-add${isSelected ? ' course-list-item-add--active' : ''}`}
                    disabled={disabledByCap && !isSelected}
                    title={disabledByCap && !isSelected ? `Adding this would exceed the 20-credit cap` : undefined}
                    onClick={(e) => { e.stopPropagation(); onToggleSelected(course); }}
                >
                    {isSelected ? <CheckIcon /> : <PlusIcon />}
                    {addLabel}
                </button>
                <button type='button' className='course-list-item-ghost' onClick={(e) => { e.stopPropagation(); onShowReviews(course); }}>
                    Reviews
                </button>
            </div>
        </div>
    );
}
