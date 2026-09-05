import { useEffect, useState } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { Session } from './Session';
import type { ClassDetails } from '../types';
import './Carousel.css';

const IDS = ['session0', 'session1', 'session2', 'session3', 'session4'];

const initialStates = [ {x: 0, opacity: 0, scale: 0}, {x: 0, opacity: 0.8, scale: 0.6}, {x: 0, opacity: 1, scale: 1}, {x: 0, opacity: 0.8, scale: 0.6}, {x: 0, opacity: 0, scale: 0} ]

export function Carousel({ action, sessions }) {
    const FORWARD = 1;
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

    useEffect(() => {
        if(state == NO_OPERATION) return;
        if(state == FORWARD) {
        setShowText(false);
        Promise.all([
            animate(`#${IDS[0]}`, { x: '100%', opacity: 0.8, scale: 0.6 }, { duration: 0.5}),
            animate(`#${IDS[1]}`, { x: '100%', opacity: 1, scale: 1 }, { duration: 0.5}),
            animate(`#${IDS[2]}`, { x: '100%', opacity: 0.8, scale: 0.6 }, { duration: 0.5}),
            animate(`#${IDS[3]}`, { x: '100%', opacity: 0, scale: 0 }, { duration: 0.5}),
            animate(`#${IDS[4]}`, { x: '100%', opacity: 0, scale: 0 }, { duration: 0.5}),
            ]).then(() => {
                IDS.forEach((id, index) => animate(`#${id}`, initialStates[index], { duration: 0 }));
                setState(NO_OPERATION);
                setShowText(true);
                }).then(() => {
                    if(sessions.length == 0) return;
                    setSessionsIndex((sessionsIndex + 1) % sessions.length);
                    });
            }
        }, [state]);


    return (
        <div ref={scope} className='flex flex-row'>
        {IDS.map((id, index) => (
            <motion.div
                key={id}
                id={id}
                initial={initialStates[index]}
                className='carousel-item'
                onClick={() => setState(FORWARD)}
            >{id === 'session2' ? (
                <motion.span
                    animate={{ opacity: showText ? 1 : 0 }}
                    transition={{ duration: showText ? 0.5 : 0 }}
                ></motion.span>
                ) : id}
                <Session
                    session={getSessionForIndex(index)}
                    cleared={id === 'session2' ? !showText : true}
                />
            </motion.div>
            ))}
        </div>
    );
}
