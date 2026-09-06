import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Alarm, AlarmGroup, AlarmGroupView, EventAlarm } from '../models/alarm.interface';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AlarmRepository } from '../core/repositories/alarm.repository';
import { AlarmScheduler } from './alarm-scheduler';
import { SettingsSvc } from './settings-svc';

@Injectable({
  providedIn: 'root',
})
export class AlarmSvc {
  private readonly repo = inject(AlarmRepository);
  private readonly settings = inject(SettingsSvc);

  readonly alarms = signal<Alarm[]>([]);
  readonly events = signal<EventAlarm[]>([]);
  readonly groups = signal<AlarmGroup[]>([]);

  readonly loading = signal(false);

  private readonly scheduler = new AlarmScheduler();

  readonly groupViews = computed<AlarmGroupView[]>(() => {
    const alarms = this.alarms();
    const groups = [...this.groups()].sort((a, b) => a.order - b.order);
    const result: AlarmGroupView[] = [];
    const ungrouped = this.sortAlarms(
      alarms.filter(a => a.groupId === null)
    )

    if (ungrouped.length) {
      result.push({
        id: null,
        title: 'ungrouped',
        expanded: true,
        system: true,
        alarms: ungrouped
      })
    }

    for (const group of groups) {
      result.push({
        id: group.id,
        title: group.title,
        expanded: group.expanded,
        system: false,
        alarms: this.sortAlarms(
          alarms.filter(a => a.groupId === group.id)
        )
      })
    }

    return result;
  })

  private normalize(text: string) {
    return text.toLowerCase().replace(/\s+/g, '').replace(/:/g, '');
  }

  private timeVariants(hour: number, minute: number): string[] {
    const hh = hour.toString().padStart(2, '0');
    const mm = minute.toString().padStart(2, '0');

    return [
      `${hh}:${mm}`,
      `${hour}:${mm}`,
      `${hh}:${minute}`,
      `${hour}:${minute}`,
      `${hh}${mm}`,
      `${hour}${mm}`,
      `${hh}${minute}`,
      `${hour}${minute}`,
    ].map(v => this.normalize(v));

  }

  private matchesAlarm(alarm: Alarm, group: AlarmGroupView, query: string): boolean {
    const q = this.normalize(query);
    if (!q.length) return true;

    const title = this.normalize(alarm.title);
    const groupTitle = this.normalize(group.title);
    const repeat = this.normalize(alarm.repeat.join(' '));
    const timeMatches = this.timeVariants(alarm.hour, alarm.minute).some(time => time.includes(q));

    return (
      title.includes(q) ||
      groupTitle.includes(q) ||
      repeat.includes(q) ||
      timeMatches
    );

  }

  filteredGroupViews(search: Signal<string>) {
    return computed(() => {
      const query = search().trim();
      if (!query.length) return this.groupViews();

      return this.groupViews().map(group => ({
        ...group,
        alarms: group.alarms.filter(alarm => {
          return this.matchesAlarm(alarm, group, query)
        })
      })).filter(group => group.alarms.length)
    })
  }

  readonly nextAlarm = computed(() => {
    return this.scheduler.nextAlarm(this.alarms());
  })

  constructor() {
    void this.load();
  }

  private sortAlarms(alarms: Alarm[]) {
    if (this.settings.alarmSortMode() === 'manual') {
      return [...alarms].sort((a, b) => a.order - b.order);
    }

    return [...alarms].sort((a, b) => {
      const ta = a.hour * 60 + a.minute;
      const tb = b.hour * 60 + b.minute;
      return ta - tb;
    })
  }

  async load() {
    this.loading.set(true);
    try {
      const data = await this.repo.load();

      this.groups.set(data.groups);
      this.alarms.set(data.alarms);
      this.events.set(data.events);
    }
    finally {
      this.loading.set(false);
    }
  }

  private async persist() {
    await this.repo.save({
      groups: this.groups(),
      alarms: this.alarms(),
      events: this.events()
    })
  }

  async save(alarm: Alarm) {
    const alarms = [...this.alarms()];
    const index = alarms.findIndex(a => a.id === alarm.id);

    const updated = {
      ...structuredClone(alarm),
      updatedAt: Date.now()
    }

    if (index >= 0) {
      alarms[index] = updated;
    } else {
      alarms.push(updated);
    }

    this.alarms.set(alarms);
    await this.persist();
  }

  getAlarm(id: string): Alarm | null {
    return this.alarms().find(alarm => alarm.id === id) ?? null;
  }

  async updateAlarm(id: string, patch: Partial<Alarm>) {
    const alarm = this.getAlarm(id);

    if (!alarm) return;

    await this.save({
      ...alarm,
      ...patch,
      updatedAt: Date.now()
    });
  }

  async deleteAlarm(id: string) {
    this.alarms.update(list => list.filter(a => a.id !== id));
    await this.persist();
  }

  async toggleAlarm(alarm: Alarm) {
    this.alarms.update(list => list.map(a =>
      a.id === alarm.id ? {
        ...a,
        enabled: !a.enabled,
        updatedAt: Date.now()
      } : a
    ))

    await this.persist();
  }

  async reorderAlarm(groupId: string | null, event: CdkDragDrop<Alarm[]>) {
    const groupAlarms = this.alarms()
      .filter(a => a.groupId === groupId)
      .sort((a, b) => a.order - b.order);

    moveItemInArray(
      groupAlarms,
      event.previousIndex,
      event.currentIndex
    )

    const updated = this.alarms().map(alarm => {
      if (alarm.groupId !== groupId) return alarm;

      const index = groupAlarms.findIndex(a => a.id === alarm.id);

      return {
        ...alarm,
        order: index,
        updatedAt: Date.now()
      }
    })

    this.alarms.set(updated);
    await this.persist();
  }

  createAlarm(): Alarm {
    return {
      type: 'alarm',
      id: crypto.randomUUID(),
      groupId: null,
      title: 'new alarm',
      hour: 0,
      minute: 0,
      enabled: true,
      repeat: [],
      sound: 'alarm',
      vibration: 'short',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  async disableAlarm(id: string) {
    this.alarms.update(list =>
      list.map(alarm =>
        alarm.id === id ?
          {
            ...alarm,
            enabled: false,
            updatedAt: Date.now()

          }
          : alarm
      )
    )

    await this.persist();
  }

  async duplicateAlarm(alarm: Alarm): Promise<Alarm> {
    const copy: Alarm = {
      ...structuredClone(alarm),
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      title: `${alarm.title} copy`
    }

    this.alarms.update(list => [...list, copy]);
    await this.persist();
    return copy;
  }

  async createGroup() {
    const groups = [...this.groups()];

    groups.push({
      id: crypto.randomUUID(),
      title: `Group ${groups.length + 1}`,
      color: 'transparent',
      order: groups.length,
      expanded: true
    })

    this.groups.set(groups);
    await this.persist();
  }

  async renameGroup(group: AlarmGroup, title: string) {
    this.groups.update(list => list.map(g =>
      g.id === group.id ? {
        ...g,
        title
      } : g
    ))

    await this.persist();
  }

  async deleteGroup(id: string) {
    this.groups.update(list => list
      .filter(g => g.id !== id)
      .map((g, index) => ({
        ...g,
        order: index
      }))
    )

    this.alarms.update(list => list.map(a =>
      a.groupId === id ? {
        ...a,
        groupId: null,
        updatedAt: Date.now()
      } : a
    ))

    await this.persist();
  }

  async moveAlarmToGroup(alarm: Alarm, groupId: string | null) {
    this.alarms.update(list => list.map(a =>
      a.id === alarm.id ? {
        ...a,
        groupId,
        updatedAt: Date.now()
      } : a
    ))

    await this.persist();
  }

  async toggleGroup(group: AlarmGroup) {
    this.groups.update(list => list.map(g =>
      g.id === group.id ? {
        ...g,
        expanded: !g.expanded
      } : g
    ))

    await this.persist();
  }

  getGroup(id: string | null) {
    if (id === null) return null;
    return this.groups().find(g => g.id === id) ?? null;
  }

  async restore(groups: AlarmGroup[], alarms: Alarm[], events: EventAlarm[] = []) {
    this.groups.set(structuredClone(groups));
    this.alarms.set(structuredClone(alarms));
    this.events.set(structuredClone(events));

    await this.persist();
  }

  readonly ungroupedAlarms = computed(() =>
    this.sortAlarms(
      this.alarms().filter(a => a.groupId === null)
    )
  )

  readonly groupedAlarms = computed(() => {
    const alarms = this.alarms();
    return this.groups()
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        group,
        alarms: this.sortAlarms(
          alarms.filter(a => a.groupId === group.id)
        )
      })
      )
  })

  /**
   * EventAlarms
   */

  createEvent(): EventAlarm {
    const now = Date.now();

    return {
      type: 'event',
      id: crypto.randomUUID(),
      groupId: null,
      title: 'new event',
      description: '',
      date: '',
      time: '09:00',
      sound: 'none',
      vibration: 'short',
      enabled: true,
      repeat: { type: 'once' },
      createdAt: now,
      updatedAt: now,
      order: 0,
      lastFiredAt: null
    };
  }

  getEvent(id: string): EventAlarm | null {
    return this.events().find(event => event.id === id) ?? null;
  }

  async saveEvent(event: EventAlarm): Promise<void> {
    const events = [...this.events()];
    const index = events.findIndex(e => e.id === event.id);
    const updatedEvent: EventAlarm = {
      ...structuredClone(event),
      updatedAt: Date.now()
    }

    if (index >= 0) {
      events[index] = updatedEvent;
    } else {
      events.push(updatedEvent);
    }

    this.events.set(events);
    await this.persist();
  }

  async updateEvent(id: string, patch: Partial<EventAlarm>): Promise<void> {
    const event = this.getEvent(id);
    if (!event) return;

    await this.saveEvent({
      ...event,
      ...patch,
      id,
      updatedAt: Date.now()
    })
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.update(list => list.filter(event => event.id !== id));
    await this.persist();
  }

  async toggleEvent(id: string): Promise<void> {
    this.events.update(list =>
      list.map(event => event.id === id ?
        {
          ...event,
          enabled: !event.enabled,
          updatedAt: Date.now()
        } : event
      )
    )
    await this.persist();
  }

  async reorderEvents(event: CdkDragDrop<EventAlarm[]>) {
    const events = [...this.events()];

    moveItemInArray(
      events,
      event.previousIndex,
      event.currentIndex
    )

    const updated = events.map((event, index) => ({
      ...event,
      order: index,
      updatedAt: Date.now()
    }))

    this.events.set(updated);
    await this.persist();
  }
}
