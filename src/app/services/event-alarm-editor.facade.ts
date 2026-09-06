import { computed, inject, Injectable } from "@angular/core";
import { EventAlarmDraftSvc } from "./event-alarm-draft";
import { TimerSound } from "./sound-svc";
import { EventAlarm, EventAlarmRepeat } from "../models/alarm.interface";
import { AlarmSvc } from "./alarm-svc";
import { describeEventRepeat } from "../utils/event-alarm.utils";
import { VibrationSetting } from "../models/settings.model";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmEditorFacade {
    private readonly draft = inject(EventAlarmDraftSvc);
    private readonly alarms = inject(AlarmSvc);

    readonly timeEngine = this.draft;

    readonly title = this.draft.title;
    readonly description = this.draft.description;
    readonly date = this.draft.date;
    readonly time = this.draft.time;
    readonly repeat = this.draft.repeat;
    readonly sound = this.draft.sound;
    readonly vibration = this.draft.vibration;
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

    readonly repeatDescription = computed(() => {
        return describeEventRepeat(this.repeat());
    })

    setTitle(value: string) {
        this.draft.patch({ title: value });
    }

    setDescription(value: string) {
        this.draft.patch({ description: value });
    }

    setDate(value: string) {
        this.draft.patch({ date: value });
    }

    setRepeat(value: EventAlarmRepeat) {
        this.draft.patch({ repeat: value });
    }

    setSound(value: TimerSound) {
        this.draft.patch({ sound: value });
    }

    setVibration(settings: VibrationSetting) {
        this.draft.patch({ vibration: settings });
    }

    async save() {
        const draft = this.draft.snapshot();

        if (!draft.title.trim()) return;
        if (!draft.date || !draft.time) return;
        if (!this.isValidRepeat(draft.repeat)) return;

        const editingId = this.draft.editingId();

        if (editingId) {
            const current = this.alarms.getEvent(editingId);
            if (!current) return;

            await this.alarms.saveEvent({
                ...current,
                title: draft.title.trim(),
                description: draft.description.trim(),
                date: draft.date,
                time: draft.time,
                repeat: structuredClone(draft.repeat),
                sound: draft.sound,
                vibration: draft.vibration
            })
        } else {
            const now = Date.now();

            const event: EventAlarm = {
                type: 'event',
                id: crypto.randomUUID(),
                groupId: null,
                title: draft.title.trim(),
                description: draft.description.trim(),
                date: draft.date,
                time: draft.time,
                repeat: structuredClone(draft.repeat),
                sound: draft.sound,
                vibration: draft.vibration,
                enabled: true,
                createdAt: now,
                updatedAt: now,
                order: 0,
                lastFiredAt: null
            }
            await this.alarms.saveEvent(event);
        }
        this.draft.closeEditor();
    }

    cancel() {
        this.draft.closeEditor();
    }

    private isValidRepeat(repeat: EventAlarmRepeat): boolean {
        return repeat.type !== 'weekly' || repeat.days.length > 0;
    }
}