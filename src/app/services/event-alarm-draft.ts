import { computed, Injectable, signal } from "@angular/core";
import { TimerSound } from "./sound-svc";
import { EventAlarm, EventAlarmDraft, EventAlarmRepeat } from "../models/alarm.interface";
import { formatCalendarDate, todayCalendarDate } from "../utils/date-helper";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmDraftSvc {
    readonly title = signal('');
    readonly description = signal('');
    readonly date = signal(formatCalendarDate(todayCalendarDate()));
    readonly hour = signal(9);
    readonly minute = signal(0);

    readonly time = computed(() =>
        `${this.hour().toString().padStart(2, '0')}:
        ${this.minute().toString().padStart(2, '0')}`
    );
    readonly repeat = signal<EventAlarmRepeat>({ type: 'once' });
    readonly sound = signal<TimerSound>('none');
    readonly editingId = signal<string | null>(null);

    readonly editorOpened = signal(false);

    readonly editing = computed(() => this.editingId() !== null);

    reset() {
        const now = new Date();

        this.title.set('');
        this.description.set('');
        this.date.set(formatCalendarDate(todayCalendarDate()));
        this.hour.set(9);
        this.minute.set(0);
        this.repeat.set({ type: 'once' });
        this.sound.set('none');
        this.editingId.set(null);
        this.editorOpened.set(false);
    }

    load(event: EventAlarm) {
        this.title.set(event.title);
        this.description.set(event.description);
        this.date.set(event.date);

        const [hour, minute] = event.time.split(':').map(Number);

        this.hour.set(Number.isFinite(hour) ? hour : 9);
        this.minute.set(Number.isFinite(minute) ? minute : 0);
        this.repeat.set(structuredClone(event.repeat));
        this.sound.set(event.sound);
        this.editingId.set(event.id);
        this.editorOpened.set(true);
    }

    updateHour(hour: number) {
        this.hour.set(Math.min(23, Math.max(0, hour)));
    }

    updateMinute(minute: number) {
        this.minute.set(Math.min(59, Math.max(0, minute)));
    }

    setDate(value: string) {
        this.date.set(value);
    }

    openCreate() {
        this.reset();
        this.editorOpened.set(true);
    }

    openEdit(event: EventAlarm) {
        this.load(event);
    }

    closeEditor() {
        this.editorOpened.set(false);
        this.reset();
    }

    patch(patch: Partial<{
        title: string;
        description: string;
        date: string;
        repeat: EventAlarmRepeat;
        sound: TimerSound;
    }>) {
        if (patch.title !== undefined) this.title.set(patch.title);
        if (patch.description !== undefined) this.description.set(patch.description);
        if (patch.date !== undefined) this.date.set(patch.date);
        if (patch.repeat !== undefined) this.repeat.set(patch.repeat);
        if (patch.sound !== undefined) this.sound.set(patch.sound);
    }

    snapshot(): EventAlarmDraft {
        return {
            title: this.title(),
            description: this.description(),
            date: this.date(),
            time: this.time(),
            repeat: structuredClone(this.repeat()),
            sound: this.sound()
        }
    }

    private toDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
}