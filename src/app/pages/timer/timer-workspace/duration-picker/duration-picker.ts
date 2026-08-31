import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { WheelPicker } from "../../../../components/wheel-picker/wheel-picker";
import { TimerWorkspaceFacade } from '../timer-workspace.facade';
import { TimerFace } from "../timer-face/timer-face";
import { DialStep } from '../../../../directives/timer-dial-editor';
import { PickerModeSelector } from "../../../../components/picker-mode-selector/picker-mode-selector";
import { SettingsSvc } from '../../../../services/settings-svc';

@Component({
  selector: 'app-duration-picker',
  imports: [WheelPicker, TimerFace, PickerModeSelector],
  templateUrl: './duration-picker.html',
  styleUrl: './duration-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DurationPicker {
  private readonly settingsSvc = inject(SettingsSvc);
  readonly facade = inject(TimerWorkspaceFacade);

  settings = this.facade.draft.settings;
  readonly pickerMode = this.settingsSvc.alarmTimeInputMode;

  readonly hoursItems = Array.from({ length: 24 }, (_, i) => i);
  readonly minuteItems = Array.from({ length: 60 }, (_, i) => i);
  readonly secondItems = Array.from({ length: 60 }, (_, i) => i);

  disabled = computed(() =>
    this.facade.draft.running() || this.facade.dialogOpened()
  )

  updateHours(event: Event) {
    this.facade.draft.setHours(Number((event.target as HTMLInputElement).value));
  }

  updateMinutes(event: Event) {
    this.facade.draft.setMinutes(Number((event.target as HTMLInputElement).value));
  }

  updateSeconds(event: Event) {
    this.facade.draft.setSeconds(Number((event.target as HTMLInputElement).value));
  }

  dialStep(step: DialStep) {
    const settings = this.settings();
    if (!settings) return;

    if (step.unit === 'seconds') {
      this.facade.draft.setSeconds(step.value);
      if (step.turns === 1) this.increamentMinutes();
      if (step.turns === -1) this.decrementMinutes();
      return;
    }

    this.facade.draft.setMinutes(step.value);
    if (step.turns === 1) this.incrementHours();
    if (step.turns === -1) this.decrementHours();
  }

  increamentMinutes() {
    const s = this.settings();
    if (!s) return;

    let minutes = s.minutes + 1;
    let hours = s.hours;

    if (minutes > 59) {
      minutes = 0;
      hours++;
    }

    this.facade.draft.setMinutes(minutes);
    this.facade.draft.setHours(hours);
  }

  decrementMinutes() {
    const s = this.settings();
    if (!s) return;

    let minutes = s.minutes - 1;
    let hours = s.hours;

    if (minutes < 0) {
      minutes = 59;
      hours = Math.max(0, hours - 1);
    }

    this.facade.draft.setMinutes(minutes);
    this.facade.draft.setHours(hours);
  }

  incrementHours() {
    const s = this.settings();
    if (!s) return;

    this.facade.draft.setHours(Math.min(23, s.hours + 1));
  }

  decrementHours() {
    const s = this.settings();
    if (!s) return;

    this.facade.draft.setHours(Math.max(0, s.hours - 1));
  }
}
