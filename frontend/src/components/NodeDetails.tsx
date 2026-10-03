import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { fetchCourseReviews, postReview } from '../api/courses';
import { Carousel } from './Carousel';
import { CourseMiniGraph } from './CourseMiniGraph';
import { StarPicker } from './StarPicker';
import { StarRating } from './StarRating';
import { getUsername, isLoggedIn } from '../utils/auth';
import { formatPrerequisites } from '../utils/PrerequisiteFormatter';
import type { FieldDetails, CourseDetails, CourseReview } from '../types';
import './NodeDetails.css';

type ReviewsStatus = 'loading' | 'ready' | 'error';
type PostStatus = 'idle' | 'posting' | 'posted' | 'error';

export interface ReviewSummary {
    reviewCount: number;
    rating: number;
}

export interface NodeDetailsProps {
    nodeInfo: CourseDetails;
    onClose: () => void;
    focusSection?: 'reviews';
    onReviewPosted?: (course: { code: string; number: string }, summary: ReviewSummary) => void;
}

function formatReviewDate(timestamp?: number | null): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function CheckIcon() {
    return (
        <svg viewBox='0 0 16 16' width='14' height='14' aria-hidden='true'>
            <path d='M3 8.5 6.3 12 13 4' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    );
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function NodeDetails({ nodeInfo, onClose, focusSection, onReviewPosted }: NodeDetailsProps) {
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [reviewsStatus, setReviewsStatus] = useState<ReviewsStatus>('loading');
    const [postStatus, setPostStatus] = useState<PostStatus>('idle');
    const reviewSectionRef = useRef<HTMLElement | null>(null);
    const postFeedbackRef = useRef<HTMLParagraphElement | null>(null);
    const loggedIn = isLoggedIn();

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

    useEffect(() => {
        if (postStatus === 'posted' || postStatus === 'error') {
            postFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [postStatus]);

    useEffect(() => {
        let cancelled = false;
        setReviewsStatus('loading');
        fetchCourseReviews(nodeInfo.code, nodeInfo.number)
            .then((list) => {
                if (cancelled) return;
                setReviews(list);
                setReviewsStatus('ready');
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setReviewsStatus('error');
            });
        return () => { cancelled = true; };
    }, [nodeInfo.code, nodeInfo.number]);

    const handlePost = async () => {
        const username = getUsername();
        if (!username || rating === 0 || postStatus === 'posting') return;
        setPostStatus('posting');
        try {
            const posted = await postReview(username, nodeInfo.code, nodeInfo.number, rating, reviewText.trim());
            setReviews((prev) => [
                { text: posted.text, rating: posted.rating, username: posted.username, created_at: posted.created_at },
                ...prev,
            ]);
            setReviewsStatus('ready');
            setReviewText('');
            setRating(0);
            setPostStatus('posted');
            onReviewPosted?.(
                { code: nodeInfo.code, number: nodeInfo.number },
                { reviewCount: posted.review_count, rating: posted.course_rating },
            );
        } catch (err) {
            console.error(err);
            setPostStatus('error');
        }
    };

    const prereqs = nodeInfo?.prerequisites ?? [];
    const hasPrereqs = prereqs.length > 0 && !!prereqs[0]?.prereq1_code;
    const prereqSummary = hasPrereqs ? formatPrerequisites(prereqs) : 'None on record.';

    const children = nodeInfo?.children ?? [];
    const unlocksSummary = children.length > 0 && children[0].name != null
        ? children.map((c) => `${c.name} (${c.code} ${c.number})`).join(', ')
        : 'Nothing requires this course directly.';

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
                        <h2>Reviews{reviewsStatus === 'ready' && reviews.length > 0 ? ` (${reviews.length})` : ''}</h2>

                        <div className='node-reviews' aria-live='polite'>
                            {reviewsStatus === 'loading' && <p className='node-reviews-message'>Loading reviews&hellip;</p>}
                            {reviewsStatus === 'error' && (
                                <p className='node-reviews-message node-reviews-message--error'>Couldn&rsquo;t load reviews. Try again shortly.</p>
                            )}
                            {reviewsStatus === 'ready' && reviews.length === 0 && (
                                <p className='node-reviews-message'>No reviews yet. Be the first to post one.</p>
                            )}
                            {reviewsStatus === 'ready' && reviews.length > 0 && (
                                <ul className='node-reviews-list'>
                                    {reviews.map((review, i) => (
                                        <li key={`${review.username}-${review.created_at ?? i}-${i}`} className='node-review'>
                                            <div className='node-review-head'>
                                                <StarRating rating={Number(review.rating ?? 0)} size={14} />
                                                <span className='node-review-meta'>
                                                    {review.username}
                                                    {review.created_at ? ` \u00B7 ${formatReviewDate(review.created_at)}` : ''}
                                                </span>
                                            </div>
                                            {review.text && <p className='node-review-text'>{review.text}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {loggedIn ? (
                            <div className='node-review-composer'>
                                <div className='node-review-rate'>
                                    <StarPicker
                                        value={rating}
                                        onChange={(value) => { setRating(value); setPostStatus('idle'); }}
                                        disabled={postStatus === 'posting'}
                                    />
                                    <span className='node-review-rate-hint'>{rating ? `${rating} / 5` : 'Select a rating'}</span>
                                </div>
                                <textarea
                                    className='node-details-review-input'
                                    placeholder='Create review'
                                    value={reviewText}
                                    onChange={(e) => { setReviewText(e.target.value); setPostStatus('idle'); }}
                                    disabled={postStatus === 'posting'}
                                    maxLength={2000}
                                />
                                <button
                                    type='button'
                                    className='node-details-post-btn'
                                    disabled={rating === 0 || postStatus === 'posting'}
                                    onClick={handlePost}
                                >
                                    {postStatus === 'posting' ? 'Posting\u2026' : 'Post'}
                                </button>
                                {postStatus === 'posted' && (
                                    <p ref={postFeedbackRef} className='node-review-banner node-review-banner--success' role='status'>
                                        <CheckIcon /> Your review was posted.
                                    </p>
                                )}
                                {postStatus === 'error' && (
                                    <p ref={postFeedbackRef} className='node-review-banner node-review-banner--error' role='alert'>
                                        Couldn&rsquo;t post your review. Try again.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className='node-reviews-message'>
                                <Link to='/login'>Log in</Link> to write a review.
                            </p>
                        )}
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
