import { createContext, useContext } from 'react';
import type { CourseData } from '../types';

// Callbacks the Explore page hands to every course node. Passed through context
// rather than node props so nodeTypes can stay a stable module-level constant:
// a nodeTypes object that changes identity makes React Flow remount every node,
// which drops keyboard focus.
export interface GraphActionsValue {
    openDetails: (course: CourseData) => void;
    addToSchedule: (course: CourseData) => void;
}

export const GraphActions = createContext<GraphActionsValue | null>(null);

export function useGraphActions(): GraphActionsValue | null {
    return useContext(GraphActions);
}
