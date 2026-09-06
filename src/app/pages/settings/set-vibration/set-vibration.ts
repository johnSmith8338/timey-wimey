import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsSvc } from '../../../services/settings-svc';

@Component({
  selector: 'app-set-vibration',
  imports: [],
  templateUrl: './set-vibration.html',
  styleUrl: './set-vibration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetVibrationSetting {
  readonly settings = inject(SettingsSvc);
}
