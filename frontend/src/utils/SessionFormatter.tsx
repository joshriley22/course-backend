const DAY_LETTERS: Record<string, string> = {
    Su: 'S',
    Mo: 'M',
    Tu: 'T',
    We: 'W',
    Th: 'R',
    Fr: 'F',
    Sa: 'S',
};

export function formatSessionDays(days: string | null | undefined): string {
    if (!days) return '';
    const letters: string[] = [];
    for (let i = 0; i < days.length; i += 2) {
        const chunk = days.slice(i, i + 2);
        letters.push(DAY_LETTERS[chunk] ?? chunk.charAt(0).toUpperCase());
    }
    return letters.join(' ');
}

function formatClockTime(raw: string | null | undefined): string {
    if (!raw) return '';
    const [hourStr, minuteStr] = raw.split('.');
    const hour = parseInt(hourStr, 10);
    if (Number.isNaN(hour)) return raw;
    const minute = (minuteStr ?? '00').padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute} ${period}`;
}

export function formatSessionTime(start: string | null | undefined, end: string | null | undefined): string {
    const formattedStart = formatClockTime(start);
    const formattedEnd = formatClockTime(end);
    if (!formattedStart && !formattedEnd) return '';
    return `${formattedStart} – ${formattedEnd}`;
}
