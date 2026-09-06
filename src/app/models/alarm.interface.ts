import { TimerColor } from "../constants/colors";
import { TimerSound } from "../services/sound-svc";
import { VibrationMode, VibrationSetting } from "./settings.model";

export interface AlarmGroup {
    id: string;
    title: string;
    color: TimerColor;
    order: number;
    expanded: boolean;
}

export interface AlarmGroupView {
    id: string | null;
    title: string;
    expanded: boolean;
    system: boolean;
    alarms: Alarm[];
}

export interface Alarm {
    type: 'alarm';
    id: string;
    groupId: string | null;
    title: string;
    hour: number;
    minute: number;
    repeat: AlarmRepeat[];
    sound: TimerSound;
    vibration: VibrationSetting;
    createdAt: number;
    updatedAt: number;
    order: number;
    enabled: boolean;
}

export interface EventAlarm {
    type: 'event';
    id: string;
    groupId: null;
    title: string;
    description: string;
    date: string;
    time: string;
    sound: TimerSound;
    vibration: VibrationSetting;
    enabled: boolean;
    repeat: EventAlarmRepeat;
    createdAt: number;
    updatedAt: number;
    order: number;
    lastFiredAt: number | null;
}

export type AlarmRepeat = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

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
    vibration: VibrationSetting;
}