import { Injectable } from '@angular/core';

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  silent?: boolean;
  requireInteraction?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationSvc {
  get supported(): boolean {
    return 'Notification' in window;
  }

  get permission(): NotificationPermission {
    if (!this.supported) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) return 'denied';
    return Notification.requestPermission();
  }

  show(options: NotificationOptions) {
    if (!this.supported) return null;
    if (Notification.permission !== 'granted') return null;

    return new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      silent: options.silent,
      requireInteraction: options.requireInteraction
    })
  }

  canNotify(enabled: boolean): boolean {
    return (
      this.supported && enabled && this.permission === 'granted'
    )
  }
}
