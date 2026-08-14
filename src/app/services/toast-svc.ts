import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastSvc {
  readonly message = signal<string | null>(null);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(message: string, duration = 3000): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.message.set(message);

    this.timeoutId = setTimeout(() => {
      this.message.set(null);
      this.timeoutId = null;
    }, duration);
  }

  hide() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.message.set(null);
  }
}
