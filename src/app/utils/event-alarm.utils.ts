import { EventAlarmRepeat, WeekDay } from "../models/alarm.interface";

const WEEK_DAY_NAMES: Record<WeekDay, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
};

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

export function describeEventRepeat(repeat: EventAlarmRepeat): string {
    switch (repeat.type) {
        case 'once':
            return 'once';
        case 'daily':
            return repeat.interval === 1 ? 'every day' : `every ${repeat.interval} days`;
        case 'weekly':
            if (!repeat.days.length) return 'every week';
            return `every ${joinList(repeat.days.map(day => WEEK_DAY_NAMES[day]))}`;
        case 'monthly':
            return `every month on day ${repeat.day}`;
        case 'yearly':
            return `every year on ${MONTH_NAMES[repeat.month - 1]} ${repeat.day}`;
    }
}

function joinList(items: string[]): string {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}