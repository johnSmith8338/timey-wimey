import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { WheelPicker } from "../../wheel-picker/wheel-picker";
import { daysInMonth } from '../../../utils/date-helper';
import { CalendarDate } from '../../../models/date.model';

@Component({
  selector: 'app-date-wheel-picker',
  imports: [WheelPicker],
  templateUrl: './date-wheel-picker.html',
  styleUrl: './date-wheel-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWheelPicker {
  readonly date = input<CalendarDate | null>(null);
  readonly valueChange = output<CalendarDate>();

  readonly monthItems = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly yearItems = Array.from({ length: 131 }, (_, i) => 1970 + i);

  readonly dayItems = computed(() => {
    const date = this.date();
    if (!date) return Array.from({ length: 31 }, (_, i) => i + 1);

    return Array.from({ length: daysInMonth(date.year, date.month) }, (_, i) => i + 1);
  })

  readonly monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  readonly monthLabel = (month: number) => this.monthNames[month - 1] ?? '';

  updateDay(day: number) {
    const date = this.date();
    if (!date) return;

    this.valueChange.emit({
      ...date,
      day
    })
  }

  updateMonth(month: number) {
    const date = this.date();
    if (!date) return;

    const day = Math.min(date.day, daysInMonth(date.year, month));

    this.valueChange.emit({
      ...date,
      month,
      day
    })
  }

  updateYear(year: number) {
    const date = this.date();
    if (!date) return;

    const day = Math.min(date.day, daysInMonth(year, date.month));

    this.valueChange.emit({
      ...date,
      year,
      day
    })
  }
}
