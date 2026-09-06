import { inject, Injectable } from "@angular/core";
import { Alarm, AlarmGroup, EventAlarm } from "../../models/alarm.interface";
import { StorageEngine } from "../storage/storage-engine";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";
import { VibrationSetting } from "../../models/settings.model";

interface AlarmStorage {
    groups: AlarmGroup[];
    alarms: Alarm[];
    events: EventAlarm[]
}

const normalizeVibration = (value: unknown): VibrationSetting => {
    switch (value) {
        case 'short':
        case 'double':
        case 'long':
        case 'alarm':
        case 'off':
            return value;
        default:
            return 'short';
    }
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
            alarms: (data?.alarms ?? []).map(alarm => ({
                ...alarm,
                vibration: normalizeVibration(alarm.vibration)
            })),
            events: (data?.events ?? []).map(event => ({
                ...event,
                vibration: normalizeVibration(event.vibration)
            }))
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