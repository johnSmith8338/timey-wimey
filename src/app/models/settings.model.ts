export type AppTheme = 'light' | 'dark';

export type HistoryRetentionDays = -1 | 1 | 7 | 30 | 90;

export type AlarmSortMode = 'manual' | 'time';

export type AlarmAutoStopMinutes = 1 | 2 | 3 | 5 | 10;

export interface AppSettings {
    theme: AppTheme;
    historyRetentionDays: HistoryRetentionDays;
    keepScreenAwake: boolean;
    alarmSortMode: AlarmSortMode;
    alarmAutoStopMinutes: AlarmAutoStopMinutes;
    firstRunCompleted: boolean;
    notificationsEnabled: boolean;
    notificationPromptShown: boolean;
}