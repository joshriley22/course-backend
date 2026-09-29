const STORAGE_KEY = 'loggedIn';
const USERNAME_KEY = 'username';

export function isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setLoggedIn(username: string): void {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(USERNAME_KEY, username);
}

export function getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
}

export function logOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USERNAME_KEY);
}
