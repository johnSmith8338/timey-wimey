import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NotificationSvc } from '../../../services/notification-svc';
import { SettingsSvc } from '../../../services/settings-svc';
import { Toggle } from "../../../components/toggle/toggle";

@Component({
  selector: 'app-set-notifications',
  imports: [Toggle],
  templateUrl: './set-notifications.html',
  styleUrl: './set-notifications.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetNotifications {
  private readonly notification = inject(NotificationSvc);
  private readonly settings = inject(SettingsSvc);

  readonly permission = signal<NotificationPermission>(this.notification.permission);

  readonly enabled = this.settings.notificationsEnabled;
  readonly supported = this.notification.supported;

  async enable() {
    const permission = await this.notification.requestPermission();
    this.permission.set(permission);

    if (permission === 'granted') await this.settings.setNotificationsEnabled(true);
    await this.settings.markNotificationsPromptShown();
  }

  async disable() {
    await this.settings.setNotificationsEnabled(false);
    await this.settings.markNotificationsPromptShown();
  }

  async toggle(value: boolean) {
    console.log('toggle event:', value);
    if (value) {
      await this.enable();
    } else {
      await this.disable();
    }
    console.log(
      'settings value:',
      this.settings.notificationsEnabled()
    );
  }

  private async finishNotificationSetup() {
    await this.settings.markNotificationsPromptShown();
  }
}
