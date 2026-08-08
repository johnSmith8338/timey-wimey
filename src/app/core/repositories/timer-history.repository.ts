import { inject, Injectable } from "@angular/core";
import { StorageEngine } from "../storage/storage-engine";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";
import { TimerHistoryItem } from "../../models/timer-history.model";

@Injectable({
    providedIn: 'root'
})
export class TimerHistoryRepository {
    private readonly storage = inject(StorageEngine);

    async load(): Promise<TimerHistoryItem[]> {
        return (
            await this.storage.get<TimerHistoryItem[]>(
                DbStore.History,
                StorageKey.TimerHistory
            )
        ) ?? [];
    }

    async save(history: TimerHistoryItem[]) {
        await this.storage.set(
            DbStore.History,
            StorageKey.TimerHistory,
            history
        )
    }

    async clear() {
        await this.storage.delete(
            DbStore.History,
            StorageKey.TimerHistory
        )
    }
}