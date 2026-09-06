import { inject, Injectable } from "@angular/core";
import { IndexedDbEngine } from "../storage/indexed-db.engine";
import { DbStore } from "../storage/database";
import { TimerSound } from "../../services/sound-svc";
import { TimerIcon } from "../../constants/icons";
import { TimerColor } from "../../constants/colors";
import { VibrationSetting } from "../../models/settings.model";

export interface TimerPreset {
    id: string;
    title: string;
    hours: number;
    minutes: number;
    seconds: number;
    color: TimerColor;
    icon: TimerIcon;
    sound: TimerSound;
    vibration: VibrationSetting;
    favorite: boolean;
    order: number;
    createdAt: number;
    updatedAt: number;
}

@Injectable({
    providedIn: 'root'
})
export class TimerRepository {
    private readonly storage = inject(IndexedDbEngine);

    async getAll() {
        const timers = await this.storage.getAll<TimerPreset>(
            DbStore.Timers
        )
        return timers.map(timer => ({
            ...timer,
            vibration: timer.vibration ?? 'short'
        }))
    }

    save(timer: TimerPreset) {
        return this.storage.set(
            DbStore.Timers,
            timer.id,
            timer
        )
    }

    delete(id: string) {
        return this.storage.delete(
            DbStore.Timers,
            id
        )
    }

    clear() {
        return this.storage.clear(
            DbStore.Timers
        )
    }
}