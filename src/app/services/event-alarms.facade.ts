import { inject, Injectable, signal } from "@angular/core";
import { EventAlarmSvc } from "./event-alarm-svc";
import { EventAlarm } from "../models/event-alarm.model";
import { EventAlarmDraftSvc } from "./event-alarm-draft";

@Injectable({
    providedIn: 'root',
})
export class EventAlarmsFacade {
    private readonly eventSvc = inject(EventAlarmSvc);
    private readonly draft = inject(EventAlarmDraftSvc);

    readonly events = this.eventSvc.events;

    readonly editorOpened = signal(false);

    async load() {
        await this.eventSvc.load();
    }

    async add(event: EventAlarm) {
        await this.eventSvc.add(event);
    }

    async update(event: EventAlarm) {
        await this.eventSvc.update(event);
    }

    async remove(id: string) {
        await this.eventSvc.remove(id);
    }

    async toggle(id: string) {
        await this.eventSvc.toggle(id);
    }

    create() {
        this.draft.reset();
        this.editorOpened.set(true);
    }

    edit(event: EventAlarm) {
        this.draft.load(event);
        this.editorOpened.set(true);
    }

    closeEditor() {
        this.editorOpened.set(false);
        this.draft.reset();
    }
}