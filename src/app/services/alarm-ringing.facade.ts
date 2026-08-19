import { computed, inject, Injectable, signal } from "@angular/core";
import { SoundSvc } from "./sound-svc";
import { Alarm } from "../models/alarm.interface";
import { WakeLockSvc } from "./wake-lock-svc";
import { NotificationSvc } from "./notification-svc";
import { Subject } from "rxjs";
import { SettingsSvc } from "./settings-svc";

@Injectable({
    providedIn: 'root'
})
export class AlarmRingingFacade {
    private readonly soundSvc = inject(SoundSvc);
    private readonly wakelock = inject(WakeLockSvc);
    private readonly notification = inject(NotificationSvc);
    private readonly settings = inject(SettingsSvc);

    readonly stopped$ = new Subject<{
        alarm: Alarm;
        sessionId: string;
    }>();
    readonly snoozed$ = new Subject<{
        alarm: Alarm;
        sessionId: string;
        minutes: number;
    }>();
    readonly missed$ = new Subject<{
        alarm: Alarm;
        sessionId: string;
    }>();

    private missedTimer: number | null = null;

    readonly ringingAlarm = signal<Alarm | null>(null);
    readonly currentSessionId = signal<string | null>(null);

    readonly ringing = computed(() => this.ringingAlarm() !== null);

    async ring(alarm: Alarm, resumed = false) {
        if (!resumed) this.currentSessionId.set(crypto.randomUUID());

        const sessionId = this.currentSessionId()!;

        this.ringingAlarm.set(alarm);

        await this.wakelock.acquire();

        if (this.notification.canNotify(this.settings.notificationsEnabled())) {
            this.notification.show({
                title: alarm.title,
                body: this.formatAlarmTime(alarm)
            })
        }

        this.soundSvc.play(alarm.sound);

        const autoStopMinutes = this.settings.alarmAutoStopMinutes();
        const autoStopMs = autoStopMinutes * 60_000;

        this.missedTimer = window.setTimeout(() => {
            const current = this.ringingAlarm();
            if (!current) return;

            this.soundSvc.stop();
            void this.wakelock.release();
            this.ringingAlarm.set(null);

            const sessionId = this.currentSessionId()!;

            this.missed$.next({
                alarm: current,
                sessionId
            });

            this.currentSessionId.set(null);
        }, autoStopMs);
    }

    async stop() {
        const alarm = this.ringingAlarm();
        if (!alarm) return;

        if (this.missedTimer !== null) {
            clearTimeout(this.missedTimer);
            this.missedTimer = null;
        }

        this.soundSvc.stop();
        await this.wakelock.release();
        this.ringingAlarm.set(null);

        const sessionId = this.currentSessionId()!;

        this.stopped$.next({
            alarm,
            sessionId
        })
        this.currentSessionId.set(null);
    }

    async snooze(minutes: number) {
        const alarm = this.ringingAlarm();
        if (!alarm) return;

        if (this.missedTimer !== null) {
            clearTimeout(this.missedTimer);
            this.missedTimer = null;
        }

        this.soundSvc.stop();
        await this.wakelock.release();

        this.ringingAlarm.set(null);

        const sessionId = this.currentSessionId()!;

        this.snoozed$.next({
            alarm,
            sessionId,
            minutes
        })
    }

    notifyMissedAlarm(alarm: Alarm) {
        if (!this.notification.canNotify(this.settings.notificationsEnabled())) return;

        this.notification.show({
            title: 'missed alarm',
            body: `${alarm.title}\n${this.formatAlarmTime(alarm)}`,
            requireInteraction: false
        })
    }

    private formatAlarmTime(alarm: Alarm): string {
        const hours = alarm.hour.toString().padStart(2, '0');
        const minutes = alarm.minute.toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}