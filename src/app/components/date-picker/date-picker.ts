import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CalendarDate, DatePickerMode } from '../../models/date.model';
import { formatCalendarDate, parseCalendarDate } from '../../utils/date-helper';
import { CalendarPicker } from "./calendar-picker/calendar-picker";
import { DateInputs } from "./date-inputs/date-inputs";
import { DateWheelPicker } from "./date-wheel-picker/date-wheel-picker";
import { SettingsSvc } from '../../services/settings-svc';

@Component({
  selector: 'app-date-picker',
  imports: [CalendarPicker, DateInputs, DateWheelPicker],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePicker {
  private readonly settings = inject(SettingsSvc);

  readonly value = input<string>('');
  readonly valueChange = output<string>();

  readonly mode = computed(() => this.settings.datePickerMode());

  readonly date = computed(() => parseCalendarDate(this.value()));

  setDate(date: CalendarDate) {
    this.valueChange.emit(formatCalendarDate(date));
  }

  async setMode(mode: DatePickerMode) {
    await this.settings.setDatePickerMode(mode);
  }
}
