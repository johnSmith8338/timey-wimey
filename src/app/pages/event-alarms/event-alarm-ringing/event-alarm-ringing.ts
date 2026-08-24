import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventAlarmRingingFacade } from '../../../services/event-alarm-ringing.facade';

@Component({
  selector: 'app-event-alarm-ringing',
  imports: [],
  templateUrl: './event-alarm-ringing.html',
  styleUrl: './event-alarm-ringing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAlarmRinging {
  readonly facade = inject(EventAlarmRingingFacade);

  async stop() {
    await this.facade.stop();
  }
}
