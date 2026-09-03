import { motion, MotionConfig } from 'framer-motion';
import { Carousel } from './Carousel';
import { formatPrerequisites } from '../utils/PrerequisiteFormatter';
import type { FieldDetails, CourseData, CourseDetails } from '../types';

export interface NodeDetailsProps {
    nodeInfo: CourseDetails;
    onClose: () => void;
}

export function NodeDetails({ nodeInfo, onClose }: NodeDetailsProps) {
    return (
        <MotionConfig transition={{ ease: 'easeInOut', duration: '0.4' }}>
        <motion.div style={{ display: 'flex', flexDirection: 'column', width: '30%', height: '100%', position: 'absolute', top: '105px', right:'30%', backgroundColor: '#ffffff', zOrder: '1000'}} initial={{ opacity: 1}} animate={{ opacity: 1, x: '-100%' }}>
            <h1>{nodeInfo?.name}</h1>
            <h2>{nodeInfo?.code} {nodeInfo?.number}</h2>
            <p>Credits: {nodeInfo?.credits}</p>
            <p>Satisfies: {nodeInfo?.fields.map((field : FieldDetails) => `${field.field.charAt(0).toUpperCase() + field.field.slice(1)} for ${field.major_name}`).join(', ')}</p>
            <p>Prerequisites: {formatPrerequisites(nodeInfo?.prerequisites)}</p>
            <p>Children: {nodeInfo?.children.map((child : CourseData) => `${child.code} ${child.number}`).join(', ')}</p>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
                    <Carousel sessions={nodeInfo?.sessions ?? []}/>
            </div>
            <button>Create Review</button>
            <button onClick={onClose}>Close</button>
        </motion.div>
        </MotionConfig>
    );
}
