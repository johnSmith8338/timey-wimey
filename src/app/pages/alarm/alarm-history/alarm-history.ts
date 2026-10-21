import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlarmHistoryFacade } from '../../../services/alarm-history.facade';
import { AlarmHistoryItem, AlarmHistorySession, AlarmHistoryStatus } from '../../../models/alarm-history.interface';
import { AlarmFormatSvc } from '../../../services/alarm-format-svc';

@Component({
  selector: 'app-alarm-history',
  imports: [],
  templateUrl: './alarm-history.html',
  styleUrl: './alarm-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmHistory {
  readonly facade = inject(AlarmHistoryFacade);
  readonly alarmFormat = inject(AlarmFormatSvc);

  readonly history = this.facade.history;
  readonly groups = this.facade.groupedHistory;
  readonly total = this.facade.total;
  readonly rings = this.facade.rings;
  readonly stops = this.facade.stops;
  readonly snoozes = this.facade.snoozes;
  readonly missed = this.facade.missed;

  formatTime(timestamp: number) {
    return this.alarmFormat.formatDateTime(timestamp);
  }

  readonly statusMap: Record<AlarmHistoryStatus, string> = {
    ring: '🔔 ring',
    stop: '🛑 stopped',
    snooze: '😴 snoozed',
    missed: '💀 missed'
  }

  ringCount(session: AlarmHistorySession) {
    return session.events.filter(e => e.status === 'ring').length;
  }

  clear() {
    this.facade.clear();
  }

  reuse(session: AlarmHistorySession) {
    this.facade.reuse(session);
  }
}
