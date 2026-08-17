import { DestroyRef, inject, signal } from "@angular/core";
import { TimerEngine } from "./timer-engine";
import { TimerSound } from "./sound-svc";
import { BaseTimer } from "./base-timer";
import { TimerHistorySvc } from "./timer-history-svc";
import { NotificationSvc } from "./notification-svc";
import { SettingsSvc } from "./settings-svc";

export class TimerInstance extends BaseTimer<TimerEngine> {
    private readonly destroyRef = inject(DestroyRef);
    private readonly history = inject(TimerHistorySvc);
    private readonly notification = inject(NotificationSvc);
    private readonly settings = inject(SettingsSvc);

    readonly id = crypto.randomUUID();
    readonly startedAt = signal(0);
    override readonly engine = new TimerEngine();
    readonly finished = signal(false);

    private historySaved = false;

    constructor() {
        super();

        this.engine.onFinished = async () => {
            this.finished.set(true);
            if (!this.historySaved) {
                this.historySaved = true;
                await this.history.add(this, 'finished');
            }
            this.notifyFinished();
        }

        this.destroyRef.onDestroy(() => {
            this.engine.stop();
        })
    }

    override start() {
        this.historySaved = false;
        this.startedAt.set(Date.now());
        super.start();
    }

    async cancel() {
        if (this.historySaved) return;
        this.historySaved = true;
        await this.history.add(this, 'cancelled');
        this.engine.stop();
    }

    sound(): TimerSound {
        return this.activePreset()?.sound ?? 'none';
    }

    private notifyFinished() {
        if (!this.notification.canNotify(this.settings.notificationsEnabled())) {
            return;
        }

        const preset = this.activePreset();
        this.notification.show({
            title: preset?.title || 'timer',
            body: 'timer finished'
        })
    }
}