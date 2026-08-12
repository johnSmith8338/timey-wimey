import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { StepTracker } from '../../directives/step-tracker';
import { Router } from '@angular/router';
import { SettingsSvc } from '../../services/settings-svc';
import { SetTheme } from "../settings/set-theme/set-theme";
import { SetWakelock } from "../settings/set-wakelock/set-wakelock";
import { SetAlarmDuration } from "../settings/set-alarm-duration/set-alarm-duration";
import { SetHistoryRemove } from "../settings/set-history-remove/set-history-remove";
import { SetAlarmSort } from "../settings/set-alarm-sort/set-alarm-sort";

@Component({
  selector: 'app-welcome',
  imports: [StepTracker, SetTheme, SetWakelock, SetAlarmDuration, SetHistoryRemove, SetAlarmSort],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Welcome {
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsSvc);

  readonly steps = signal([
    'welcome',
    'notifications',
    'theme',
    'wake lock',
    'alarm',
    'history',
    'finish'
  ])

  constructor() {
    effect(() => {
      if (this.settings.settings().firstRunCompleted) {
        void this.router.navigate(['dashboard']);
      }
    })
  }

  private async completeFirstRun() {
    await this.settings.finishFirstRun();
    await this.router.createUrlTree(['/dashboard']);
  }

  finish() {
    return this.completeFirstRun();
  }

  skip() {
    return this.completeFirstRun();
  }
}
