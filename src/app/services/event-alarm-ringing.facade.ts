import { computed, inject, Injectable, signal } from "@angular/core";
import { SoundSvc } from "./sound-svc";
import { NotificationSvc } from "./notification-svc";
import { WakeLockSvc } from "./wake-lock-svc";
import { SettingsSvc } from "./settings-svc";
import { EventAlarm } from "../models/event-alarm.model";

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
        console.log('[Ringing] ring()', event.title, event.sound);
        if (this.ringingEvent()) return;

        await this.wakelock.acquire();
        console.log('[Ringing] wakelock acquired');

        this.ringingEvent.set(event);

        const canNotify = this.notification.canNotify(this.settings.notificationsEnabled());
        console.log('[Ringing] canNotify:', canNotify);
        if (canNotify) {
            console.log('[Ringing] notification.show');
            this.activeNotification = this.notification.show({
                title: event.title,
                body: event.description || event.time,
                tag: `event-alarm-${event.id}`,
                requireInteraction: true
            })
        }

        console.log('[Ringing] sound.play', event.sound);
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