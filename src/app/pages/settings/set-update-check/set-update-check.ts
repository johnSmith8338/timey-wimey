import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppInfoSvc } from '../../../services/app-info-svc';
import { UpdateSvc } from '../../../services/update-svc';

@Component({
  selector: 'app-set-update-check',
  imports: [],
  templateUrl: './set-update-check.html',
  styleUrl: './set-update-check.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUpdateCheck {
  readonly update = inject(UpdateSvc);
  readonly appInfo = inject(AppInfoSvc);

  async checkForUpdate() {
    await this.update.check();
  }
}
