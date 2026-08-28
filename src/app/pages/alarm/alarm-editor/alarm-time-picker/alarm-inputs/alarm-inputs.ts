import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AlarmTimeEngine } from '../../../../../models/alarm-face-engine.interface';

@Component({
  selector: 'app-alarm-inputs',
  imports: [],
  templateUrl: './alarm-inputs.html',
  styleUrl: './alarm-inputs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmInputs {
  readonly engine = input.required<AlarmTimeEngine>();

  updateHour(event: Event) {
    this.engine().updateHour(
      Number((event.target as HTMLInputElement).value)
    )
  }

  updateMinute(event: Event) {
    this.engine().updateMinute(
      Number((event.target as HTMLInputElement).value)
    )
  }
}
