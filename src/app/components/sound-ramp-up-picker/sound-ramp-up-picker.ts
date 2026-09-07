import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AlarmSoundRampUp } from '../../models/settings.model';

@Component({
  selector: 'app-sound-ramp-up-picker',
  imports: [],
  templateUrl: './sound-ramp-up-picker.html',
  styleUrl: './sound-ramp-up-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoundRampUpPicker {
  readonly value = input.required<AlarmSoundRampUp>();
  readonly valueChange = output<AlarmSoundRampUp>();

  readonly options = [
    { value: 'off', label: 'off' },
    { value: 'slow', label: '15s' },
    { value: 'normal', label: '10s' },
    { value: 'fast', label: '5s' }
  ] as const;

  select(value: AlarmSoundRampUp) {
    this.valueChange.emit(value);
  }
}
