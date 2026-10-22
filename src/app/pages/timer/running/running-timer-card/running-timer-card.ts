import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal } from '@angular/core';
import { TimerInstance } from '../../../../services/timer-instance';
import { SvgIcon } from "../../../../directives/svg-icon";
import { TimerFace } from "../../timer-workspace/timer-face/timer-face";
import { SettingsSvc } from '../../../../services/settings-svc';
import { Toggle } from "../../../../components/toggle/toggle";

@Component({
  selector: 'app-running-timer-card',
  imports: [
    SvgIcon,
    TimerFace,
    Toggle
  ],
  templateUrl: './running-timer-card.html',
  styleUrl: './running-timer-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunningTimerCard implements OnInit {
  readonly settings = inject(SettingsSvc);

  readonly timer = input.required<TimerInstance>();
  readonly remove = output<TimerInstance>();

  readonly keepAwake = signal(false);

  ngOnInit(): void {
    this.keepAwake.set(this.settings.keepScreenAwake());

    this.timer().engine.setKeepScreenAwake(this.keepAwake());
  }

  toggleWakeLock() {
    const value = !this.keepAwake();
    this.keepAwake.set(value);
    this.timer().engine.setKeepScreenAwake(value);
  }

  removeTimer() {
    this.remove.emit(this.timer());
  }

  async reset() {
    await this.timer().reset();
  }
}
