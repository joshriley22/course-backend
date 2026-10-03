import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchEligibleNextCourses, fetchMajors, fetchCourseInfo } from '../api/courses';
import { CoursesTakenList } from '../utils/CoursesTakenList';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { SelectedCoursesStrip } from '../components/SelectedCoursesStrip';
import { CourseSearchPanel } from '../components/CourseSearchPanel';
import { NodeDetails } from '../components/NodeDetails';
import type { ReviewSummary } from '../components/NodeDetails';
import { courseKeyOf, CREDIT_CAP } from '../utils/ScheduleFormatter';
import { pageTransition } from '../utils/pageTransition';
import type { CourseDetails, EligibleCourse } from '../types';
import '../App.css';
import './Home.css';

export function Home() {
    const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCourses, setSelectedCourses] = useState<EligibleCourse[]>([]);

    const [nodeInfo, setNodeInfo] = useState<CourseDetails | null>(null);
    const [detailMode, setDetailMode] = useState(false);
    const [focusSection, setFocusSection] = useState<'reviews' | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchMajors()
            .then((majors) => fetchEligibleNextCourses(
                CoursesTakenList.getInstance().getCourses(),
                ['elective'],
                majors,
            ))
            .then((courses) => { if (!cancelled) setEligibleCourses(courses); })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setError('Could not load recommended courses. Try again shortly.');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const selectedKeys = useMemo(() => new Set(selectedCourses.map(courseKeyOf)), [selectedCourses]);
    const totalCredits = useMemo(
        () => selectedCourses.reduce((sum, c) => sum + (c.credits ?? 0), 0),
        [selectedCourses],
    );

    const openDetails = useCallback((course: { code: string; number: string }, section?: 'reviews') => {
        setFocusSection(section);
        fetchCourseInfo(course.code, course.number)
            .then((info) => { setNodeInfo(info); setDetailMode(true); })
            .catch(console.error);
    }, []);

    const handleToggleSelected = useCallback((course: EligibleCourse) => {
        setSelectedCourses((prev) => {
            const key = courseKeyOf(course);
            if (prev.some((c) => courseKeyOf(c) === key)) {
                return prev.filter((c) => courseKeyOf(c) !== key);
            }
            const currentCredits = prev.reduce((sum, c) => sum + (c.credits ?? 0), 0);
            if (currentCredits + (course.credits ?? 0) > CREDIT_CAP) return prev;
            return [...prev, course];
        });
    }, []);

    const handleRemove = useCallback((course: EligibleCourse) => {
        const key = courseKeyOf(course);
        setSelectedCourses((prev) => prev.filter((c) => courseKeyOf(c) !== key));
    }, []);

    const handleReviewPosted = useCallback((course: { code: string; number: string }, summary: ReviewSummary) => {
        const key = courseKeyOf(course);
        const update = (list: EligibleCourse[]) => list.map((c) => (
            courseKeyOf(c) === key ? { ...c, reviewCount: summary.reviewCount, rating: summary.rating } : c
        ));
        setEligibleCourses(update);
        setSelectedCourses(update);
    }, []);

    const handleScheduleSelect = useCallback((course: { code: string; number: string }) => openDetails(course), [openDetails]);

    return (
        <>
            <motion.div id='content-container' className='home-page main-content flex flex-row full-width full-height' {...pageTransition}>
                <div className='home-page-main flex flex-col'>
                    <WeeklySchedule
                        courses={selectedCourses}
                        onSelectCourse={handleScheduleSelect}
                    />
                    <SelectedCoursesStrip
                        courses={selectedCourses}
                        totalCredits={totalCredits}
                        onRemove={handleRemove}
                        onShowDetails={(course) => openDetails(course)}
                    />
                </div>
                <CourseSearchPanel
                    courses={eligibleCourses}
                    loading={loading}
                    error={error}
                    selectedKeys={selectedKeys}
                    totalCredits={totalCredits}
                    onToggleSelected={handleToggleSelected}
                    onShowDetails={(course) => openDetails(course)}
                    onShowReviews={(course) => openDetails(course, 'reviews')}
                />
            </motion.div>
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
