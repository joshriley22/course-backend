import { useEffect, useMemo, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import './Picker.css';

export type MajorOptionsStatus = 'loading' | 'ready' | 'error';

export interface MajorPickerProps {
    options: string[];
    status: MajorOptionsStatus;
    selected: string[];
    onAdd: (major: string) => void;
    onClose: () => void;
}

const FILTER_THRESHOLD = 8;

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

export function MajorPicker({ options, status, selected, onAdd, onClose }: MajorPickerProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const showFilter = options.length > FILTER_THRESHOLD;
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter((major) => major.toLowerCase().includes(q)) : options;
    }, [options, query]);

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
                    aria-labelledby='major-picker-title'
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className='picker-head flex flex-row items-center justify-between'>
                        <h2 id='major-picker-title'>Add your major(s)</h2>
                        <button type='button' className='picker-close' onClick={onClose} aria-label='Close'>
                            <CloseIcon />
                        </button>
                    </div>

                    {showFilter && (
                        <div className='picker-search flex flex-row items-center'>
                            <SearchIcon />
                            <input
                                type='text'
                                autoFocus
                                placeholder='Filter majors'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label='Filter majors'
                            />
                        </div>
                    )}

                    <div className='picker-results' aria-live='polite'>
                        {status === 'loading' && <p className='picker-message'>Loading majors&hellip;</p>}
                        {status === 'error' && (
                            <p className='picker-message picker-message--error'>Couldn&rsquo;t load majors. Try again shortly.</p>
                        )}
                        {status === 'ready' && visible.length === 0 && (
                            <p className='picker-message'>
                                {options.length === 0 ? 'No majors available yet.' : `No majors match “${query.trim()}”.`}
                            </p>
                        )}
                        {status === 'ready' && visible.length > 0 && (
                            <ul className='picker-list flex flex-col'>
                                {visible.map((major) => {
                                    const chosen = selected.includes(major);
                                    return (
                                        <li key={major} className='picker-row flex flex-row items-center'>
                                            <div className='picker-info flex flex-col'>
                                                <span className='picker-name'>{major}</span>
                                            </div>
                                            <button
                                                type='button'
                                                className={`picker-btn${chosen ? ' picker-btn--done' : ''}`}
                                                disabled={chosen}
                                                onClick={() => onAdd(major)}
                                            >
                                                {chosen ? <CheckIcon /> : <PlusIcon />}
                                                {chosen ? 'Added' : 'Add'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className='picker-footer flex flex-row justify-end'>
                        <button type='button' className='picker-done' onClick={onClose}>Done</button>
                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
}
