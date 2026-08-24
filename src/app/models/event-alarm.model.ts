import { TimerSound } from "../services/sound-svc";

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type EventAlarmRepeat =
    {
        type: 'once';
    }
    | {
        type: 'daily';
        interval: number;
    }
    | {
        type: 'weekly';
        days: WeekDay[];
    }
    | {
        type: 'monthly';
        day: number;
    }
    | {
        type: 'yearly';
        month: number;
        day: number;
    }

export interface EventAlarmDraft {
    title: string;
    description: string;
    date: string;
    time: string;
    repeat: EventAlarmRepeat;
    sound: TimerSound;
}

export interface EventAlarm {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    repeat: EventAlarmRepeat;
    sound: TimerSound;
    enabled: boolean;
    createdAt: number;
    lastFiredAt: number | null;
}