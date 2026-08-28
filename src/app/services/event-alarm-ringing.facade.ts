import { computed, inject, Injectable, signal } from "@angular/core";
import { SoundSvc } from "./sound-svc";
import { NotificationSvc } from "./notification-svc";
import { WakeLockSvc } from "./wake-lock-svc";
import { SettingsSvc } from "./settings-svc";
import { EventAlarm } from "../models/alarm.interface";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmRingingFacade {
    private readonly sound = inject(SoundSvc);
    private readonly notification = inject(NotificationSvc);
    private readonly wakelock = inject(WakeLockSvc);
    private readonly settings = inject(SettingsSvc);

    readonly ringingEvent = signal<EventAlarm | null>(null);

    private activeNotification: Notification | null = null;

    readonly ringing = computed(() => this.ringingEvent() !== null);

    async ring(event: EventAlarm) {
        if (this.ringingEvent()) return;

        await this.wakelock.acquire();

        this.ringingEvent.set(event);

        const canNotify = this.notification.canNotify(this.settings.notificationsEnabled());
        if (canNotify) {
            this.activeNotification = this.notification.show({
                title: event.title,
                body: event.description || event.time,
                tag: `event-alarm-${event.id}`,
                requireInteraction: true
            })
        }

        this.sound.play(event.sound);
    }

    async stop() {
        const event = this.ringingEvent();
        if (!event) return;

        this.sound.stop();
        this.notification.close(this.activeNotification);
        this.activeNotification = null;
        await this.wakelock.release();
        this.ringingEvent.set(null);
    }
}