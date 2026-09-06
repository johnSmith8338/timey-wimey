import { computed, Injectable } from "@angular/core";
import { BaseAlarm } from "./base-alarm";
import { Alarm, AlarmRepeat } from "../models/alarm.interface";
import { TimerSound } from "./sound-svc";
import { AlarmFaceEngine } from "../models/alarm-face-engine.interface";
import { VibrationSetting } from "../models/settings.model";

@Injectable({
    providedIn: 'root'
})
export class DraftAlarm extends BaseAlarm {
    readonly alarm = computed(() => this.activeAlarm());

    readonly hourAngle = computed(() => this.hour() * 30 + this.minute() * 0.5);
    readonly minuteAngle = computed(() => this.minute() * 6);

    readonly faceEngine: AlarmFaceEngine = {
        hour: this.hour,
        minute: this.minute
    }

    loadAlarm(alarm: Alarm) {
        this.activeAlarm.set(structuredClone(alarm));
    }

    clear() {
        this.activeAlarm.set(null);
    }

    updateTitle(title: string) {
        this.activeAlarm.update(a => a ? { ...a, title } : null);
    }

    updateHour(hour: number) {
        this.activeAlarm.update(a => a ? { ...a, hour: Math.min(23, Math.max(0, hour)) } : null);
    }

    updateMinute(minute: number) {
        this.activeAlarm.update(a => a ? { ...a, minute: Math.min(59, Math.max(0, minute)) } : null);
    }

    updateRepeat(repeat: AlarmRepeat[]) {
        this.activeAlarm.update(a => a ? { ...a, repeat } : null);
    }

    updateSound(sound: TimerSound) {
        this.activeAlarm.update(a => a ? { ...a, sound } : null);
    }

    updateVibration(vibration: VibrationSetting) {
        this.activeAlarm.update(a => a ? { ...a, vibration } : null);
    }

    updateGroup(groupId: string | null) {
        this.activeAlarm.update(a => a ? { ...a, groupId } : null);
    }

    toggleEnabled() {
        this.activeAlarm.update(a => a ? { ...a, enabled: !a.enabled } : null);
    }
}