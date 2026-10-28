import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchEligibleNextCourses, fetchMajors, fetchCourseInfo, fetchRecommendations } from '../api/courses';
import { CoursesTakenList } from '../utils/CoursesTakenList';
import { getUsername } from '../utils/auth';
import { getProfileState } from '../utils/ProfileStore';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { SelectedCoursesStrip } from '../components/SelectedCoursesStrip';
import { CourseSearchPanel } from '../components/CourseSearchPanel';
import { NodeDetails } from '../components/NodeDetails';
import type { ReviewSummary } from '../components/NodeDetails';
import { SessionPicker } from '../components/SessionPicker';
import { courseKeyOf } from '../utils/ScheduleFormatter';
import { SelectedCoursesList, useSelectedCourses } from '../utils/SelectedCoursesList';
import { pageTransition } from '../utils/pageTransition';
import type { CourseDetails, EligibleCourse, EligibleCourseSession } from '../types';
import '../App.css';
import './Home.css';

function profileMajorsOf(username: string | null): string[] {
    return username ? getProfileState(username).majors : [];
}

export function Home() {
    const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const selectedCourses = useSelectedCourses();

    const [nodeInfo, setNodeInfo] = useState<CourseDetails | null>(null);
    const [detailMode, setDetailMode] = useState(false);
    const [focusSection, setFocusSection] = useState<'reviews' | undefined>(undefined);
    const [sessionChoice, setSessionChoice] = useState<EligibleCourse | null>(null);

    const [generating, setGenerating] = useState(false);
    const [recommendNotice, setRecommendNotice] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        // Prefer the user's own majors; fall back to every major until they pick one on Profile
        const profileMajors = profileMajorsOf(getUsername());
        (profileMajors.length > 0 ? Promise.resolve(profileMajors) : fetchMajors())
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

    // Adding always goes through the session picker first; selected courses keep only
    // the sessions the user chose (one lecture, one lab/discussion).
    const handleToggleSelected = useCallback((course: EligibleCourse) => {
        const store = SelectedCoursesList.getInstance();
        if (store.isSelected(course)) {
            store.removeCourse(course);
            return;
        }
        setSessionChoice(course);
    }, []);

    const handleSessionsChosen = useCallback((sessions: EligibleCourseSession[]) => {
        if (sessionChoice) SelectedCoursesList.getInstance().addCourse(sessionChoice, sessions);
        setSessionChoice(null);
    }, [sessionChoice]);

    const handleRemove = useCallback((course: EligibleCourse) => {
        SelectedCoursesList.getInstance().removeCourse(course);
    }, []);

    const handleReviewPosted = useCallback((course: { code: string; number: string }, summary: ReviewSummary) => {
        const key = courseKeyOf(course);
        const patch = { reviewCount: summary.reviewCount, rating: summary.rating };
        setEligibleCourses((list) => list.map((c) => (courseKeyOf(c) === key ? { ...c, ...patch } : c)));
        SelectedCoursesList.getInstance().updateCourse(course, patch);
    }, []);

    // Recommendations fill around whatever is already on the schedule rather than replacing it.
    const handleGenerate = useCallback(() => {
        const majors = profileMajorsOf(getUsername());
        if (majors.length === 0) {
            setRecommendNotice('Add a major on your Profile to get recommendations.');
            return;
        }
        setGenerating(true);
        setRecommendNotice(null);
        const store = SelectedCoursesList.getInstance();
        fetchRecommendations(CoursesTakenList.getInstance().getCourses(), majors, store.getCourses())
            .then(({ courses, warning }) => {
                courses.forEach((course) => store.addCourse(course));
                setRecommendNotice(warning ?? (courses.length === 0 ? 'No more courses fit around your schedule.' : null));
            })
            .catch((err) => {
                console.error(err);
                setRecommendNotice('Could not generate recommendations. Try again shortly.');
            })
            .finally(() => setGenerating(false));
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
                        onGenerate={handleGenerate}
                        generating={generating}
                        notice={recommendNotice}
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
            <AnimatePresence>
                {sessionChoice != null && (
                    <SessionPicker
                        course={sessionChoice}
                        onChoose={handleSessionsChosen}
                        onClose={() => setSessionChoice(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
