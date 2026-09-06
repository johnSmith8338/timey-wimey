import { inject, Injectable } from "@angular/core";
import { IndexedDbEngine } from "../storage/indexed-db.engine";
import { DbStore } from "../storage/database";
import { StorageKey } from "../storage/storage-keys";
import { TimerColor } from "../../constants/colors";
import { TimerIcon } from "../../constants/icons";
import { TimerSound } from "../../services/sound-svc";
import { VibrationSetting } from "../../models/settings.model";

export interface TimerAppSettings {
    hours: number;
    minutes: number;
    seconds: number;
    color: TimerColor;
    icon: TimerIcon;
    sound: TimerSound;
    vibration: VibrationSetting;
}

@Injectable({
    providedIn: 'root'
})
export class TimersRepository {
    private readonly storage = inject(IndexedDbEngine);

    async loadSettings() {
        const settings = await this.storage.get<TimerAppSettings>(
            DbStore.Settings,
            StorageKey.TimerAppSettings
        )

        if (!settings) return undefined;

        return {
            ...settings,
            vibration: settings.vibration ?? 'short'
        }
    }

    saveSettings(settings: TimerAppSettings) {
        return this.storage.set(
            DbStore.Settings,
            StorageKey.TimerAppSettings,
            settings
        )
    }
}