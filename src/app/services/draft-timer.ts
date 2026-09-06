import { computed, inject, Injectable } from "@angular/core";
import { PreviewTimerEngine } from "./timer-preview.engine";
import { TimerPreset } from "../core/repositories/timer.repository";
import { TimerSettingsSvc } from "./timer-settings-svc";
import { TimerAppSettings } from "../core/repositories/timers.repository";
import { TimerColor } from "../constants/colors";
import { TimerIcon } from "../constants/icons";
import { TimerSound } from "./sound-svc";
import { BaseTimer } from "./base-timer";
import { VibrationSetting } from "../models/settings.model";

@Injectable({
    providedIn: 'root'
})
export class DraftTimer extends BaseTimer<PreviewTimerEngine> {
    override readonly engine = inject(PreviewTimerEngine);
    private readonly settingsSvc = inject(TimerSettingsSvc);

    readonly settings = computed(() => this.settingsSvc.settings());

    requireSettings(): TimerAppSettings {
        const settings = this.settings();
        if (!settings) throw new Error('Timer settings are not loaded');
        return settings;
    }

    readonly manualPreset = computed<TimerPreset>(() => {
        const s = this.requireSettings();
        return {
            id: 'manual',
            title: 'manual timer',
            hours: s.hours,
            minutes: s.minutes,
            seconds: s.seconds,
            color: s.color,
            icon: s.icon,
            sound: s.sound,
            vibration: s.vibration,
            favorite: false,
            order: 0,
            createdAt: 0,
            updatedAt: 0
        }
    })

    private applySettings() {
        const s = this.manualPreset();
        this.engine.setDuration(
            s.hours,
            s.minutes,
            s.seconds
        )
    }

    loadManual() {
        this.loadPreset(this.manualPreset());
    }

    resetToDefault() {
        const defaults = this.engine.getDefaults();

        void this.settingsSvc.patch({
            hours: defaults.hours,
            minutes: defaults.minutes,
            seconds: defaults.seconds
        })

        this.preset.set(null);
    }

    restore() {
        this.reset();
        this.applySettings();
    }

    clear() {
        this.reset();
        this.preset.set(null);
    }

    restart() {
        this.reset();
        this.start();
    }

    updateHours(hours: number) {
        this.preset.update(p => p ? { ...p, hours } : null);
        void this.settingsSvc.patch({ hours });
    }

    updateMinutes(minutes: number) {
        this.preset.update(p => p ? { ...p, minutes } : null);
        void this.settingsSvc.patch({ minutes });
    }

    updateSeconds(seconds: number) {
        this.preset.update(p => p ? { ...p, seconds } : null);
        void this.settingsSvc.patch({ seconds });
    }

    updateColor(color: TimerColor) {
        this.preset.update(p => p ? { ...p, color } : p);
        void this.settingsSvc.patch({ color });
    }

    updateIcon(icon: TimerIcon) {
        this.preset.update(p => p ? { ...p, icon } : null);
        void this.settingsSvc.patch({ icon });
    }

    updateSound(sound: TimerSound) {
        this.preset.update(p => p ? { ...p, sound } : null);
        void this.settingsSvc.patch({ sound });
    }

    updateVibration(vibration: VibrationSetting) {
        this.preset.update(p => p ? { ...p, vibration } : p);
        void this.settingsSvc.patch({ vibration });
    }

    updateTitle(title: string) {
        this.preset.update(p => p ? { ...p, title } : null);
    }

    setHours(value: number) {
        this.updateHours(Math.max(0, value));
    }

    setMinutes(value: number) {
        this.updateMinutes(Math.min(59, Math.max(0, value)));
    }

    setSeconds(value: number) {
        this.updateSeconds(Math.min(59, Math.max(0, value)));
    }
}