import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { EventAlarmEditor } from "./event-alarm-editor/event-alarm-editor";
import { AlarmSvc } from '../../services/alarm-svc';
import { EventAlarmDraftSvc } from '../../services/event-alarm-draft';
import { EventAlarm } from '../../models/alarm.interface';
import { describeEventRepeat } from '../../utils/event-alarm.utils';
import { ConfirmDialog } from "../../components/confirm-dialog/confirm-dialog";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-event-alarms',
  imports: [
    EventAlarmEditor,
    ConfirmDialog,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
  ],
  templateUrl: './event-alarms.html',
  styleUrl: './event-alarms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAlarms {
  private readonly alarms = inject(AlarmSvc);
  private readonly draft = inject(EventAlarmDraftSvc);

  readonly search = signal('');
  readonly deletingEvent = signal<EventAlarm | null>(null);

  readonly events = this.alarms.events;
  readonly editorOpened = this.draft.editorOpened;
  readonly describeEventRepeat = describeEventRepeat;

  readonly filteredEvents = computed(() => {
    const query = this.normalize(this.search());
    if (!query) return this.sortedEvents();

    return this.sortedEvents().filter(event => this.matchesEvent(event, query));
  })

  readonly sortedEvents = computed(() =>
    [...this.events()].sort((a, b) => a.order - b.order)
  );

  readonly dragEnabled = computed(() => !this.search().trim());

  constructor() {
    void this.alarms.load();
  }

  async remove(id: string) {
    const event = this.events().find(event => event.id === id);
    if (!event) return;

    this.deletingEvent.set(event);
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

  setSearch(value: string) {
    this.search.set(value);
  }

  private normalize(value: string): string {
    return value.toLowerCase().replace(/\s+/g, '').replace(/:/g, '');
  }

  private matchesEvent(event: EventAlarm, query: string): boolean {
    const values = [
      event.title,
      event.description,
      event.date,
      event.time,
      describeEventRepeat(event.repeat)
    ]

    return values.some(value => this.normalize(value).includes(query));
  }

  async confirmDeleteEvent() {
    const event = this.deletingEvent();
    if (!event) return;

    try {
      await this.alarms.deleteEvent(event.id);
    } finally {
      this.deletingEvent.set(null);
    }
  }

  cancelDeleteEvent() {
    this.deletingEvent.set(null);
  }

  drop(event: CdkDragDrop<EventAlarm[]>) {
    this.alarms.reorderEvents(event);
  }
}
