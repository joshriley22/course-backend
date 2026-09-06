import { useEffect, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { Session } from './Session';
import type { ClassDetails } from '../types';
import './Carousel.css';

const IDS = ['session0', 'session1', 'session2', 'session3', 'session4'];

const initialStates = [ {x: 0, opacity: 0, scale: 0}, {x: 0, opacity: 0.8, scale: 0.6}, {x: 0, opacity: 1, scale: 1}, {x: 0, opacity: 0.8, scale: 0.6}, {x: 0, opacity: 0, scale: 0} ]

function ArrowIcon({ direction }: { direction: 'prev' | 'next' }) {
    const d = direction === 'prev' ? 'M12.5 4.5 7 10l5.5 5.5' : 'm7.5 4.5 5.5 5.5-5.5 5.5';
    return (
        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
            <path d={d} fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    );
}

export function Carousel({ sessions }: { sessions: ClassDetails[] }) {
    const FORWARD = 1;
    const BACKWARD = -1;
    const NO_OPERATION = 0;
    const [state, setState] = useState<number>(0);
    const [scope, animate] = useAnimate();
    const [sessionsIndex, setSessionsIndex] = useState(0);
    const [showText, setShowText] = useState(true);

    const getSessionForIndex = (index: number) => {
        if (!sessions || sessions.length === 0) return undefined;
        const len = sessions.length;
        const dataIndex = ((sessionsIndex + (index - 2)) % len + len) % len;
        return sessions[dataIndex];
    };

    const handleNext = () => setSessionsIndex(i => (i + 1) % sessions.length);
    const handlePrev = () => setSessionsIndex(i => (i - 1 + sessions.length) % sessions.length);

    useEffect(() => {
        if (state === NO_OPERATION) return;
        const direction = state;
        const shiftX = direction === FORWARD ? '100%' : '-100%';
        setShowText(false);
        Promise.all(
            IDS.map((id, index) => {
                const neighbor = initialStates[index + direction] ?? { opacity: 0, scale: 0 };
                return animate(`#${id}`, { x: shiftX, opacity: neighbor.opacity, scale: neighbor.scale }, { duration: 0.5 });
            }),
            ).then(() => {
                IDS.forEach((id, index) => animate(`#${id}`, initialStates[index], { duration: 0 }));
                setState(NO_OPERATION);
                setShowText(true);
                }).then(() => {
                    if(sessions.length == 0) return;
                    direction === FORWARD ? handleNext() : handlePrev();
                    });
        }, [state]);


    if (!sessions || sessions.length === 0) {
        return <p className='carousel-empty'>No scheduled sessions on record.</p>;
    }

    const canCycle = sessions.length > 1 && state === NO_OPERATION;

    return (
        <div className='carousel-row flex flex-row items-center'>
            <button
                type='button'
                className='carousel-arrow'
                onClick={() => setState(BACKWARD)}
                disabled={!canCycle}
                aria-label='Previous session'
            >
                <ArrowIcon direction='prev' />
            </button>
            <div ref={scope} className='flex flex-row carousel'>
            {IDS.map((id, index) => (
                <motion.div
                    key={id}
                    id={id}
                    initial={initialStates[index]}
                    className={`carousel-item${index === 0 || index === IDS.length - 1 ? ' carousel-item--edge' : ''}`}
                >
                    <Session
                        session={getSessionForIndex(index)}
                        cleared={id === 'session2' ? !showText : true}
                    />
                </motion.div>
                ))}
            </div>
            <button
                type='button'
                className='carousel-arrow'
                onClick={() => setState(FORWARD)}
                disabled={!canCycle}
                aria-label='Next session'
            >
                <ArrowIcon direction='next' />
            </button>
        </div>
    );
}
