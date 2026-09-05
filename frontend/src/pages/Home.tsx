import { useEffect } from 'react';
import { fetchEligibleNextCourses, fetchMajors } from '../api/courses';
import { CoursesTakenList } from '../utils/CoursesTakenList';
import { Sidebar } from '../components/Sidebar';
import '../App.css';

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

    return (
        <div id='body-container' className='flex items-center justify-center viewport-overlay'>
            <Sidebar />
            <div id='content-container' className='main-content flex flex-col items-center full-width full-height'>
                <p>PLACEHOLDER</p>
            </div>
        </div>
    );
}
