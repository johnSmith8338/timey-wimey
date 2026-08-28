import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { AlarmInputMode } from '../../models/alarm-input-mode.type';
import { AlarmTimeUnit } from '../../models/alarm-time-unit.type';

export interface TimeValue {
  hour: number;
  minute: number;
}

@Component({
  selector: 'app-time-picker',
  imports: [],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimePicker {
  readonly hour = input.required<number>();
  readonly minute = input.required<number>();

  readonly hourChange = output<number>();
  readonly minuteChange = output<number>();

  readonly inputMode = signal<AlarmInputMode>('dial');
  readonly faceMode = signal<AlarmTimeUnit>('hour');
}
