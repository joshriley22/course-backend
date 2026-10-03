import { useEffect, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { searchCourses } from '../api/courses';
import { courseKeyOf } from '../utils/ScheduleFormatter';
import type { CourseSearchResult } from '../types';
import './Picker.css';

const SEARCH_DELAY_MS = 250;

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface CoursePickerProps {
    title: string;
    actionLabel: string;
    pendingLabel?: string;
    doneLabel?: string;
    doneKeys?: Set<string>;
    onPick: (course: CourseSearchResult) => Promise<void>;
    onClose: () => void;
}

const NO_KEYS = new Set<string>();

function SearchIcon() {
    return (
        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
            <circle cx='8.5' cy='8.5' r='5.5' fill='none' stroke='currentColor' strokeWidth='1.75' />
            <path d='M16 16l-3.8-3.8' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
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

function PlusIcon() {
    return (
        <svg viewBox='0 0 16 16' width='14' height='14' aria-hidden='true'>
            <path d='M8 2.5v11M2.5 8h11' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
            <path d='M5 5l10 10M15 5 5 15' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

export function CoursePicker({
    title,
    actionLabel,
    pendingLabel = `${actionLabel}…`,
    doneLabel = 'Added',
    doneKeys = NO_KEYS,
    onPick,
    onClose,
}: CoursePickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CourseSearchResult[]>([]);
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [pendingKey, setPendingKey] = useState<string | null>(null);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setStatus('idle');
            return;
        }

        setStatus('loading');
        const controller = new AbortController();
        const timer = setTimeout(() => {
            searchCourses(trimmed, controller.signal)
                .then((list) => { setResults(list); setStatus('ready'); })
                .catch((err) => {
                    if (err?.name === 'AbortError') return;
                    console.error(err);
                    setStatus('error');
                });
        }, SEARCH_DELAY_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handlePick = async (course: CourseSearchResult) => {
        setAddError(null);
        setPendingKey(courseKeyOf(course));
        try {
            await onPick(course);
        } catch (err) {
            console.error(err);
            setAddError(`Couldn't ${actionLabel.toLowerCase()} ${course.code} ${course.number}. Try again.`);
        } finally {
            setPendingKey(null);
        }
    };

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
                    className='picker-panel flex flex-col'
                    role='dialog'
                    aria-modal='true'
                    aria-labelledby='picker-title'
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='picker-head flex flex-row items-center justify-between'>
                        <h2 id='picker-title'>{title}</h2>
                        <button type='button' className='picker-close' onClick={onClose} aria-label='Close'>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className='picker-search flex flex-row items-center'>
                        <SearchIcon />
                        <input
                            type='text'
                            autoFocus
                            placeholder='Search by course code or title'
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setAddError(null); }}
                            aria-label='Search courses'
                        />
                    </div>

                    <div className='picker-results' aria-live='polite'>
                        {status === 'idle' && (
                            <p className='picker-message'>Start typing a course code (like CS 2130) or part of a title.</p>
                        )}
                        {status === 'loading' && (
                            <p className='picker-message'>Searching&hellip;</p>
                        )}
                        {status === 'error' && (
                            <p className='picker-message picker-message--error'>Couldn&rsquo;t search courses. Try again shortly.</p>
                        )}
                        {status === 'ready' && results.length === 0 && (
                            <p className='picker-message'>No courses match &ldquo;{query.trim()}&rdquo;.</p>
                        )}
                        {status === 'ready' && results.length > 0 && (
                            <ul className='picker-list flex flex-col'>
                                {results.map((course) => {
                                    const key = courseKeyOf(course);
                                    const taken = doneKeys.has(key);
                                    const pending = pendingKey === key;
                                    return (
                                        <li key={key} className='picker-row flex flex-row items-center'>
                                            <div className='picker-info flex flex-col'>
                                                <span className='picker-code'>{course.code} {course.number}</span>
                                                <span className='picker-name'>{course.name}</span>
                                            </div>
                                            <button
                                                type='button'
                                                className={`picker-btn${taken ? ' picker-btn--done' : ''}`}
                                                disabled={taken || pendingKey !== null}
                                                onClick={() => handlePick(course)}
                                            >
                                                {taken ? <CheckIcon /> : <PlusIcon />}
                                                {taken ? doneLabel : pending ? pendingLabel : actionLabel}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {addError && <p className='picker-error' role='alert'>{addError}</p>}

                    <div className='picker-footer flex flex-row justify-end'>
                        <button type='button' className='picker-done' onClick={onClose}>Done</button>
                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
}
