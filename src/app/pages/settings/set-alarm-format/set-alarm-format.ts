import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SettingsSvc } from '../../../services/settings-svc';
import { AlarmTimeFormat } from '../../../models/settings.model';

@Component({
  selector: 'app-set-alarm-format',
  imports: [],
  templateUrl: './set-alarm-format.html',
  styleUrl: './set-alarm-format.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetAlarmFormat {
  private readonly settings = inject(SettingsSvc);

  readonly timeFormat = this.settings.alarmTimeFormat;

  setTimeFormat(value: AlarmTimeFormat): void {
    void this.settings.setAlarmTimeFormat(value);
  }
}
