import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AlarmFace } from "./alarm-face/alarm-face";
import { AlarmDialStep } from '../../../../models/alarm-dial-step.interface';
import { AlarmInputs } from "./alarm-inputs/alarm-inputs";
import { AlarmWheelPicker } from "./alarm-wheel-picker/alarm-wheel-picker";
import { AlarmTimeUnit } from '../../../../models/alarm-time-unit.type';
import { AlarmInputMode } from '../../../../models/alarm-input-mode.type';
import { AlarmTimeEngine } from '../../../../models/alarm-face-engine.interface';
import { AlarmWorkspaceFacade } from '../../../../services/alarm-workspace.facade';
import { SettingsSvc } from '../../../../services/settings-svc';

@Component({
  selector: 'app-alarm-time-picker',
  imports: [AlarmFace, AlarmInputs, AlarmWheelPicker],
  templateUrl: './alarm-time-picker.html',
  styleUrl: './alarm-time-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmTimePicker {
  private readonly workspace = inject(AlarmWorkspaceFacade);
  private readonly settings = inject(SettingsSvc);

  readonly engine = input<AlarmTimeEngine | null>(null);

  readonly faceMode = signal<AlarmTimeUnit>('hour');

  readonly inputMode = this.settings.alarmTimeInputMode;

  readonly timeEngine = computed(() => this.engine() ?? this.workspace.draft)

  dialChanged(step: AlarmDialStep) {
    if (step.unit === 'hour') {
      this.timeEngine().updateHour(step.value);
      return;
    }

    this.timeEngine().updateMinute(step.value);
  }

  dialFinished() {
    if (this.faceMode() === 'hour') this.faceMode.set('minute');
  }

  setInputMode(mode: AlarmInputMode) {
    void this.settings.setAlarmTimeInputMode(mode);
  }
}
