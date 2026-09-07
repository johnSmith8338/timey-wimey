import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CalendarDate, CalendarDay } from '../../../models/date.model';
import { daysInMonth, firstWeekDay } from '../../../utils/date-helper';

@Component({
  selector: 'app-calendar-picker',
  imports: [],
  templateUrl: './calendar-picker.html',
  styleUrl: './calendar-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPicker {
  readonly selectedDate = input<CalendarDate | null>(null);
  readonly valueChange = output<CalendarDate>();

  readonly displayedYear = signal(0);
  readonly displayedMonth = signal(0);

  readonly weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  readonly monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  readonly monthTitle = computed(() => this.monthNames[this.displayedMonth() - 1]);

  readonly today = (() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    } satisfies CalendarDate;
  })();

  readonly days = computed<CalendarDay[]>(() => {
    const year = this.displayedYear();
    const month = this.displayedMonth();

    if (!year || !month) return [];

    const daysCount = daysInMonth(year, month);
    const offset = firstWeekDay(year, month);

    const result: CalendarDay[] = [];

    // prev month
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;
    const previousMonthDays = daysInMonth(previousYear, previousMonth);

    for (let i = offset - 1; i >= 0; i--) {
      const day = previousMonthDays - i;
      result.push({
        day,
        date: {
          year: previousYear,
          month: previousMonth,
          day
        },
        currentMonth: false
      })
    }

    // current month
    for (let day = 1; day <= daysCount; day++) {
      result.push({
        day,
        date: { year, month, day },
        currentMonth: true
      })
    }

    // next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    let nextDay = 1;

    while (result.length < 42) {
      result.push({
        day: nextDay,
        date: {
          year: nextYear,
          month: nextMonth,
          day: nextDay
        },
        currentMonth: false
      })
      nextDay++;
    }

    return result;
  })

  constructor() {
    effect(() => {
      const date = this.selectedDate();
      if (!date) return;

      this.displayedYear.set(date.year);
      this.displayedMonth.set(date.month);
    })
  }

  previousMonth() {
    if (this.displayedMonth() === 1) {
      this.displayedMonth.set(12);
      this.displayedYear.update(year => year - 1);
    } else {
      this.displayedMonth.update(month => month - 1);
    }
  }

  nextMonth() {
    if (this.displayedMonth() === 12) {
      this.displayedMonth.set(1);
      this.displayedYear.update(year => year + 1);
    } else {
      this.displayedMonth.update(month => month + 1);
    }
  }

  select(date: CalendarDate) {
    this.valueChange.emit(date);
    this.displayedYear.set(date.year);
    this.displayedMonth.set(date.month);
  }

  isSelected(date: CalendarDate): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;

    return (
      selected.year === date.year && selected.month === date.month && selected.day === date.day
    )
  }

  isToday(date: CalendarDate): boolean {
    return (this.today.year === date.year && this.today.month === date.month && this.today.day === date.day)
  }

  goToToday() {
    this.displayedYear.set(this.today.year);
    this.displayedMonth.set(this.today.month);
    this.valueChange.emit(this.today);
  }
}
