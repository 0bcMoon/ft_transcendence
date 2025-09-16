export function formatTimeToReadable(timeString: string | null): string {
    if (!timeString) {
        return '';
    }
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
        return '';
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeFormat = date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    if (inputDate.getTime() === today.getTime()) {
        return timeFormat;
    } else if (inputDate.getTime() === yesterday.getTime()) {
        return `Yesterday at ${timeFormat}`;
    } else {
        const fullDate = date.toLocaleDateString([], {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
        return `${fullDate} ${timeFormat}`;
    }
}
