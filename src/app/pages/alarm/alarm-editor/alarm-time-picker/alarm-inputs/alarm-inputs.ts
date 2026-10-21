import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlarmTimeEngine } from '../../../../../models/alarm-face-engine.interface';
import { AlarmHourPicker } from '../../alarm-hour-picker/alarm-hour-picker';
import { AlarmTimeFormat } from '../../../../../models/settings.model';

@Component({
  selector: 'app-alarm-inputs',
  imports: [AlarmHourPicker],
  templateUrl: './alarm-inputs.html',
  styleUrl: './alarm-inputs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmInputs {
  readonly engine = input.required<AlarmTimeEngine>();
  readonly timeFormat = input.required<AlarmTimeFormat>();

  updateMinute(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return;

    const value = Number(input.value);

    if (!Number.isInteger(value) || value < 0 || value > 59) {
      input.value = String(this.engine().minute());
      return;
    }

    this.engine().updateMinute(value);
  }
}
