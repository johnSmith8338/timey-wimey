import { inject, Injectable } from "@angular/core";
import { Alarm, AlarmGroup, EventAlarm } from "../../models/alarm.interface";
import { StorageEngine } from "../storage/storage-engine";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";

interface AlarmStorage {
    groups: AlarmGroup[];
    alarms: Alarm[];
    events: EventAlarm[]
}

@Injectable({
    providedIn: 'root'
})
export class AlarmRepository {
    private readonly storage = inject(StorageEngine);

    async load(): Promise<AlarmStorage> {
        const data = await this.storage.get<AlarmStorage>(
            DbStore.Alarms,
            StorageKey.Alarms
        )

        return {
            groups: data?.groups ?? [],
            alarms: data?.alarms ?? [],
            events: data?.events ?? []
        }
    }

    async save(data: AlarmStorage): Promise<void> {
        await this.storage.set(
            DbStore.Alarms,
            StorageKey.Alarms,
            data
        )
    }

    async clear() {
        await this.storage.delete(
            DbStore.Alarms,
            StorageKey.Alarms
        )
    }
}