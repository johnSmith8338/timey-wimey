import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CalendarDate } from '../../../models/date.model';
import { daysInMonth } from '../../../utils/date-helper';

@Component({
  selector: 'app-date-inputs',
  imports: [],
  templateUrl: './date-inputs.html',
  styleUrl: './date-inputs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateInputs {
  readonly date = input<CalendarDate | null>(null);
  readonly valueChange = output<CalendarDate>();

  updateDay(value: string) {
    const date = this.date();
    if (!date) return;

    const day = Math.min(daysInMonth(date.year, date.month), Math.max(1, Number(value) || 1));
    this.valueChange.emit({
      ...date,
      day
    })
  }

  updateMonth(value: string) {
    const date = this.date();
    if (!date) return;

    const month = Math.min(12, Math.max(1, Number(value) || 1));
    const day = Math.min(date.day, daysInMonth(date.year, month));
    this.valueChange.emit({
      ...date,
      month,
      day
    })
  }

  updateYear(value: string) {
    const date = this.date();
    if (!date) return;

    const year = Math.min(2100, Math.max(1970, Number(value) || 1970));
    const day = Math.min(date.day, daysInMonth(year, date.month));
    this.valueChange.emit({
      ...date,
      year,
      day
    })
  }
}
