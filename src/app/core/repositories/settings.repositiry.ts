import { inject, Injectable } from "@angular/core";
import { StorageEngine } from "../storage/storage-engine";
import { AppSettings } from "../../models/settings.model";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";

export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'light',
    historyRetentionDays: 30,
    keepScreenAwake: true,
    alarmSortMode: 'manual',
    alarmAutoStopMinutes: 2,
    firstRunCompleted: false,
    notificationsEnabled: true,
    notificationPromptShown: false,
}

@Injectable({
    providedIn: 'root'
})
export class SettingsRepository {
    private readonly storage = inject(StorageEngine);

    async load(): Promise<AppSettings> {
        const stored = await this.storage.get<Partial<AppSettings>>(
            DbStore.Settings,
            StorageKey.Settings
        )

        const settings: AppSettings = {
            ...DEFAULT_SETTINGS,
            ...stored
        }

        await this.save(settings);
        return settings;
    }

    async save(settings: AppSettings) {
        await this.storage.set(
            DbStore.Settings,
            StorageKey.Settings,
            settings
        )
    }
}