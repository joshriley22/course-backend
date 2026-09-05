import { Link } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  return (
    <div id='sidebar' className='sidebar flex flex-col full-height'>
      <Link to='/'>Home</Link>
      <Link to='/explore'>Explore Courses</Link>
      <Link to='/login'>Login</Link>
    </div>
  );
}
