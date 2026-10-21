import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WheelPicker } from "../../../../../components/wheel-picker/wheel-picker";
import { AlarmTimeEngine } from '../../../../../models/alarm-face-engine.interface';
import { AlarmHourPicker } from '../../alarm-hour-picker/alarm-hour-picker';
import { AlarmTimeFormat } from '../../../../../models/settings.model';

@Component({
  selector: 'app-alarm-wheel-picker',
  imports: [WheelPicker, AlarmHourPicker],
  templateUrl: './alarm-wheel-picker.html',
  styleUrl: './alarm-wheel-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmWheelPicker {
  readonly engine = input.required<AlarmTimeEngine>();
  readonly timeFormat = input.required<AlarmTimeFormat>();

  readonly minuteItems = Array.from({ length: 60 }, (_, i) => i);
}
