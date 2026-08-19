import { computed, DestroyRef, inject, signal } from "@angular/core";
import { TimerEngine } from "./timer-engine";
import { TimerSound } from "./sound-svc";
import { BaseTimer } from "./base-timer";
import { TimerHistorySvc } from "./timer-history-svc";
import { NotificationSvc } from "./notification-svc";
import { SettingsSvc } from "./settings-svc";
import { TimerHistorySnapshot } from "../models/timer-history.model";
import { DEFAULT_TIMER_ICON, TimerIcon } from "../constants/icons";

export class TimerInstance extends BaseTimer<TimerEngine> {
    private readonly destroyRef = inject(DestroyRef);
    private readonly history = inject(TimerHistorySvc);
    private readonly notification = inject(NotificationSvc);
    private readonly settings = inject(SettingsSvc);

    readonly id = crypto.randomUUID();
    readonly startedAt = signal(0);
    override readonly engine = new TimerEngine();
    readonly finished = signal(false);
    readonly historySnapshot = signal<TimerHistorySnapshot | null>(null);

    private historySaved = false;

    override readonly title = computed(() =>
        this.preset()?.title ?? this.historySnapshot()?.title ?? 'timer'
    )

    override readonly icon = computed<TimerIcon>(() =>
        this.preset()?.icon ?? this.historySnapshot()?.icon ?? DEFAULT_TIMER_ICON
    );

    sound(): TimerSound {
        return this.preset()?.sound ?? this.historySnapshot()?.sound ?? 'none';
    }

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

    private notifyFinished() {
        if (!this.notification.canNotify(this.settings.notificationsEnabled())) {
            return;
        }

        this.notification.show({
            title: this.title(),
            body: 'timer finished'
        })
    }
}