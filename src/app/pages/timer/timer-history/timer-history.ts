import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TimerHistoryFacade } from '../../../services/timer-history.facade';
import { TimerHistoryItem, TimerHistoryStatus } from '../../../models/timer-history.model';

@Component({
  selector: 'app-timer-history',
  imports: [],
  templateUrl: './timer-history.html',
  styleUrl: './timer-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerHistory {
  readonly facade = inject(TimerHistoryFacade);

  readonly groups = this.facade.groupedHistory;

  readonly statusMap: Record<TimerHistoryStatus, string> = {
    finished: '✅ finished',
    cancelled: '❌ cancelled'
  }

  clear() {
    this.facade.clear();
  }

  formatDuration(ms: number) {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = sec % 60;

    if (h > 0) return `${h}h ${m}min ${s}sec`;
    if (m > 0) return `${m}min ${s}sec`;

    return `${s}sec`;
  }

  formatProgress(item: TimerHistoryItem): string {
    const elapsed = this.formatDuration(item.elapsedMs);
    const total = this.formatDuration(item.durationMs);

    const percent = item.durationMs === 0 ? 0 : item.elapsedMs / item.durationMs * 100;

    return `${elapsed} / ${total} (${percent.toFixed(2)}%)`;
  }

  run(item: TimerHistoryItem) {
    this.facade.run(item);
  }
}
