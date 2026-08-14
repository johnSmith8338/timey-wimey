import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InstallSvc } from '../../services/install-svc';

@Component({
  selector: 'app-install-prompt',
  imports: [],
  templateUrl: './install-prompt.html',
  styleUrl: './install-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallPrompt {
  readonly installSvc = inject(InstallSvc);
}
