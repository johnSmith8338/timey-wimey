import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AlarmTimeEngine } from '../../../../models/alarm-face-engine.interface';
import { AlarmTimeFormat } from '../../../../models/settings.model';
import { WheelPicker } from '../../../../components/wheel-picker/wheel-picker';

type HourPickerMode = 'input' | 'wheel';

@Component({
  selector: 'app-alarm-hour-picker',
  imports: [WheelPicker],
  templateUrl: './alarm-hour-picker.html',
  styleUrl: './alarm-hour-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmHourPicker {
  readonly engine = input.required<AlarmTimeEngine>();
  readonly timeFormat = input.required<AlarmTimeFormat>();
  readonly mode = input.required<HourPickerMode>();

  readonly hourItems = computed<number[]>(() =>
    this.timeFormat() === '12h'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i)
  )

  readonly displayHour = computed(() => {
    const hour = this.engine().hour();

    return this.timeFormat() === '12h' ? hour % 12 || 12 : hour;
  })

  readonly meridiem = computed(() => this.engine().hour() < 12 ? 'AM' : 'PM');

  updateHour(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return;

    const value = Number(input.value);
    const max = this.timeFormat() === '12h' ? 12 : 23;
    const min = this.timeFormat() === '12h' ? 1 : 0;

    if (!Number.isInteger(value) || value < min || value > max) {
      input.value = String(this.displayHour());
      return;
    }

    this.setDisplayHour(value);
  }

  selectHour(value: number) {
    this.setDisplayHour(value);
  }

  toggleMeridiem() {
    const hour = this.engine().hour();
    this.engine().updateHour((hour + 12) % 24);
  }

  private setDisplayHour(value: number) {
    if (this.timeFormat() === '24h') {
      this.engine().updateHour(value);
      return;
    }

    const isPm = this.engine().hour() >= 12;
    const hour12 = value % 12;

    this.engine().updateHour(hour12 + (isPm ? 12 : 0));
  }
}
