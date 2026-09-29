export interface RequirementItem {
    id: string;
    label: string;
    done: boolean;
}

interface ProfileState {
    school: string | null;
    majors: string[];
    requirements: RequirementItem[];
}

const EMPTY_STATE: ProfileState = { school: null, majors: [], requirements: [] };

function storageKey(username: string): string {
    return `profile:${username}`;
}

function load(username: string): ProfileState {
    try {
        const raw = localStorage.getItem(storageKey(username));
        if (!raw) return { ...EMPTY_STATE };
        const parsed = JSON.parse(raw);
        return {
            school: parsed.school ?? null,
            majors: Array.isArray(parsed.majors) ? parsed.majors : [],
            requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        };
    } catch {
        return { ...EMPTY_STATE };
    }
}

function persist(username: string, state: ProfileState) {
    try {
        localStorage.setItem(storageKey(username), JSON.stringify(state));
    } catch {
        // localStorage unavailable (e.g. private browsing) - fail silently
    }
}

export function getProfileState(username: string): ProfileState {
    return load(username);
}

export function setSchool(username: string, school: string): ProfileState {
    const state = load(username);
    state.school = school;
    persist(username, state);
    return state;
}

export function addMajor(username: string, major: string): ProfileState {
    const state = load(username);
    if (!state.majors.includes(major)) state.majors = [...state.majors, major];
    persist(username, state);
    return state;
}

export function removeMajor(username: string, major: string): ProfileState {
    const state = load(username);
    state.majors = state.majors.filter((m) => m !== major);
    persist(username, state);
    return state;
}

export function addRequirement(username: string, label: string): ProfileState {
    const state = load(username);
    const trimmed = label.trim();
    if (trimmed) {
        state.requirements = [...state.requirements, { id: crypto.randomUUID(), label: trimmed, done: false }];
    }
    persist(username, state);
    return state;
}

export function toggleRequirement(username: string, id: string): ProfileState {
    const state = load(username);
    state.requirements = state.requirements.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
    persist(username, state);
    return state;
}

export function removeRequirement(username: string, id: string): ProfileState {
    const state = load(username);
    state.requirements = state.requirements.filter((r) => r.id !== id);
    persist(username, state);
    return state;
}
