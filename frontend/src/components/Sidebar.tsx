import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Sidebar.css';

export function Sidebar({ transparent = false }: { transparent?: boolean }) {
  return (
    <motion.div
      id='sidebar'
      className={`sidebar flex flex-col full-height${transparent ? ' sidebar--transparent' : ''}`}
      animate={{
        backgroundColor: transparent ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 1)',
        boxShadow: transparent ? 'inset -1px 0 0 rgba(225, 228, 232, 0)' : 'inset -1px 0 0 rgba(225, 228, 232, 1)'
      }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      <NavLink to='/profile' className={({ isActive }) => `sidebar-profile${isActive ? ' sidebar-profile--active' : ''}`} aria-label='View profile'>
        <span className='sidebar-avatar'>
          <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
            <circle cx='12' cy='8.5' r='3.75' fill='none' stroke='currentColor' strokeWidth='1.75' />
            <path d='M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' />
          </svg>
        </span>
      </NavLink>
      <nav className='sidebar-nav flex flex-col'>
        <NavLink to='/' end className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>Home</NavLink>
        <NavLink to='/explore' className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>Explore Courses</NavLink>
        <NavLink to='/login' className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}>Login</NavLink>
      </nav>
    </motion.div>
  );
}
