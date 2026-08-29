import { useEffect, useRef, useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { forceSimulation, forceCollide, forceX, forceY } from 'd3-force';
import type { Simulation, SimulationNodeDatum } from 'd3-force';
import type { OnNodeDrag } from '@xyflow/react';
import type { CourseNodeProps } from '../components/CourseNode';

interface SimNode extends SimulationNodeDatum {
    id: string;
    radius: number;
    anchorX: number;
    anchorY: number;
}

// CourseNode's rendered footprint varies with its content, so collision
// radius is derived per-node from its actual measured width/height (set by
// React Flow once it has laid the node out) rather than a fixed value.
// Before a node has been measured, fall back to its unresized on-screen
// size so the initial layout pass still has something reasonable to work
// with.
const FALLBACK_WIDTH = 150;
const FALLBACK_HEIGHT = 80;

// The collision circle is the node's bounding-circle radius (half the
// diagonal of its measured box), which guarantees the rectangles can't
// visually overlap regardless of aspect ratio.
function getNodeRadius(n: CourseNodeProps): number {
    const width = n.measured?.width ?? FALLBACK_WIDTH;
    const height = n.measured?.height ?? FALLBACK_HEIGHT;
    return Math.hypot(width, height) / 2;
}
// The x anchor is weak so overlapping nodes can spread out sideways; the y
// anchor is strong so dagre's rank (prerequisite depth) stays intact instead
// of drifting into other ranks as a side effect of collision resolution.
const ANCHOR_STRENGTH_X = 0.05;
const ANCHOR_STRENGTH_Y = 0.4;
const DRAG_ALPHA_TARGET = 0.3;
// How often (ms) to re-fit the viewport while the simulation is still
// running, so the camera tracks the spreading layout instead of jumping
// once at the end.
const FIT_THROTTLE_MS = 120;

// Runs a d3-force simulation that keeps nodes from overlapping while gently
// pulling them back toward their dagre-assigned positions, and lets dragged
// nodes push the simulation live so others flow out of the way in real time.
export function useCollisionSimulation(
    nodeProps: CourseNodeProps[],
    setNodeProps: Dispatch<SetStateAction<CourseNodeProps[]>>,
) {
    const simulationRef = useRef<Simulation<SimNode, undefined> | null>(null);
    const simNodesRef = useRef<Map<string, SimNode>>(new Map());
    const nodeIdsSignature = nodeProps.map((n) => n.id).sort().join('|');
    // Bumped (throttled) as the initial collision pass runs and once more
    // when it settles, so callers can re-fit the viewport to the growing
    // layout bounds instead of jumping once at the end. Left alone by the
    // alpha reheats that happen while a node is being dragged, so the
    // camera won't jump mid-drag.
    const [layoutTick, setLayoutTick] = useState(0);
    const lastFitAtRef = useRef(0);

    useEffect(() => {
        if (nodeProps.length === 0) {
            simulationRef.current?.stop();
            simulationRef.current = null;
            simNodesRef.current = new Map();
            return;
        }

        const simNodes: SimNode[] = nodeProps.map((n) => ({
            id: n.id,
            x: n.position.x,
            y: n.position.y,
            radius: getNodeRadius(n),
            anchorX: n.position.x,
            anchorY: n.position.y,
        }));

        const byId = new Map(simNodes.map((n) => [n.id, n]));
        simNodesRef.current = byId;
        lastFitAtRef.current = 0;
        // Only true until the *initial* layout settles; drag-triggered
        // reheats also fire 'tick'/'end' but must not re-fit the viewport,
        // or the camera would jump every time a drag ends.
        let hasSettledOnce = false;

        const simulation = forceSimulation(simNodes)
            .alphaDecay(0.05)
            .force('collide', forceCollide<SimNode>((d) => d.radius))
            .force('x', forceX<SimNode>((d) => d.anchorX).strength(ANCHOR_STRENGTH_X))
            .force('y', forceY<SimNode>((d) => d.anchorY).strength(ANCHOR_STRENGTH_Y))
            .on('tick', () => {
                setNodeProps((current) =>
                    current.map((node) => {
                        const sim = byId.get(node.id);
                        if (!sim || sim.x === undefined || sim.y === undefined) return node;
                        return { ...node, position: { x: sim.x, y: sim.y } };
                    }),
                );
                if (hasSettledOnce) return;
                const now = Date.now();
                if (now - lastFitAtRef.current >= FIT_THROTTLE_MS) {
                    lastFitAtRef.current = now;
                    setLayoutTick(now);
                }
            })
            .on('end', () => {
                if (hasSettledOnce) return;
                hasSettledOnce = true;
                setLayoutTick(Date.now());
            });

        simulationRef.current = simulation;
        return () => {
            simulation.stop();
        };
        // Only reinitialize when the set of nodes changes (a new course graph
        // loaded), not on every tick-driven position update.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeIdsSignature]);

    // Keyed on measured sizes (not positions), so this only re-runs when a
    // node's actual rendered footprint changes - e.g. once React Flow
    // measures it for the first time, or it resizes - and not on every
    // tick-driven position update from the simulation itself.
    const nodeDimensionsSignature = nodeProps
        .map((n) => `${n.id}:${n.measured?.width ?? ''}x${n.measured?.height ?? ''}`)
        .join('|');

    useEffect(() => {
        const simulation = simulationRef.current;
        if (!simulation) return;
        for (const n of nodeProps) {
            const sim = simNodesRef.current.get(n.id);
            if (sim) sim.radius = getNodeRadius(n);
        }
        simulation.force('collide', forceCollide<SimNode>((d) => d.radius));
        simulation.alpha(Math.max(simulation.alpha(), 0.3)).restart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeDimensionsSignature]);

    const onNodeDragStart: OnNodeDrag = useCallback((_event, node) => {
        const sim = simNodesRef.current.get(node.id);
        if (!sim) return;
        sim.fx = node.position.x;
        sim.fy = node.position.y;
        simulationRef.current?.alphaTarget(DRAG_ALPHA_TARGET).restart();
    }, []);

    const onNodeDrag: OnNodeDrag = useCallback((_event, node) => {
        const sim = simNodesRef.current.get(node.id);
        if (!sim) return;
        sim.fx = node.position.x;
        sim.fy = node.position.y;
    }, []);

    const onNodeDragStop: OnNodeDrag = useCallback((_event, node) => {
        const sim = simNodesRef.current.get(node.id);
        if (!sim) return;
        sim.fx = null;
        sim.fy = null;
        sim.anchorX = node.position.x;
        sim.anchorY = node.position.y;
        simulationRef.current?.alphaTarget(0);
    }, []);

    return { onNodeDragStart, onNodeDrag, onNodeDragStop, layoutTick };
}
