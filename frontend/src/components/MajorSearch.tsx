import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon } from './SearchIcon';
import './MajorSearch.css';

interface MajorSearchProps {
    majors: string[];
    onSelect: (major: string) => void;
}

const MAX_RESULTS = 8;
const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 260;
const MIN_EXPANDED_WIDTH = 180;
const ARROW_GAP = 12;

export function MajorSearch({ majors, onSelect }: MajorSearchProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [openWidth, setOpenWidth] = useState(EXPANDED_WIDTH);
    const [query, setQuery] = useState('');
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Stay open while hovered, focused (clicked), or holding a query
    const expanded = hovered || focused || query !== '';

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? majors.filter((major) => major.toLowerCase().includes(q)).slice(0, MAX_RESULTS) : [];
    }, [majors, query]);

    const showResults = focused && query.trim() !== '';

    // Stop short of the header's prev arrow (our next sibling) so it stays clickable on narrow screens
    const measureOpenWidth = () => {
        const root = rootRef.current;
        const arrow = root?.nextElementSibling as HTMLElement | null;
        if (!root || !arrow) return;
        const room = arrow.offsetLeft - root.offsetLeft - ARROW_GAP;
        setOpenWidth(Math.max(MIN_EXPANDED_WIDTH, Math.min(EXPANDED_WIDTH, room)));
    };

    const choose = (major: string) => {
        onSelect(major);
        setQuery('');
        inputRef.current?.blur();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && matches[activeIndex]) {
            choose(matches[activeIndex]);
        } else if (e.key === 'Escape') {
            setQuery('');
            inputRef.current?.blur();
        }
    };

    return (
        <div
            ref={rootRef}
            className='major-search'
            onMouseEnter={() => { measureOpenWidth(); setHovered(true); }}
            onMouseLeave={() => setHovered(false)}
        >
            <motion.div
                className={`major-search-box flex flex-row items-center${expanded ? ' major-search-box--open' : ''}`}
                initial={false}
                animate={{ width: expanded ? openWidth : COLLAPSED_WIDTH }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
                onClick={() => inputRef.current?.focus()}
            >
                <span className='major-search-icon flex items-center justify-center'>
                    <SearchIcon />
                </span>
                <input
                    ref={inputRef}
                    type='text'
                    className='major-search-input'
                    placeholder='Search majors:'
                    aria-label='Search majors'
                    role='combobox'
                    aria-expanded={showResults}
                    aria-controls='major-search-results'
                    aria-autocomplete='list'
                    aria-activedescendant={showResults && matches[activeIndex] ? `major-search-option-${activeIndex}` : undefined}
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                    onFocus={() => { measureOpenWidth(); setFocused(true); }}
                    onBlur={() => setFocused(false)}
                    onKeyDown={onKeyDown}
                />
            </motion.div>

            {showResults && (
                <ul id='major-search-results' className='major-search-results' role='listbox'>
                    {matches.length === 0 && <li className='major-search-empty'>No majors match “{query.trim()}”</li>}
                    {matches.map((major, i) => (
                        <li
                            key={major}
                            id={`major-search-option-${i}`}
                            role='option'
                            aria-selected={i === activeIndex}
                            className={`major-search-option${i === activeIndex ? ' major-search-option--active' : ''}`}
                            // Keep focus in the input so blur doesn't close the list before the click lands
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => choose(major)}
                        >
                            {major}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
