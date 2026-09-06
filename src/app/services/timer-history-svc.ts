import { inject, Injectable, signal } from '@angular/core';
import { TimerHistoryRepository } from '../core/repositories/timer-history.repository';
import { TimerHistoryItem, TimerHistorySnapshot, TimerHistoryStatus } from '../models/timer-history.model';
import { TimerInstance } from './timer-instance';
import { SettingsSvc } from './settings-svc';
import { cleanupHistory } from '../utils/history-cleanup';

@Injectable({
  providedIn: 'root',
})
export class TimerHistorySvc {
  private readonly repo = inject(TimerHistoryRepository);
  private readonly settings = inject(SettingsSvc);

  readonly history = signal<TimerHistoryItem[]>([]);

  constructor() {
    void this.load();
  }

  async load() {
    const history = await this.repo.load();
    this.history.set(history);
    await this.cleanup();
  }

  async add(timer: TimerInstance, status: TimerHistoryStatus) {
    await this.cleanup();

    const snapshot: TimerHistorySnapshot = {
      title: timer.title(),
      hours: timer.engine.totalHours(),
      minutes: timer.engine.totalMinutes(),
      seconds: timer.engine.totalSeconds(),
      sound: timer.sound(),
      vibration: timer.vibration(),
      icon: timer.icon()
    }

    const item: TimerHistoryItem = {
      id: crypto.randomUUID(),
      startedAt: timer.startedAt(),
      finishedAt: Date.now(),
      durationMs: timer.engine.totalMs(),
      elapsedMs: timer.engine.totalMs() - timer.engine.remainingMs(),
      status,
      snapshot
    }

    this.history.update(list => [item, ...list]);
    await this.repo.save(this.history());
  }

  async clear() {
    this.history.set([]);
    await this.repo.clear();
  }

  private async cleanup() {
    this.history.update(list => cleanupHistory(
      list,
      this.settings.historyRetentionDays(),
      item => item.finishedAt
    ))
    await this.repo.save(this.history());
  }

  async restore(history: TimerHistoryItem[]) {
    this.history.set(structuredClone(history));
    await this.repo.save(this.history());
  }
}
