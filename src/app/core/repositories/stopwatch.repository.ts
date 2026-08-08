import { inject, Injectable } from "@angular/core";
import { IndexedDbEngine } from "../storage/indexed-db.engine";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";

export interface LapSession {
    id: string;
    startedAt: number;
    finishedAt: number;
    duration: number;
    laps: Lap[];
    stats: StopwatchSessionStats;
}

export interface Lap {
    id: string;
    index: number;
    lapTime: number;
    totalTime: number;
    createdAt: number;
}

export interface StopwatchSessionStats {
    fastestLap: number;
    slowestLap: number;
    averageLap: number;
    consistency: number;
    consistencyLabel: ConsistencyLabel;
}

export type ConsistencyLabel = 'excellent' | 'good' | 'average' | 'needs-work';

export const EMPTY_STOPWATCH_STATS: StopwatchSessionStats = {
    fastestLap: 0,
    slowestLap: 0,
    averageLap: 0,
    consistency: 100,
    consistencyLabel: 'excellent'
};

@Injectable({
    providedIn: 'root'
})
export class StopwatchRepository {
    private readonly storage = inject(IndexedDbEngine);

    async load(): Promise<LapSession[]> {
        return (
            await this.storage.get<LapSession[]>(
                DbStore.History,
                StorageKey.StopwatchHistory
            )
        ) ?? [];
    }

    async save(history: LapSession[]): Promise<void> {
        await this.storage.set(
            DbStore.History,
            StorageKey.StopwatchHistory,
            history
        );
    }

    async clear(): Promise<void> {
        await this.storage.delete(
            DbStore.History,
            StorageKey.StopwatchHistory
        );
    }

    async restore(history: LapSession[]): Promise<void> {
        await this.save(history);
    }
}