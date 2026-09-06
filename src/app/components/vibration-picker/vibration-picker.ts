import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VibrationSetting } from '../../models/settings.model';

@Component({
  selector: 'app-vibration-picker',
  imports: [],
  templateUrl: './vibration-picker.html',
  styleUrl: './vibration-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VibrationPicker {
  readonly value = input.required<VibrationSetting>();
  readonly valueChange = output<VibrationSetting>();

  readonly options = [
    { value: 'short', label: 'short' },
    { value: 'double', label: 'double' },
    { value: 'long', label: 'long' },
    { value: 'alarm', label: 'alarm' },
    { value: 'off', label: 'off' },
  ] as const;

  select(value: VibrationSetting) {
    this.valueChange.emit(value);
  }
}
