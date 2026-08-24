import { inject, Injectable, signal } from '@angular/core';
import { EventAlarmsRepository } from '../core/repositories/event-alarms.repository';
import { EventAlarm } from '../models/event-alarm.model';

@Injectable({
  providedIn: 'root',
})
export class EventAlarmSvc {
  private readonly repo = inject(EventAlarmsRepository);

  readonly events = signal<EventAlarm[]>([]);
  readonly changed = signal(0);

  async load() {
    const events = await this.repo.load();
    this.events.set(events);
  }

  async add(event: EventAlarm) {
    this.events.update(list => [...list, event]);
    await this.repo.save(this.events());
    this.notifyChanged();
  }

  async update(event: EventAlarm) {
    this.events.update(list =>
      list.map(item => item.id === event.id ? event : item)
    )
    await this.repo.save(this.events());
    this.notifyChanged();
  }

  async remove(id: string) {
    this.events.update(list =>
      list.filter(item => item.id !== id)
    )
    await this.repo.save(this.events());
    this.notifyChanged();
  }

  async toggle(id: string) {
    this.events.update(list =>
      list.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    )
    await this.repo.save(this.events());
    this.notifyChanged();
  }

  private notifyChanged() {
    this.changed.update(value => value + 1);
  }
}
