import { inject, Injectable, signal } from '@angular/core';
import { EMPTY_STOPWATCH_STATS, Lap, LapSession, StopwatchRepository } from '../core/repositories/stopwatch.repository';
import { calculateSessionStats } from '../utils/stopwatch-session-stats';
import { SettingsSvc } from './settings-svc';
import { cleanupHistory } from '../utils/history-cleanup';

@Injectable({
  providedIn: 'root',
})
export class StopwatchHistorySvc {
  private readonly repo = inject(StopwatchRepository);
  private readonly settings = inject(SettingsSvc);

  readonly current = signal<LapSession | null>(null);
  readonly changed = signal(0);
  readonly history = signal<LapSession[]>([]);

  constructor() {
    void this.load();
  }

  private touch() {
    this.changed.update(v => v + 1);
  }

  async load() {
    const history = await this.repo.load();

    const cleaned = cleanupHistory(
      history,
      this.settings.historyRetentionDays(),
      session => session.finishedAt
    )

    if (cleaned.length !== history.length) {
      await this.repo.restore(cleaned);
    }

    this.history.set(cleaned);
    this.touch();
  }

  startSession() {
    if (this.current()) return;

    this.current.set({
      id: crypto.randomUUID(),
      startedAt: Date.now(),
      finishedAt: 0,
      duration: 0,
      laps: [],
      stats: EMPTY_STOPWATCH_STATS
    })
  }

  async finishSession(totalTime: number) {
    const current = this.current();
    if (!current) return;

    const stats = calculateSessionStats(current.laps);

    const finished: LapSession = {
      ...current,
      finishedAt: Date.now(),
      duration: totalTime,
      stats
    }

    this.history.update(list => [finished, ...list]);
    await this.repo.save(this.history());
    this.current.set(null);
    this.touch();
  }

  async addLap(lapTime: number, totalTime: number) {
    const current = this.current();
    if (!current) return;

    const laps: Lap[] = [
      ...current.laps,
      {
        id: crypto.randomUUID(),
        index: current.laps.length + 1,
        lapTime,
        totalTime,
        createdAt: Date.now()
      }
    ]

    const updated: LapSession = {
      ...current,
      duration: totalTime,
      laps,
      stats: calculateSessionStats(laps)
    }

    this.current.set(updated);
    this.touch();
  }

  getHistory() {
    return this.history();
  }

  async deleteSession(id: string) {
    this.history.update(list => list.filter(x => x.id !== id));
    await this.repo.save(this.history());
    this.touch();
  }

  async clear() {
    await this.repo.clear();
    this.history.set([]);
    this.touch();
  }

  async restore(history: LapSession[]) {
    await this.repo.save(history);
    this.history.set(structuredClone(history));
    this.touch();
  }
}
