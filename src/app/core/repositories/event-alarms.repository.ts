import { Injectable } from "@angular/core";
import { EventAlarm } from "../../models/event-alarm.model";

@Injectable({
    providedIn: 'root'
})
export class EventAlarmsRepository {
    async load(): Promise<EventAlarm[]> {
        return [];
    }

    async save(_items: EventAlarm[]): Promise<void> {
        // add IDb
    }
}