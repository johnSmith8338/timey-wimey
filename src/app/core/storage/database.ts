export const DATABASE_NAME = 'clock-db';

export const DATABASE_VERSION = 7;

export const HISTORY_MIGRATION_VERSION = 5;

export const REMOVE_SESSIONS_VERSION = 6;
export const LEGACY_SESSIONS_STORE = 'sessions';

export enum DbStore {
    Settings = 'settings',
    Timers = 'timers',
    Alarms = 'alarms',
    History = 'history'
}