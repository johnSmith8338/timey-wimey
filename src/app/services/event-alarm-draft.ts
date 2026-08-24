import { computed, Injectable, signal } from "@angular/core";
import { EventAlarm, EventAlarmDraft, EventAlarmRepeat } from "../models/event-alarm.model";
import { TimerSound } from "./sound-svc";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmDraftSvc {
    readonly title = signal('');
    readonly description = signal('');
    readonly date = signal('');
    readonly time = signal('09:00');
    readonly repeat = signal<EventAlarmRepeat>({ type: 'once' });
    readonly sound = signal<TimerSound>('none');
    readonly editingId = signal<string | null>(null);

    readonly editing = computed(() => this.editingId() !== null);

    reset() {
        this.title.set('');
        this.description.set('');
        this.date.set('');
        this.time.set('09:00');
        this.repeat.set({ type: 'once' });
        this.sound.set('none');
        this.editingId.set(null);
    }

    load(event: EventAlarm) {
        this.title.set(event.title);
        this.description.set(event.description);
        this.date.set(event.date);
        this.time.set(event.time);
        this.repeat.set(structuredClone(event.repeat));
        this.sound.set(event.sound);
        this.editingId.set(event.id);
    }

    patch(patch: Partial<{
        title: string;
        description: string;
        date: string;
        time: string;
        repeat: EventAlarmRepeat;
        sound: TimerSound;
    }>) {
        if (patch.title !== undefined) this.title.set(patch.title);
        if (patch.description !== undefined) this.description.set(patch.description);
        if (patch.date !== undefined) this.date.set(patch.date);
        if (patch.time !== undefined) this.time.set(patch.time);
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
}