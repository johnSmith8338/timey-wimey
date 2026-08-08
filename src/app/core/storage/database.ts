export const DATABASE_NAME = 'clock-db';

export const DATABASE_VERSION = 5;

export const HISTORY_MIGRATION_VERSION = 5;

export enum DbStore {
    Settings = 'settings',
    Sessions = 'sessions',
    Timers = 'timers',
    Alarms = 'alarms',
    History = 'history'
}