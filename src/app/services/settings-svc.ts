import { computed, inject, Injectable, signal } from '@angular/core';
import { DEFAULT_SETTINGS, SettingsRepository } from '../core/repositories/settings.repositiry';
import { AlarmAutoStopMinutes, AlarmSortMode, AppSettings, AppTheme, HistoryRetentionDays } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsSvc {
  private readonly repo = inject(SettingsRepository);

  readonly settings = signal<AppSettings>(DEFAULT_SETTINGS)

  readonly theme = computed(() => this.settings().theme);
  readonly historyRetentionDays = computed(() => this.settings().historyRetentionDays);
  readonly keepScreenAwake = computed(() => this.settings().keepScreenAwake);
  readonly alarmSortMode = computed(() => this.settings().alarmSortMode);
  readonly alarmAutoStopMinutes = computed(() => this.settings().alarmAutoStopMinutes);
  readonly firstRunCompleted = computed(() => this.settings().firstRunCompleted);
  readonly notificationsEnabled = computed(() => this.settings().notificationsEnabled);
  readonly notificationPromptShown = computed(() => this.settings().notificationPromptShown);

  async load() {
    this.settings.set(await this.repo.load());
  }

  async setTheme(theme: AppTheme) {
    const settings: AppSettings = {
      ...this.settings(),
      theme
    }

    this.settings.set(settings);
    await this.repo.save(settings);
  }

  async toggleTheme() {
    await this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  async setHistoryRetentionDays(days: HistoryRetentionDays) {
    const settings: AppSettings = {
      ...this.settings(),
      historyRetentionDays: days
    }

    this.settings.set(settings);
    await this.repo.save(settings);
  }

  async setKeepScreenAwake(value: boolean) {
    this.settings.update(s => ({
      ...s,
      keepScreenAwake: value
    }))
    await this.repo.save(this.settings());
  }

  async setAlarmSortMode(mode: AlarmSortMode) {
    this.settings.update(s => ({
      ...s,
      alarmSortMode: mode
    }))
    await this.repo.save(this.settings());
  }

  async setAlarmAutoStopMinutes(minutes: AlarmAutoStopMinutes) {
    this.settings.update(s => ({
      ...s,
      alarmAutoStopMinutes: minutes
    }))
    await this.repo.save(this.settings());
  }

  async finishFirstRun() {
    this.settings.update(s => ({
      ...s,
      firstRunCompleted: true
    }))
    await this.repo.save(this.settings());
  }

  async setNotificationsEnabled(value: boolean) {
    this.settings.update(s => ({
      ...s,
      notificationsEnabled: value
    }))
    await this.repo.save(this.settings());
  }

  async markNotificationsPromptShown() {
    this.settings.update(s => ({
      ...s,
      notificationPromptShown: true
    }))
    await this.repo.save(this.settings());
  }

  async reset(): Promise<void> {
    const settings = structuredClone(DEFAULT_SETTINGS);
    this.settings.set(settings);
    await this.repo.save(settings);
  }

  async restore(settings: AppSettings) {
    this.settings.set(structuredClone(settings));
    await this.repo.save(this.settings());
  }
}
