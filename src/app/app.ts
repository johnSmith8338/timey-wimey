import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { filter } from 'rxjs';
import { AppInitializerSvc } from './services/app-initializer-svc';
import { UpdatePrompt } from "./components/update-prompt/update-prompt";
import { UpdateSvc } from './services/update-svc';
import { InstallPrompt } from "./components/install-prompt/install-prompt";
import { ToastSvc } from './services/toast-svc';
import { APP_VERSION } from '../app-info/version';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    UpdatePrompt,
    InstallPrompt
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private readonly initializer = inject(AppInitializerSvc);
  readonly updateSvc = inject(UpdateSvc);
  readonly toastSvc = inject(ToastSvc);

  protected readonly title = signal('stopwatch');
  readonly hasHeader = signal(true);

  constructor() {
    this.updHasHeader();

    this.showUpdateToast();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updHasHeader();
    });
  }

  private showUpdateToast() {
    const update = this.updateSvc.consumeUpdateApplied();
    if (!update) return;
    if (update.to === APP_VERSION) {
      this.toastSvc.show(
        `Application updated to ${APP_VERSION}`,
        4000
      )
      return;
    }

    this.toastSvc.show(
      'The update could not be verified. Please reload the application.',
      5000
    )
  }

  updHasHeader() {
    const url = this.currentPath();
    this.hasHeader.set(
      url !== '/welcome'
    )
  }

  private currentPath(): string {
    return this.router.url.split('?')[0]?.split('#')[0] ?? this.router.url;
  }
}
