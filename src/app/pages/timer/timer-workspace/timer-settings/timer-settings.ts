import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SoundPicker } from "../../../../components/sound-picker/sound-picker";
import { TimerSettingsSvc } from '../../../../services/timer-settings-svc';
import { TimerColor } from '../../../../constants/colors';
import { TimerIcon } from '../../../../constants/icons';
import { TimerSound } from '../../../../services/sound-svc';
import { ColorPicker } from "../../../../components/color-picker/color-picker";
import { IconPicker } from "../../../../components/icon-picker/icon-picker";
import { TimerWorkspaceFacade } from '../timer-workspace.facade';
import { VibrationSetting } from '../../../../models/settings.model';
import { VibrationPicker } from "../../../../components/vibration-picker/vibration-picker";

@Component({
  selector: 'app-default-timer-settings',
  imports: [SoundPicker, ColorPicker, IconPicker, VibrationPicker],
  templateUrl: './timer-settings.html',
  styleUrl: './timer-settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultTimerSettings {
  readonly facade = inject(TimerWorkspaceFacade);

  readonly settings = this.facade.appSettings;

  setColor(color: TimerColor) {
    this.facade.draft.updateColor(color);
  }

  setIcon(icon: TimerIcon) {
    this.facade.draft.updateIcon(icon);
  }

  setSound(sound: TimerSound) {
    this.facade.draft.updateSound(sound);
  }

  setVibration(vibration: VibrationSetting) {
    this.facade.draft.updateVibration(vibration);
  }
}
