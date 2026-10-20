import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SettingsSvc } from '../../services/settings-svc';
import { AlarmInputMode } from '../../models/alarm-input-mode.type';
import { SheetSelectItem, SheetSelect } from '../sheet-select/sheet-select';

@Component({
  selector: 'app-picker-mode-selector',
  imports: [SheetSelect],
  templateUrl: './picker-mode-selector.html',
  styleUrl: './picker-mode-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickerModeSelector {
  private readonly settings = inject(SettingsSvc);

  readonly mode = this.settings.alarmTimeInputMode;

  readonly opened = signal(false);

  async setMode(mode: AlarmInputMode) {
    await this.settings.setAlarmTimeInputMode(mode);
  }

  readonly items: SheetSelectItem<AlarmInputMode>[] = [
    { id: 'dial', title: 'dial' },
    { id: 'inputs', title: 'inputs' },
    { id: 'wheel', title: 'wheel' },
  ]
}
