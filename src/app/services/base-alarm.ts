import { computed, Injectable, signal } from "@angular/core";
import { Alarm } from "../models/alarm.interface";

@Injectable({
    providedIn: 'root'
})
export abstract class BaseAlarm {
    readonly activeAlarm = signal<Alarm | null>(null);

    readonly title = computed(() => this.activeAlarm()?.title ?? '');
    readonly hour = computed(() => this.activeAlarm()?.hour ?? 0);
    readonly minute = computed(() => this.activeAlarm()?.minute ?? 0);
    readonly sound = computed(() => this.activeAlarm()?.sound ?? 'none');
    readonly vibration = computed(() => this.activeAlarm()?.vibration ?? 'short');
    readonly repeat = computed(() => this.activeAlarm()?.repeat ?? []);
    readonly groupId = computed(() => this.activeAlarm()?.groupId ?? null);
    readonly enabled = computed(() => this.activeAlarm()?.enabled ?? true);
}