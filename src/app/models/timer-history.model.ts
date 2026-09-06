import { TimerIcon } from "../constants/icons";
import { TimerSound } from "../services/sound-svc";
import { VibrationSetting } from "./settings.model";

export type TimerHistoryStatus = 'finished' | 'cancelled';

export interface TimerHistorySnapshot {
    title: string;
    hours: number;
    minutes: number;
    seconds: number;
    sound: TimerSound;
    vibration: VibrationSetting;
    icon?: TimerIcon;
}

export interface TimerHistoryItem {
    id: string;
    startedAt: number;
    finishedAt: number;
    durationMs: number;
    elapsedMs: number;
    status: TimerHistoryStatus;
    snapshot: TimerHistorySnapshot;
}

export interface TimerHistoryGroup {
    title: string;
    items: TimerHistoryItem[];
}