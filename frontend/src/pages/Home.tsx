import { useEffect } from 'react';
import { fetchEligibleNextCourses, fetchMajors } from '../api/courses';
import { CoursesTakenList } from '../utils/CoursesTakenList';

export function Home() {

    useEffect(() => {
        fetchMajors()
            .then((majors) => fetchEligibleNextCourses(
                CoursesTakenList.getInstance().getCourses(),
                ['elective'],
                majors,
            ))
            .then((result) => console.log(result))
            .catch(console.error);
    }, []);

    return <p>PLACEHOLDER</p>;
}
