import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Sidebar } from './components/Sidebar';
import { getUsername, isLoggedIn } from './utils/auth';
import { loadTakenCourses } from './utils/CoursesTakenList';
import './App.css';

function Layout() {
    const location = useLocation();
    const outlet = useOutlet();
    const [takenCoursesReady, setTakenCoursesReady] = useState(() => !isLoggedIn());

    useEffect(() => {
        if (takenCoursesReady) return;
        const username = getUsername();
        (username ? loadTakenCourses(username) : Promise.resolve())
            .catch(console.error)
            .finally(() => setTakenCoursesReady(true));
    }, [takenCoursesReady]);

    return (
        <div id='body-container' className='flex items-center justify-center viewport-overlay'>
            <Sidebar transparent={location.pathname === '/login'} />
            <AnimatePresence mode='wait'>
                <div key={location.pathname} style={{ display: 'contents' }}>
                    {takenCoursesReady && outlet}
                </div>
            </AnimatePresence>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={ <Layout /> }>
                    <Route path='/explore' element={ <Explore /> } />
                    <Route path='/login' element={ <Login /> } />
                    <Route path='/profile' element={ <Profile /> } />
                    <Route path='/' element={ <Home /> } />
                </Route>
            </Routes>
        </BrowserRouter>
        );
    }

export default App;
