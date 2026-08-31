export interface CalendarDate {
    year: number;
    month: number;
    day: number;
}

export interface CalendarDay {
    day: number;
    date: CalendarDate;
    currentMonth: boolean;
}

export type DatePickerMode = 'calendar' | 'inputs' | 'wheel';