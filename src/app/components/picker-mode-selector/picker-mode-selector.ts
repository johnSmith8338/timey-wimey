import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsSvc } from '../../services/settings-svc';
import { AlarmInputMode } from '../../models/alarm-input-mode.type';

@Component({
  selector: 'app-picker-mode-selector',
  imports: [],
  templateUrl: './picker-mode-selector.html',
  styleUrl: './picker-mode-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerModeSelector {
  private readonly settings = inject(SettingsSvc);

  readonly mode = this.settings.alarmTimeInputMode;

  async setMode(mode: AlarmInputMode) {
    await this.settings.setAlarmTimeInputMode(mode);
  }
}
