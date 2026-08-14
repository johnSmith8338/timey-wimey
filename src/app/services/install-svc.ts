import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>
}

@Injectable({
  providedIn: 'root',
})
export class InstallSvc {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly INSTALL_POSTPONED_KEY = 'timey-wimey:install-postponed';
  private readonly INSTALL_POSTPONE_DAYS = 30;

  readonly installAvailable = signal(false);
  readonly installPromptVisible = signal(false);
  readonly installed = signal(this.isStandalone());

  constructor() {
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.onAppInstalled);
  }

  async install(): Promise<boolean> {
    const prompt = this.deferredPrompt;
    if (!prompt) {
      return false
    };

    this.deferredPrompt = null;
    this.installAvailable.set(false);
    this.installPromptVisible.set(false);

    await prompt.prompt();

    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      this.installed.set(true);
      localStorage.removeItem(this.INSTALL_POSTPONED_KEY);
      return true;
    };

    this.postponeInstall();
    return false;
  }

  postpone() {
    this.postponeInstall();
  }

  showInstallPrompt(): void {
    if (!this.installAvailable() || this.installed()) return;
    this.installPromptVisible.set(true);
  }

  private readonly onBeforeInstallPrompt = (event: Event): void => {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    this.installAvailable.set(true);
    if (!this.isInstallPostponed()) {
      this.installPromptVisible.set(true);
    }
  }

  private readonly onAppInstalled = (): void => {
    this.deferredPrompt = null;
    this.installAvailable.set(false);
    this.installPromptVisible.set(false);
    this.installed.set(true);
    localStorage.removeItem(this.INSTALL_POSTPONED_KEY);
  }

  private isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode:standalone)').matches ||
      ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
    )
  }

  private isInstallPostponed(): boolean {
    const value = localStorage.getItem(this.INSTALL_POSTPONED_KEY);

    if (!value) {
      return false;
    }

    const postponedAt = Number(value);

    if (!Number.isFinite(postponedAt)) {
      localStorage.removeItem(this.INSTALL_POSTPONED_KEY);
      return false;
    }

    const month = this.INSTALL_POSTPONE_DAYS * 24 * 60 * 60 * 1000;

    if (Date.now() - postponedAt >= month) {
      localStorage.removeItem(this.INSTALL_POSTPONED_KEY);
      return false;
    }

    return true;
  }

  private postponeInstall(): void {
    localStorage.setItem(
      this.INSTALL_POSTPONED_KEY,
      String(Date.now())
    );

    this.installPromptVisible.set(false);
  }
}
