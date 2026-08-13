import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { filter } from 'rxjs';
import { AppInitializerSvc } from './services/app-initializer-svc';
import { UpdatePrompt } from "./components/update-prompt/update-prompt";
import { UpdateSvc } from './services/update-svc';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    UpdatePrompt
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private readonly initializer = inject(AppInitializerSvc);
  readonly updateSvc = inject(UpdateSvc);

  protected readonly title = signal('stopwatch');
  readonly hasHeader = signal(true);

  constructor() {
    this.updHasHeader();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.updHasHeader();
    });
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
