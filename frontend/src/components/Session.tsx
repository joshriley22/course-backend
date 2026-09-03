import { motion } from 'framer-motion';
import type { ClassDetails } from '../types';

export function Session({ session, cleared }: { session?: ClassDetails; cleared?: boolean }) {

        return (
            <motion.div style={{ backgroundColor: '#ffffff', border: '1px solid #414141', borderRadius: '25px', height: '100%', width: '100%' }}>
                {session && (
                    <motion.div
                        animate={{ opacity: cleared ? 0 : 1 }}
                        transition={{ duration: cleared ? 0 : 0.5 }}
                    >
                        <div>{session.days}</div>
                        <div>{session.start} - {session.end}</div>
                        <div>{session.professor}</div>
                        <div>{session.professor_rating}</div>
                    </motion.div>
                )}
            </motion.div>
            )
    }