import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AlarmWorkspaceFacade } from '../../../../services/alarm-workspace.facade';
import { VibrationSvc } from '../../../../services/vibration-svc';
import { SheetSelectItem, SheetSelect } from '../../../../components/sheet-select/sheet-select';
import { VibrationSetting } from '../../../../models/settings.model';

@Component({
  selector: 'app-alarm-vibration-picker',
  imports: [SheetSelect],
  templateUrl: './alarm-vibration-picker.html',
  styleUrl: './alarm-vibration-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmVibrationPicker {
  private readonly workspace = inject(AlarmWorkspaceFacade);
  private readonly vibrationSvc = inject(VibrationSvc);

  readonly draft = this.workspace.draft;

  readonly opened = signal(false);

  readonly items = computed<SheetSelectItem<VibrationSetting>[]>(() => [
    { id: 'short', title: 'short' },
    { id: 'double', title: 'double' },
    { id: 'long', title: 'long' },
    { id: 'alarm', title: 'alarm' },
    { id: 'off', title: 'off' },
  ])

  change(vibration: VibrationSetting) {
    this.draft.updateVibration(vibration);
    this.vibrationSvc.preview(vibration);
  }
}
