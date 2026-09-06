import { BrowserRouter, Routes, Route, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Explore } from './pages/Explore';
import { Profile } from './pages/Profile';
import { Sidebar } from './components/Sidebar';
import './App.css';

function Layout() {
    const location = useLocation();
    const outlet = useOutlet();

    return (
        <div id='body-container' className='flex items-center justify-center viewport-overlay'>
            <Sidebar transparent={location.pathname === '/login'} />
            <AnimatePresence mode='wait'>
                <div key={location.pathname} style={{ display: 'contents' }}>
                    {outlet}
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
