import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { SCALE_CENTER, SCALE_LABEL_RADIUS, SCALE_MINUTE_CENTER, SCALE_MINUTE_LABEL_RADIUS, SCALE_MINUTE_SIZE, SCALE_SIZE } from '../../../../constants/scale.constants';
import { buildFiveSecondLabels, buildLabels, buildTicks } from '../../../../utils/clock-face.util';
import { DialStep, TimerDialEditor } from "../../../../directives/timer-dial-editor";

export interface TimerFaceEngine {
  remainingMs: Signal<number>;
  remainingSeconds: Signal<number>;
  remainingMinutes: Signal<number>;
}

export type TimerFaceMode = 'display' | 'editor';

const RING = createRing(42);

function createRing(radius: number) {
  return {
    radius,
    circumference: 2 * Math.PI * radius
  }
}

@Component({
  selector: 'app-timer-face',
  imports: [TimerDialEditor],
  templateUrl: './timer-face.html',
  styleUrl: './timer-face.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--scale-size.px]': 'size',
    '[style.--scale-center.px]': 'center',
    '[style.--scale-label-radius.px]': 'labelRadius',
    '[style.--scale-minute-size.px]': 'minuteSize',
    '[style.--scale-minute-center.px]': 'minuteCenter',
    '[style.--scale-minute-label-radius.px]': 'minuteLabelRadius',
  }
})
export class TimerFace {
  readonly engine = input.required<TimerFaceEngine>();
  readonly mode = input<TimerFaceMode>('display');

  readonly dialStep = output<DialStep>();

  readonly size = SCALE_SIZE;
  readonly center = SCALE_CENTER;
  readonly labelRadius = SCALE_LABEL_RADIUS;

  readonly minuteSize = SCALE_MINUTE_SIZE;
  readonly minuteCenter = SCALE_MINUTE_CENTER;
  readonly minuteLabelRadius = SCALE_MINUTE_LABEL_RADIUS;

  readonly secondTicks = buildTicks(60);
  readonly minuteTicks = buildTicks(60);

  readonly secondLabels = buildLabels(
    this.center,
    this.center,
    this.labelRadius,
    buildFiveSecondLabels(0)
  )

  readonly minuteLabels = buildLabels(
    this.minuteCenter,
    this.minuteCenter,
    this.minuteLabelRadius,
    [
      { value: 0, degrees: 0 },
      { value: 15, degrees: 90 },
      { value: 30, degrees: 180 },
      { value: 45, degrees: 270 },
    ]
  )

  readonly smoothSeconds = computed(() => {
    const ms = this.engine().remainingMs();
    return (ms % 60_000) / 1000;
  })

  readonly smoothMinutes = computed(() => {
    const ms = this.engine().remainingMs();
    return (ms % 3_600_000) / 60_000;
  })

  secondProgressAngle = computed(() => this.smoothSeconds() * 6);
  minuteProgressAngle = computed(() => this.smoothMinutes() * 6);

  readonly secondDashOffset = computed(() =>
    RING.circumference * (1 - this.smoothSeconds() / 60)
  )

  readonly minuteDashOffset = computed(() =>
    RING.circumference * (1 - this.smoothMinutes() / 60)
  )

  readonly displaySeconds = computed(() =>
    String(this.engine().remainingSeconds()).padStart(2, '0')
  )

  readonly displayMinutes = computed(() =>
    String(this.engine().remainingMinutes()).padStart(2, '0')
  )

  readonly displayHours = computed(() =>
    String(Math.floor(this.engine().remainingMs() / 3_600_000)).padStart(2, '0')
  )

  dialChange(step: DialStep) {
    this.dialStep.emit(step);
  }
}
