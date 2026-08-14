import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InstallSvc } from '../../../services/install-svc';

@Component({
  selector: 'app-set-app-install-prompt',
  imports: [],
  templateUrl: './set-app-install-prompt.html',
  styleUrl: './set-app-install-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetAppInstallPrompt {
  readonly installSvc = inject(InstallSvc);

  readonly iosInstallPrompt = signal(false);
}
