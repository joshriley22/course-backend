import { motion } from 'framer-motion';
import { StarRating } from './StarRating';
import { formatSessionDays, formatSessionTime } from '../utils/SessionFormatter';
import type { ClassDetails } from '../types';
import './Session.css';

export function Session({ session, cleared }: { session?: ClassDetails; cleared?: boolean }) {

        return (
            <motion.div className='session-card flex flex-col justify-center'>
                {session && (
                    <motion.div
                        className='session-card-body'
                        animate={{ opacity: cleared ? 0 : 1 }}
                        transition={{ duration: cleared ? 0 : 0.5 }}
                    >
                        <div className='session-professor'>{session.professor}</div>
                        <div className='session-rating-row flex flex-row items-center'>
                            <StarRating rating={Number(session.professor_rating)} size={12} />
                            <span className='session-rating-value'>{session.professor_rating}/5</span>
                        </div>
                        <div className='session-time'>{formatSessionTime(session.start, session.end)}</div>
                        <div className='session-days'>{formatSessionDays(session.days)}</div>
                    </motion.div>
                )}
            </motion.div>
            )
    }
