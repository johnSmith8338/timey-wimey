import { inject, Injectable } from '@angular/core';
import { SettingsSvc } from './settings-svc';
import { VIBRATION_PATTERNS, VibrationSetting } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class VibrationSvc {
  private readonly settings = inject(SettingsSvc);

  vibrate(settings: VibrationSetting = 'short'): boolean {
    if (settings === 'off') return false;
    if (!this.settings.vibrationEnabled()) return false;
    if (!('vibrate' in navigator)) return false;

    return navigator.vibrate(VIBRATION_PATTERNS[settings]);
  }

  stop(): void {
    if ('vibrate' in navigator) navigator.vibrate(0);
  }

  preview(setting: VibrationSetting): boolean {
    return this.vibrate(setting);
  }
}
