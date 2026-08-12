import { inject, Injectable } from '@angular/core';
import { NotificationSvc } from './notification-svc';
import { SettingsSvc } from './settings-svc';

@Injectable({
  providedIn: 'root',
})
export class NotificationPromptSvc {
  private readonly notification = inject(NotificationSvc);
  private readonly settings = inject(SettingsSvc);

  async requestIfNeeded(): Promise<void> {
    if (!this.notification.supported) return;

    if (this.settings.notificationPromptShown()) return;

    await this.settings.markNotificationsPromptShown();

    if (this.notification.permission !== 'default') return;
  }
}
