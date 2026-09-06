import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { Carousel } from './Carousel';
import { CourseMiniGraph } from './CourseMiniGraph';
import { formatPrerequisites } from '../utils/PrerequisiteFormatter';
import type { FieldDetails, CourseDetails } from '../types';
import './NodeDetails.css';

export interface NodeDetailsProps {
    nodeInfo: CourseDetails;
    onClose: () => void;
    focusSection?: 'reviews';
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function NodeDetails({ nodeInfo, onClose, focusSection }: NodeDetailsProps) {
    const [reviewText, setReviewText] = useState('');
    const reviewSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (focusSection === 'reviews') {
            reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [focusSection]);

    const prereqs = nodeInfo?.prerequisites ?? [];
    const hasPrereqs = prereqs.length > 0 && !!prereqs[0]?.prereq1_code;
    const prereqSummary = hasPrereqs ? formatPrerequisites(prereqs) : 'None on record.';

    const children = nodeInfo?.children ?? [];
    const unlocksSummary = children.length > 0
        ? children.map((c) => `${c.name} (${c.code} ${c.number})`).join(', ')
        : 'Nothing else requires this course directly.';

    return (
        <MotionConfig transition={{ ease: 'easeOut', duration: 0.22 }}>
            <motion.div
                className='node-details-backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className='node-details-panel'
                    role='dialog'
                    aria-modal='true'
                    aria-label={nodeInfo?.name}
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className='node-details-close' onClick={onClose} aria-label='Close course details'>
                        <svg viewBox='0 0 20 20' width='16' height='16' aria-hidden='true'>
                            <path d='M5 5l10 10M15 5 5 15' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
                        </svg>
                    </button>

                    <div className='node-details-scroll flex flex-col'>

                    <div className='node-details-head'>
                        <span className='node-details-code'>{nodeInfo?.code} {nodeInfo?.number}</span>
                        <h1>{nodeInfo?.name}</h1>
                        <div className='node-details-meta'>
                            <span>{nodeInfo?.credits} credits</span>
                            {nodeInfo?.fields?.map((field: FieldDetails, i: number) => (
                                <span key={i} className='node-details-tag'>{capitalize(field.field)} &middot; {field.major_name}</span>
                            ))}
                        </div>
                    </div>

                    <section className='node-details-section'>
                        <h2>Prerequisite map</h2>
                        <CourseMiniGraph course={nodeInfo} />
                        <dl className='node-details-facts'>
                            <div>
                                <dt>Requires</dt>
                                <dd>{prereqSummary}</dd>
                            </div>
                            <div>
                                <dt>Unlocks</dt>
                                <dd>{unlocksSummary}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className='node-details-section'>
                        <h2>Upcoming sessions</h2>
                        <Carousel sessions={nodeInfo?.sessions ?? []} />
                    </section>

                    <section className='node-details-section' ref={reviewSectionRef}>
                        <h2>Reviews</h2>
                        <textarea
                            className='node-details-review-input'
                            placeholder='Create review'
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                        <button
                            type='button'
                            className='node-details-post-btn'
                            onClick={() => setReviewText('')}
                        >
                            Post
                        </button>
                    </section>

                    <div className='node-details-actions'>
                        <button className='node-details-btn node-details-btn--primary' onClick={onClose}>Close</button>
                    </div>

                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
}
