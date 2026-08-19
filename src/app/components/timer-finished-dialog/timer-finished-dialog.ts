import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TimerInstance } from '../../services/timer-instance';

@Component({
  selector: 'app-timer-finished-dialog',
  imports: [DecimalPipe],
  templateUrl: './timer-finished-dialog.html',
  styleUrl: './timer-finished-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerFinishedDialog {
  readonly timer = input.required<TimerInstance>();
  readonly stop = output();
  readonly repeat = output();
}
