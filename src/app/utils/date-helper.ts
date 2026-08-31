import { CalendarDate } from "../models/date.model";

export function parseCalendarDate(value: string): CalendarDate | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!isValidCalendarDate({ year, month, day })) return null;

    return { year, month, day };
}

export function formatCalendarDate(date: CalendarDate): string {
    return [
        date.year.toString().padStart(2, '0'),
        date.month.toString().padStart(2, '0'),
        date.day.toString().padStart(2, '0'),
    ].join('-');
}

export function todayCalendarDate(): CalendarDate {
    const date = new Date();

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    }
}

export function daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

export function firstWeekDay(year: number, month: number): number {
    const date = new Date(year, month - 1, 1);

    return (date.getDay() + 6) % 7;
}

export function isValidCalendarDate(date: CalendarDate): boolean {
    if (date.month < 1 || date.month > 12) return false;
    if (date.day < 1) return false;

    return date.day <= daysInMonth(date.year, date.month);
}