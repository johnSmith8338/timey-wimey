import { computed, inject, Injectable, signal } from "@angular/core";
import { TimerPreset } from "../core/repositories/timer.repository";
import { TimerInstanceFactory } from "./timer-instance.factory";
import { TimerInstance } from "./timer-instance";
import { DEFAULT_TIMER_SOUND, SoundSvc } from "./sound-svc";
import { TimerHistoryItem } from "../models/timer-history.model";

@Injectable({
    providedIn: 'root'
})
export class TimerInstanceStore {
    private readonly factory = inject(TimerInstanceFactory);
    private readonly soundSvc = inject(SoundSvc);

    readonly timers = signal<TimerInstance[]>([]);
    readonly active = signal<TimerInstance | null>(null);
    readonly finishedQueue = signal<TimerInstance[]>([]);

    readonly finished = computed(() => this.finishedQueue()[0] ?? null);

    add(preset: TimerPreset) {
        const timer = this.factory.create();

        timer.loadPreset(preset);
        this.attachCompletionHandler(timer);
        timer.start();
        this.timers.update(list => [...list, timer]);
        this.active.set(timer);

        return timer;
    }

    runFromHistory(item: TimerHistoryItem) {
        const timer = this.factory.create();

        timer.historySnapshot.set(structuredClone(item.snapshot));

        timer.engine.setDuration(
            item.snapshot.hours,
            item.snapshot.minutes,
            item.snapshot.seconds,
        )

        if (item.elapsedMs < item.durationMs) {
            timer.engine.remainingMs.set(item.durationMs - item.elapsedMs);
        }

        this.attachCompletionHandler(timer);
        timer.start();
        this.timers.update(list => [...list, timer]);
        this.active.set(timer);

        return timer;
    }

    private attachCompletionHandler(timer: TimerInstance) {
        const previousFinished = timer.engine.onFinished;

        timer.engine.onFinished = async () => {
            await previousFinished?.();
            this.finishedQueue.update(list => [
                ...list,
                timer
            ])
            this.soundSvc.play(timer.sound());
        }
    }

    remove(timer: TimerInstance) {
        timer.stop();
        this.timers.update(list => list.filter(x => x !== timer));
        if (this.active() === timer) this.active.set(null);
        this.finishedQueue.update(list => list.filter(t => t !== timer));
    }

    select(timer: TimerInstance) {
        this.active.set(timer);
    }

    clearFinished() {
        this.finishedQueue.update(list => list.slice(1));
    }

    repeat(timer: TimerInstance) {
        timer.reset();
        timer.start();
        this.finishedQueue.update(list => list.filter(t => t !== timer));
    }

    stop(timer: TimerInstance) {
        timer.engine.stop();
        this.remove(timer);
        this.soundSvc.stop();
    }
}