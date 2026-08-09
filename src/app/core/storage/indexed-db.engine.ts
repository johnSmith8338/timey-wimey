import { Injectable } from "@angular/core";
import { StorageEngine } from "./storage-engine";
import { DATABASE_NAME, DATABASE_VERSION, DbStore, HISTORY_MIGRATION_VERSION, LEGACY_SESSIONS_STORE, REMOVE_SESSIONS_VERSION } from "./database";
import { StorageKey } from "./storage-keys";

@Injectable({
    providedIn: 'root'
})
export class IndexedDbEngine extends StorageEngine {
    private readonly db = this.openDatabase();

    private openDatabase(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = request.result;
                const transaction = request.transaction!;

                if (!db.objectStoreNames.contains(DbStore.History)) {
                    db.createObjectStore(DbStore.History);
                }

                if (event.oldVersion < HISTORY_MIGRATION_VERSION) {
                    this.migrateToHistory(db, transaction);
                }

                if (event.oldVersion < REMOVE_SESSIONS_VERSION && db.objectStoreNames.contains(LEGACY_SESSIONS_STORE)) {
                    db.deleteObjectStore(LEGACY_SESSIONS_STORE);
                }
            };
        })
    }

    private async getStore(store: DbStore, mode: IDBTransactionMode) {
        const db = await this.db;
        return db.transaction(store, mode).objectStore(store);
    }

    async get<T>(store: DbStore, key: IDBValidKey): Promise<T | undefined> {
        const objectStore = await this.getStore(store, 'readonly');

        return new Promise((resolve, reject) => {
            const request = objectStore.get(key);
            request.onsuccess = () => resolve(request.result as T | undefined);
            request.onerror = () => reject(request.error);
        })
    }

    async set<T>(store: DbStore, key: IDBValidKey, value: T): Promise<void> {
        const objectStore = await this.getStore(store, 'readwrite');

        return new Promise((resolve, reject) => {
            const request = objectStore.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }

    async delete(store: DbStore, key: IDBValidKey): Promise<void> {
        const objectStore = await this.getStore(store, 'readwrite');

        return new Promise((resolve, reject) => {
            const request = objectStore.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }

    async getAll<T>(store: DbStore): Promise<T[]> {
        const objectStore = await this.getStore(store, 'readonly');

        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = () => resolve(request.result as T[]);
            request.onerror = () => reject(request.error);
        })
    }

    async clear(store: DbStore): Promise<void> {
        const objectStore = await this.getStore(store, 'readwrite');

        return new Promise((resolve, reject) => {
            const request = objectStore.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        })
    }

    private migrateToHistory(
        db: IDBDatabase,
        transaction: IDBTransaction
    ): void {
        const historyStore = transaction.objectStore(DbStore.History);

        // Alarm + Timer history
        if (db.objectStoreNames.contains(DbStore.Alarms)) {
            const alarmsStore = transaction.objectStore(DbStore.Alarms);

            const alarmRequest = alarmsStore.get(StorageKey.AlarmHistory);

            alarmRequest.onsuccess = () => {
                const history = alarmRequest.result;

                if (history !== undefined) {
                    historyStore.put(
                        history,
                        StorageKey.AlarmHistory
                    );
                }
            };

            const timerRequest = alarmsStore.get(StorageKey.TimerHistory);

            timerRequest.onsuccess = () => {
                const history = timerRequest.result;

                if (history !== undefined) {
                    historyStore.put(
                        history,
                        StorageKey.TimerHistory
                    );
                }
            };
        }

        // Stopwatch sessions
        if (db.objectStoreNames.contains(LEGACY_SESSIONS_STORE)) {
            const sessionsStore = transaction.objectStore(LEGACY_SESSIONS_STORE);

            const sessionsRequest = sessionsStore.getAll();

            sessionsRequest.onsuccess = () => {
                historyStore.put(
                    sessionsRequest.result,
                    StorageKey.StopwatchHistory
                );
            };
        }
    }
}