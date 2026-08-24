import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventAlarmsFacade } from '../../services/event-alarms.facade';
import { EventAlarm } from '../../models/event-alarm.model';
import { EventAlarmEditor } from "./event-alarm-editor/event-alarm-editor";

@Component({
  selector: 'app-event-alarms',
  imports: [EventAlarmEditor],
  templateUrl: './event-alarms.html',
  styleUrl: './event-alarms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAlarms {
  readonly facade = inject(EventAlarmsFacade);

  readonly events = this.facade.events;

  constructor() {
    void this.facade.load();
  }

  async remove(id: string) {
    await this.facade.remove(id);
  }

  async toggle(id: string) {
    await this.facade.toggle(id);
  }

  create() {
    this.facade.create();
  }

  edit(event: EventAlarm) {
    this.facade.edit(event);
  }
}
