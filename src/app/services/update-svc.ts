import { inject, Injectable, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

interface AppUpdateData {
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateSvc {
  private readonly swUpdate = inject(SwUpdate);

  private readonly UPDATE_OVERLAY_DELAY = 1200;

  readonly updateAvailable = signal(false);
  readonly updating = signal(false);
  readonly currentVersion = signal<string | null>(null);
  readonly latestVersion = signal<string | null>(null);

  constructor() {
    console.log('[update svc works - before]')
    if (!this.swUpdate.isEnabled) {
      return;
    }
    console.log('[update svc works - after]')

    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'NO_NEW_VERSION_DETECTED') {
        const currentVersion = this.getVersion(event.version.appData);
        this.currentVersion.set(currentVersion);
        return;
      }

      if (event.type !== 'VERSION_READY') return;

      const currentVersion = this.getVersion(event.currentVersion.appData);
      const latestVersion = this.getVersion(event.latestVersion.appData);

      this.currentVersion.set(currentVersion);
      this.latestVersion.set(latestVersion);
      this.updateAvailable.set(true);
    });

    this.swUpdate.unrecoverable.subscribe(event => {
      console.error(
        '[UpdateSvc] Unrecoverable service worker state:',
        event.reason
      );
    });
  }

  async update(): Promise<void> {
    if (!this.updateAvailable()) {
      return;
    }

    this.updating.set(true);

    await new Promise<void>(resolve => {
      setTimeout(resolve, this.UPDATE_OVERLAY_DELAY);
    })

    window.location.reload();
  }

  postpone(): void {
    this.updateAvailable.set(false);
  }

  async check(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    try {
      const result = await this.swUpdate.checkForUpdate();
    } catch (error) {
      console.error(
        '[UpdateSvc] Failed to check for update:',
        error
      );
    }
  }

  private getVersion(appData: object | undefined): string | null {
    if (!appData || !('version' in appData)) return null;

    const version = appData.version;
    return typeof version === 'string' ? version : null;
  }

  private setCurrentVersion(appData: object | undefined): void {
    this.currentVersion.set(this.getVersion(appData));
  }
}
