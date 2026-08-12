import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BackupSvc } from '../../services/backup-svc';
import { SetHistoryRemove } from "./set-history-remove/set-history-remove";
import { SetAlarmDuration } from "./set-alarm-duration/set-alarm-duration";
import { SetAlarmSort } from "./set-alarm-sort/set-alarm-sort";
import { SetWakelock } from "./set-wakelock/set-wakelock";
import { SetTheme } from "./set-theme/set-theme";
import { SetAppReset } from "./set-app-reset/set-app-reset";
import { SetNotifications } from "./set-notifications/set-notifications";

@Component({
  selector: 'app-settings',
  imports: [
    SetHistoryRemove,
    SetAlarmDuration,
    SetAlarmSort,
    SetWakelock,
    SetTheme,
    SetAppReset,
    SetNotifications
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  readonly backup = inject(BackupSvc);

  exportBackup() {
    this.backup.export();
  }

  async importBackup(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await this.backup.import(file);
      alert('backup imported');
    } catch {
      alert('invalid backup file');
    } finally {
      input.value = '';
    }
  }
}
