import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InstallSvc } from '../../services/install-svc';

@Component({
  selector: 'app-ios-install-prompt',
  imports: [],
  templateUrl: './ios-install-prompt.html',
  styleUrl: './ios-install-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IosInstallPrompt {
  readonly installSvc = inject(InstallSvc);

  readonly opened = signal(false);

  open() {
    this.opened.set(true);
  }

  close() {
    this.opened.set(false);
  }
}
