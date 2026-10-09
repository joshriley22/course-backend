import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { addTakenCourse, fetchCourseInfo, fetchMajors, removeTakenCourse } from '../api/courses';
import { CourseListItem } from '../components/CourseListItem';
import { CoursePicker } from '../components/CoursePicker';
import { MajorPicker } from '../components/MajorPicker';
import type { MajorOptionsStatus } from '../components/MajorPicker';
import { NodeDetails } from '../components/NodeDetails';
import type { ReviewSummary } from '../components/NodeDetails';
import { CoursesTakenList, loadTakenCourses } from '../utils/CoursesTakenList';
import { getUsername, isLoggedIn } from '../utils/auth';
import { addMajor, getProfileState, removeMajor } from '../utils/ProfileStore';
import { courseKeyOf } from '../utils/ScheduleFormatter';
import { pageTransition } from '../utils/pageTransition';
import type { CourseDetails, CourseSearchResult, TakenCourse } from '../types';
import '../App.css';
import './Profile.css';

const SKELETON_COUNT = 6;

function RemoveIcon() {
    return (
        <svg viewBox='0 0 16 16' width='10' height='10' aria-hidden='true'>
            <path d='M4 4l8 8M12 4l-8 8' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
}

function ProfileContent({ username }: { username: string }) {
    const [courses, setCourses] = useState<TakenCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [coursesError, setCoursesError] = useState(false);
    const [addCourseOpen, setAddCourseOpen] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const [selectedMajors, setSelectedMajors] = useState<string[]>(() => getProfileState(username).majors);
    const [majorOptions, setMajorOptions] = useState<string[]>([]);
    const [optionsStatus, setOptionsStatus] = useState<MajorOptionsStatus>('loading');
    const [addMajorOpen, setAddMajorOpen] = useState(false);

    const [nodeInfo, setNodeInfo] = useState<CourseDetails | null>(null);
    const [detailMode, setDetailMode] = useState(false);
    const [focusSection, setFocusSection] = useState<'reviews' | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        loadTakenCourses(username)
            .then((list) => { if (!cancelled) setCourses(list); })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setCoursesError(true);
            })
            .finally(() => { if (!cancelled) setCoursesLoading(false); });
        return () => { cancelled = true; };
    }, [username]);

    useEffect(() => {
        let cancelled = false;
        fetchMajors()
            .then((list) => {
                if (cancelled) return;
                setMajorOptions(list);
                setOptionsStatus('ready');
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setOptionsStatus('error');
            });
        return () => { cancelled = true; };
    }, []);

    const takenKeys = useMemo(() => new Set(courses.map(courseKeyOf)), [courses]);

    const handleAddCourse = useCallback(async (course: CourseSearchResult) => {
        await addTakenCourse(username, course.code, course.number);
        setCourses(await loadTakenCourses(username));
        setCoursesError(false);
    }, [username]);

    const handleRemoveCourse = useCallback(async (course: TakenCourse) => {
        const key = courseKeyOf(course);
        setRemoveError(null);
        setCourses((prev) => prev.filter((c) => courseKeyOf(c) !== key));
        CoursesTakenList.getInstance().removeCourse(course.uuid);
        try {
            await removeTakenCourse(username, course.code, course.number);
        } catch (err) {
            console.error(err);
            setRemoveError(`Couldn't remove ${course.code} ${course.number}. Try again.`);
            try {
                setCourses(await loadTakenCourses(username));
            } catch (reloadErr) {
                console.error(reloadErr);
            }
        }
    }, [username]);

    useEffect(() => {
        if (!removeError) return;
        const timer = setTimeout(() => setRemoveError(null), 6000);
        return () => clearTimeout(timer);
    }, [removeError]);

    const handleReviewPosted = useCallback((course: { code: string; number: string }, summary: ReviewSummary) => {
        const key = courseKeyOf(course);
        setCourses((prev) => prev.map((c) => (
            courseKeyOf(c) === key ? { ...c, reviewCount: summary.reviewCount, rating: summary.rating } : c
        )));
    }, []);

    const openDetails = useCallback((course: { code: string; number: string }, section?: 'reviews') => {
        setFocusSection(section);
        fetchCourseInfo(course.code, course.number)
            .then((info) => { setNodeInfo(info); setDetailMode(true); })
            .catch(console.error);
    }, []);

    const handleAddMajor = useCallback((major: string) => {
        setSelectedMajors(addMajor(username, major).majors);
    }, [username]);

    const handleRemoveMajor = useCallback((major: string) => {
        setSelectedMajors(removeMajor(username, major).majors);
    }, [username]);

    const coursesMessage = !coursesLoading && (coursesError || courses.length === 0);

    return (
        <>
            <motion.div id='content-container' className='profile-page main-content flex flex-col full-width full-height' {...pageTransition}>
                <section className='profile-welcome flex flex-col' aria-labelledby='profile-welcome-title'>
                    <h1 id='profile-welcome-title'>Welcome, {username}!</h1>
                    <div className='profile-majors flex flex-row items-center justify-between'>
                        <div className='profile-majors-list flex flex-row items-center'>
                            <span className='profile-majors-label'>My majors:</span>
                            <button type='button' className='profile-link-btn' onClick={() => setAddMajorOpen(true)}>
                                Add major(s)
                            </button>
                            {selectedMajors.length === 0 ? (
                                <span className='profile-majors-empty'>None</span>
                            ) : (
                                <ul className='profile-major-chips flex flex-row'>
                                    {selectedMajors.map((major) => (
                                        <li key={major} className='profile-major-chip flex flex-row items-center'>
                                            <span>{major}</span>
                                            <button
                                                type='button'
                                                className='profile-major-remove'
                                                onClick={() => handleRemoveMajor(major)}
                                                aria-label={`Remove ${major}`}
                                            >
                                                <RemoveIcon />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>

                <section className='profile-panel flex flex-col' aria-labelledby='profile-courses-title'>
                    <div className='profile-panel-caption flex flex-row items-center justify-between'>
                        <h2 id='profile-courses-title'>My courses</h2>
                        <button type='button' className='profile-primary-btn' onClick={() => setAddCourseOpen(true)}>
                            Add course
                        </button>
                    </div>
                    {removeError && <p className='profile-notice' role='alert'>{removeError}</p>}
                    <div className={`profile-grid${coursesMessage ? ' profile-grid--message' : ''}`}>
                        {coursesLoading && Array.from({ length: SKELETON_COUNT }, (_, i) => (
                            <div key={i} className='profile-skeleton' />
                        ))}
                        {!coursesLoading && coursesError && (
                            <div className='profile-empty profile-empty--error'>
                                Could not load courses
                            </div>
                        )}
                        {!coursesLoading && !coursesError && courses.length === 0 && (
                            <div className='profile-empty'>
                                Add courses you've taken to improve course recommendations
                            </div>
                        )}
                        {!coursesLoading && !coursesError && courses.map((course) => (
                            <div key={courseKeyOf(course)} className='profile-course-slot flex'>
                                <CourseListItem
                                    course={course}
                                    onShowDetails={(c) => openDetails(c)}
                                    onRemove={() => handleRemoveCourse(course)}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </motion.div>
            <AnimatePresence>
                {addCourseOpen && (
                    <CoursePicker
                        key='add-course-picker'
                        title='Add a course you’ve taken'
                        actionLabel='Add'
                        pendingLabel='Adding…'
                        doneLabel='Added'
                        doneKeys={takenKeys}
                        onPick={handleAddCourse}
                        onClose={() => setAddCourseOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {addMajorOpen && (
                    <MajorPicker
                        key='add-major-picker'
                        options={majorOptions}
                        status={optionsStatus}
                        selected={selectedMajors}
                        onAdd={handleAddMajor}
                        onClose={() => setAddMajorOpen(false)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {detailMode && nodeInfo != null && (
                    <NodeDetails
                        key={`${nodeInfo.code}${nodeInfo.number}`}
                        nodeInfo={nodeInfo}
                        focusSection={focusSection}
                        onReviewPosted={handleReviewPosted}
                        onClose={() => setDetailMode(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export function Profile() {
    const username = getUsername();
    if (!isLoggedIn() || !username) return <Navigate to='/login' replace />;
    return <ProfileContent username={username} />;
}
