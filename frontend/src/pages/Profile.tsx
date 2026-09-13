import { motion } from 'framer-motion';
import { pageTransition } from '../utils/pageTransition';
import '../App.css';

export function Profile() {
    return (
        <motion.div id='content-container' className='main-content flex flex-col items-center full-width full-height' {...pageTransition}>
            <p>PLACEHOLDER</p>
        </motion.div>
    );
}
