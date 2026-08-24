import { computed, inject, Injectable } from "@angular/core";
import { EventAlarmDraftSvc } from "./event-alarm-draft";
import { EventAlarmsFacade } from "./event-alarms.facade";
import { EventAlarm, EventAlarmRepeat } from "../models/event-alarm.model";
import { TimerSound } from "./sound-svc";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmEditorFacade {
    private readonly draft = inject(EventAlarmDraftSvc);
    private readonly alarms = inject(EventAlarmsFacade);

    readonly title = this.draft.title;
    readonly description = this.draft.description;
    readonly date = this.draft.date;
    readonly time = this.draft.time;
    readonly repeat = this.draft.repeat;
    readonly sound = this.draft.sound;
    readonly editing = this.draft.editing;

    readonly dailyRepeat = computed(() => {
        const repeat = this.repeat();
        return repeat.type === 'daily' ? repeat : null;
    });

    readonly weeklyRepeat = computed(() => {
        const repeat = this.repeat();
        return repeat.type === 'weekly' ? repeat : null;
    });

    readonly monthlyRepeat = computed(() => {
        const repeat = this.repeat();
        return repeat.type === 'monthly' ? repeat : null;
    });

    readonly yearlyRepeat = computed(() => {
        const repeat = this.repeat();
        return repeat.type === 'yearly' ? repeat : null;
    });

    setTitle(value: string) {
        this.draft.patch({ title: value });
    }

    setDescription(value: string) {
        this.draft.patch({ description: value });
    }

    setDate(value: string) {
        this.draft.patch({ date: value });
    }

    setTime(value: string) {
        this.draft.patch({ time: value });
    }

    setRepeat(value: EventAlarmRepeat) {
        this.draft.patch({ repeat: value });
    }

    setSound(value: TimerSound) {
        this.draft.patch({ sound: value });
    }

    async save() {
        const draft = this.draft.snapshot();

        if (!draft.title.trim()) return;
        if (!draft.date || !draft.time) return;
        if (!this.isValidRepeat(draft.repeat)) return;

        if (this.draft.editingId()) {
            const current = this.alarms.events().find(
                x => x.id === this.draft.editingId()
            )

            if (!current) return;

            await this.alarms.update({
                ...current,
                title: draft.title.trim(),
                description: draft.description.trim(),
                date: draft.date,
                time: draft.time,
                repeat: draft.repeat,
                sound: draft.sound
            })
        } else {
            const event: EventAlarm = {
                id: crypto.randomUUID(),
                title: draft.title.trim(),
                description: draft.description.trim(),
                date: draft.date,
                time: draft.time,
                repeat: draft.repeat,
                sound: draft.sound,
                enabled: true,
                createdAt: Date.now(),
                lastFiredAt: null
            }
            await this.alarms.add(event);
        }
        this.alarms.closeEditor();
    }

    cancel() {
        this.alarms.closeEditor();
    }

    private isValidRepeat(repeat: EventAlarmRepeat): boolean {
        return repeat.type !== 'weekly' || repeat.days.length > 0;
    }
}