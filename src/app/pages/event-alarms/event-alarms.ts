import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventAlarmEditor } from "./event-alarm-editor/event-alarm-editor";
import { AlarmSvc } from '../../services/alarm-svc';
import { EventAlarmDraftSvc } from '../../services/event-alarm-draft';
import { EventAlarm } from '../../models/alarm.interface';

@Component({
  selector: 'app-event-alarms',
  imports: [EventAlarmEditor],
  templateUrl: './event-alarms.html',
  styleUrl: './event-alarms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAlarms {
  private readonly alarms = inject(AlarmSvc);
  private readonly draft = inject(EventAlarmDraftSvc);

  readonly events = this.alarms.events;
  readonly editorOpened = this.draft.editorOpened;

  constructor() {
    void this.alarms.load();
  }

  async remove(id: string) {
    await this.alarms.deleteEvent(id);
  }

  async toggle(id: string) {
    await this.alarms.toggleEvent(id);
  }

  create() {
    this.draft.openCreate();
  }

  edit(event: EventAlarm) {
    this.draft.openEdit(event);
  }

  closeEditor() {
    this.draft.closeEditor();
  }
}
