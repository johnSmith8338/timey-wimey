import { computed, inject, Injectable, isDevMode, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { from } from 'rxjs';

interface AppUpdateData {
  version: string;
}

type UpdateState = 'idle' | 'checking' | 'ready' | 'updating' | 'unrecoverable' | 'error';

@Injectable({
  providedIn: 'root',
})
export class UpdateSvc {
  private readonly swUpdate = inject(SwUpdate);

  private readonly UPDATE_OVERLAY_DELAY = 1200;
  private readonly UPDATE_PENDING_KEY = 'timey-wimey:update-applied';

  readonly state = signal<UpdateState>('idle');
  readonly currentVersion = signal<string | null>(null);
  readonly latestVersion = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly updateAvailable = computed(() => this.state() === 'ready');
  readonly checking = computed(() => this.state() === 'checking');
  readonly updating = computed(() => this.state() === 'updating');
  readonly unrecoverable = computed(() => this.state() === 'unrecoverable');
  readonly updateError = computed(() => this.state() === 'error');

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type !== 'VERSION_READY') return;

      const currentVersion =
        this.getVersion(event.currentVersion.appData);

      const latestVersion =
        this.getVersion(event.latestVersion.appData);

      this.currentVersion.set(currentVersion);
      this.latestVersion.set(latestVersion);
      this.state.set('ready');
    });

    this.swUpdate.unrecoverable.subscribe(event => {
      this.errorMessage.set(
        'The application could not be updated safely. Please reload the page.'
      );

      this.state.set('unrecoverable');

      this.logError(
        '[UpdateSvc] Unrecoverable service worker state:',
        event.reason
      );
    });
  }

  async check(): Promise<void> {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    if (this.state() === 'checking' ||
      this.state() === 'updating') {
      return;
    }

    this.state.set('checking');
    this.errorMessage.set(null);

    try {
      const updateFound = await this.swUpdate.checkForUpdate();

      if (!updateFound && this.state() === 'checking') {
        this.state.set('idle');
      }
    } catch (error) {
      this.state.set('error');

      this.errorMessage.set(
        'Could not check for updates. Please try again later.'
      );

      this.logError(
        '[UpdateSvc] Failed to check for update:',
        error
      );
    }
  }

  async update(): Promise<void> {
    if (!this.updateAvailable()) {
      return;
    }

    this.state.set('updating');

    localStorage.setItem(
      this.UPDATE_PENDING_KEY,
      JSON.stringify({
        from: this.currentVersion(),
        to: this.latestVersion(),
        timestamp: Date.now()
      })
    )

    await new Promise<void>(resolve => {
      setTimeout(resolve, this.UPDATE_OVERLAY_DELAY);
    });

    window.location.reload();
  }

  postpone(): void {
    if (this.updateAvailable()) {
      this.state.set('idle');
    }
  }

  consumeUpdateApplied():
    | { from: string | null; to: string | null }
    | null {
    const raw = localStorage.getItem(this.UPDATE_PENDING_KEY);

    if (!raw) {
      return null;
    }

    localStorage.removeItem(this.UPDATE_PENDING_KEY);

    try {
      const data = JSON.parse(raw);

      return {
        from: typeof data.from === 'string'
          ? data.from
          : null,

        to: typeof data.to === 'string'
          ? data.to
          : null
      };
    } catch {
      return null;
    }
  }

  private getVersion(appData: object | undefined): string | null {
    if (!appData || !('version' in appData)) return null;

    const version = appData.version;
    return typeof version === 'string' ? version : null;
  }

  private logError(...args: unknown[]): void {
    if (!isDevMode()) {
      return;
    }

    console.error(...args);
  }
}
