import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsSvc } from '../../../services/settings-svc';
import { SoundRampUpPicker } from "../../../components/sound-ramp-up-picker/sound-ramp-up-picker";

@Component({
  selector: 'app-set-sound-ramp-up',
  imports: [SoundRampUpPicker],
  templateUrl: './set-sound-ramp-up.html',
  styleUrl: './set-sound-ramp-up.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetSoundRampUp {
  readonly settings = inject(SettingsSvc);
}
