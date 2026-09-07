import { AlarmInputMode } from "./alarm-input-mode.type";
import { DatePickerMode } from "./date.model";

export type AppTheme = 'light' | 'dark';

export type HistoryRetentionDays = -1 | 1 | 7 | 30 | 90;

export type AlarmSortMode = 'manual' | 'time';

export type AlarmAutoStopMinutes = 1 | 2 | 3 | 5 | 10;

export type VibrationMode = 'inherit' | 'off';

export type VibrationSetting = 'off' | 'short' | 'double' | 'long' | 'alarm';

export const VIBRATION_PATTERNS: Record<Exclude<VibrationSetting, 'off'>, number | number[]> = {
    short: 100,
    double: [100, 80, 100],
    long: 500,
    alarm: [200, 100, 200, 100, 500]
}

export type AlarmSoundRampUp = 'off' | 'slow' | 'normal' | 'fast';

export const ALARM_SOUND_RAMP_UP_DURATION: Record<Exclude<AlarmSoundRampUp, 'off'>, number> = {
    slow: 15_000,
    normal: 10_000,
    fast: 5_000
}

export interface AppSettings {
    theme: AppTheme;
    historyRetentionDays: HistoryRetentionDays;
    keepScreenAwake: boolean;
    alarmSortMode: AlarmSortMode;
    alarmAutoStopMinutes: AlarmAutoStopMinutes;
    alarmTimeInputMode: AlarmInputMode;
    alarmSoundRampUp: AlarmSoundRampUp;
    vibrationEnabled: boolean;
    datePickerMode: DatePickerMode;
    firstRunCompleted: boolean;
    notificationsEnabled: boolean;
    notificationPromptShown: boolean;
}