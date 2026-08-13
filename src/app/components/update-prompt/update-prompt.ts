import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UpdateSvc } from '../../services/update-svc';

@Component({
  selector: 'app-update-prompt',
  imports: [],
  templateUrl: './update-prompt.html',
  styleUrl: './update-prompt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePrompt {
  readonly updateSvc = inject(UpdateSvc);
}
