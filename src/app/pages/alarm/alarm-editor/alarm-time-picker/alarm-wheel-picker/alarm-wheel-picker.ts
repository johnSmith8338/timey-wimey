import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WheelPicker } from "../../../../../components/wheel-picker/wheel-picker";
import { AlarmTimeEngine } from '../../../../../models/alarm-face-engine.interface';

@Component({
  selector: 'app-alarm-wheel-picker',
  imports: [WheelPicker],
  templateUrl: './alarm-wheel-picker.html',
  styleUrl: './alarm-wheel-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmWheelPicker {
  readonly engine = input.required<AlarmTimeEngine>();

  readonly hourItems = Array.from({ length: 24 }, (_, i) => i);
  readonly minuteItems = Array.from({ length: 60 }, (_, i) => i);
}
