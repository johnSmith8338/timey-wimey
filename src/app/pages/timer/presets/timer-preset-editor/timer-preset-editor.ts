import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { TimerPreset } from '../../../../core/repositories/timer.repository';
import { DEFAULT_TIMER_COLOR, TimerColor } from '../../../../constants/colors';
import { DEFAULT_TIMER_ICON, TimerIcon } from '../../../../constants/icons';
import { DEFAULT_TIMER_SOUND, TimerSound } from '../../../../services/sound-svc';
import { SoundPicker } from "../../../../components/sound-picker/sound-picker";
import { IconPicker } from "../../../../components/icon-picker/icon-picker";
import { ColorPicker } from "../../../../components/color-picker/color-picker";
import { DurationPicker } from "../../timer-workspace/duration-picker/duration-picker";
import { TimerPresetsFacade } from '../timer-presets.facade';
import { VibrationSetting } from '../../../../models/settings.model';
import { VibrationPicker } from "../../../../components/vibration-picker/vibration-picker";

@Component({
  selector: 'app-timer-preset-editor',
  imports: [
    SoundPicker,
    IconPicker,
    ColorPicker,
    DurationPicker,
    VibrationPicker
  ],
  templateUrl: './timer-preset-editor.html',
  styleUrl: './timer-preset-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerPresetEditor {
  readonly facade = inject(TimerPresetsFacade);
  readonly draft = this.facade.workspace.draft;

  readonly preset = computed(() => this.draft.activePreset());
  readonly icon = computed(() => this.preset()?.icon ?? DEFAULT_TIMER_ICON);
  readonly color = computed(() => this.preset()?.color ?? DEFAULT_TIMER_COLOR);
  readonly sound = computed(() => this.preset()?.sound ?? DEFAULT_TIMER_SOUND);
  readonly vibration = computed(() => this.preset()?.vibration ?? 'short');

  save() {
    this.facade.savePreset();
  }

  cancel() {
    this.facade.cancelEditing();
  }

  updateTitle(e: Event) {
    this.draft.updateTitle((e.target as HTMLInputElement).value);
  }

  setHours(hours: number) {
    this.draft.updateHours(hours);
  }

  setMinutes(minutes: number) {
    this.draft.updateMinutes(minutes);
  }

  setSeconds(seconds: number) {
    this.draft.updateSeconds(seconds);
  }

  setColor(color: TimerColor) {
    this.draft.updateColor(color);
  }

  setIcon(icon: TimerIcon) {
    this.draft.updateIcon(icon);
  }

  setSound(sound: TimerSound) {
    this.draft.updateSound(sound);
  }

  setVibration(vibration: VibrationSetting) {
    this.draft.updateVibration(vibration);
  }
}
