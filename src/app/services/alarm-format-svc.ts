import { inject, Injectable } from '@angular/core';
import { SettingsSvc } from './settings-svc';

@Injectable({
  providedIn: 'root',
})
export class AlarmFormatSvc {
  private readonly settings = inject(SettingsSvc);

  readonly timeFormat = this.settings.alarmTimeFormat;

  formatTime(hour: number, minute: number): string {
    const formatedMinute = String(minute).padStart(2, '0');

    if (this.timeFormat() === '24h') return `${String(hour).padStart(2, '0')}:${formatedMinute}`;

    const displayHour = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';

    return `${displayHour}:${formatedMinute} ${period}`;
  }

  formatDateTime(timestamp: number): string {
    const hourCycle: 'h12' | 'h23' = this.timeFormat() === '12h' ? 'h12' : 'h23';

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle
    }).format(new Date(timestamp));
  }
}
