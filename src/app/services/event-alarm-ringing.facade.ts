import { computed, inject, Injectable, signal } from "@angular/core";
import { SoundSvc } from "./sound-svc";
import { NotificationSvc } from "./notification-svc";
import { WakeLockSvc } from "./wake-lock-svc";
import { SettingsSvc } from "./settings-svc";
import { EventAlarm } from "../models/alarm.interface";
import { VibrationSvc } from "./vibration-svc";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmRingingFacade {
    private readonly sound = inject(SoundSvc);
    private readonly notification = inject(NotificationSvc);
    private readonly wakelock = inject(WakeLockSvc);
    private readonly settings = inject(SettingsSvc);
    private readonly vibration = inject(VibrationSvc);

    readonly ringingEvent = signal<EventAlarm | null>(null);
    readonly queue = signal<EventAlarm[]>([]);

    private activeNotification: Notification | null = null;
    private starting = false;
    private wakelockActive = false;

    readonly ringing = computed(() => this.ringingEvent() !== null);
    readonly queueCount = computed(() => this.queue().length);

    async ring(event: EventAlarm) {
        if (this.isActiveOrQueued(event.id)) return;
        this.queue.update(queue => [...queue, event]);
        if (!this.ringingEvent()) await this.startNext();
    }

    async stop() {
        const event = this.ringingEvent();
        if (!event) return;

        this.sound.stop();
        this.vibration.stop();

        this.notification.close(this.activeNotification);
        this.activeNotification = null;

        this.ringingEvent.set(null);

        if (this.queue().length) {
            await this.startNext();
            return;
        }

        if (this.wakelockActive) {
            await this.wakelock.release();
            this.wakelockActive = false;
        }
    }

    private isActiveOrQueued(id: string): boolean {
        return (
            this.ringingEvent()?.id === id || this.queue().some(event => event.id === id)
        )
    }

    private async startNext() {
        if (this.starting || this.ringingEvent()) return;

        const queue = this.queue();
        const next = queue[0];

        if (!next) return;

        this.starting = true;

        try {
            this.queue.update(queue => queue.slice(1));

            if (!this.wakelockActive) {
                await this.wakelock.acquire();
                this.wakelockActive = true;
            }

            this.ringingEvent.set(next);

            const canNotify = this.notification.canNotify(this.settings.notificationsEnabled());
            if (canNotify) {
                this.activeNotification = this.notification.show({
                    title: next.title,
                    body: next.description || next.time,
                    tag: `event-alarm-${next.id}`,
                    requireInteraction: true
                })
            }
            this.sound.play(next.sound);
            this.vibration.vibrate(next.vibration);
        } finally {
            this.starting = false;
        }
    }
}