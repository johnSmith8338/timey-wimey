import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ApplicationResetSvc } from '../../../services/application-reset-svc';
import { ConfirmDialog } from "../../../components/confirm-dialog/confirm-dialog";
import { Router } from '@angular/router';

@Component({
  selector: 'app-set-app-reset',
  imports: [ConfirmDialog],
  templateUrl: './set-app-reset.html',
  styleUrl: './set-app-reset.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetAppReset {
  private readonly router = inject(Router);
  private readonly resetSvc = inject(ApplicationResetSvc);

  readonly confirmOpen = signal(false);

  openConfirm() {
    this.confirmOpen.set(true);
  }

  closeConfirm() {
    this.confirmOpen.set(false);
  }

  async confirmReset(): Promise<void> {
    await this.resetSvc.reset();
    this.confirmOpen.set(false);
    await this.router.navigate(['/']);
  }
}
