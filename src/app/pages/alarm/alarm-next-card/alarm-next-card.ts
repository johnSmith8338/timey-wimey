import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { AlarmSvc } from '../../../services/alarm-svc';
import { AlarmFormatSvc } from '../../../services/alarm-format-svc';

@Component({
  selector: 'app-alarm-next-card',
  imports: [],
  templateUrl: './alarm-next-card.html',
  styleUrl: './alarm-next-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlrmNextCard {
  private readonly alarmSvc = inject(AlarmSvc);
  readonly alarmFormat = inject(AlarmFormatSvc);

  readonly next = this.alarmSvc.nextAlarm;

  readonly now = signal(Date.now());

  private readonly weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
  private readonly date = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  })

  readonly remaining = computed(() => {
    const next = this.next();
    if (!next) return '';

    const diff = next.fireAt.getTime() - this.now();

    return this.formatRemaining(diff);
  })

  private formatRemaining(ms: number): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `in ${days} d ${hours} h`;
    if (hours > 0) return `in ${hours} h ${minutes} min`;

    return `in ${minutes} min`;
  }

  readonly dayText = computed(() => {
    const next = this.next();
    if (!next) return '';

    const now = new Date(this.now());
    const fire = next.fireAt;

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const fireDay = new Date(fire);
    fireDay.setHours(0, 0, 0, 0);

    const diffDays = (fireDay.getTime() - today.getTime()) / 86_400_000;
    if (diffDays === 0) return `today, ${this.weekday.format(fire)}`;
    if (diffDays === 1) return `tomorrow, ${this.weekday.format(fire)}`;

    return `${this.weekday.format(fire)}, ${this.date.format(fire)}`;
  })

  constructor() {
    const update = () => {
      this.now.set(Date.now());
      const ms = Date.now();
      const delay = 60_000 - (ms % 60_000);
      setTimeout(update, delay);
    }

    update();
  }
}
