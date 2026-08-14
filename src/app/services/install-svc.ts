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

  readonly installAvailable = signal(false);
  readonly installed = signal(this.isStandalone());

  constructor() {
    window.addEventListener('beforeinstalprompt', this.onBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.onAppInstalled);
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    const prompt = this.deferredPrompt;

    this.deferredPrompt = null;
    this.installAvailable.set(false);

    await prompt.prompt();

    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      this.installed.set(true);
      return true;
    }

    return false;
  }

  postpone() {
    this.deferredPrompt = null;
    this.installAvailable.set(false);
  }

  private readonly onBeforeInstallPrompt = (event: Event): void => {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    this.installAvailable.set(true);
  }

  private readonly onAppInstalled = (): void => {
    this.deferredPrompt = null;
    this.installAvailable.set(false);
    this.installed.set(true);
  }

  private isStandalone(): boolean {
    return (
      window.matchMedia('display-mode:standalone').matches ||
      ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
    )
  }
}
