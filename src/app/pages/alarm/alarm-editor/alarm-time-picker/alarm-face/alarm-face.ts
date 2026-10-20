import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AlarmFaceEngine } from '../../../../../models/alarm-face-engine.interface';
import { AlarmDialStep } from '../../../../../models/alarm-dial-step.interface';
import { SCALE_CENTER, SCALE_LABEL_RADIUS, SCALE_SIZE } from '../../../../../constants/scale.constants';
import { buildLabels, buildTicks } from '../../../../../utils/clock-face.util';
import { AlarmDialEditor } from "../../../../../directives/alarm-dial-editor";
import { AlarmTimeFormat } from '../../../../../models/settings.model';

@Component({
  selector: 'app-alarm-face',
  imports: [AlarmDialEditor],
  templateUrl: './alarm-face.html',
  styleUrl: './alarm-face.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--scale-size.px]': 'size',
    '[style.--scale-center.px]': 'center'
  }
})
export class AlarmFace {
  readonly engine = input.required<AlarmFaceEngine>();
  readonly timeFormat = input.required<AlarmTimeFormat>();
  readonly dialStep = output<AlarmDialStep>();
  readonly meridiemToggle = output();

  readonly size = SCALE_SIZE;
  readonly center = SCALE_CENTER;
  readonly radius = SCALE_LABEL_RADIUS;

  readonly ticks = buildTicks(60);

  readonly minuteLabels = buildLabels(
    this.center,
    this.center,
    this.radius * 0.79,
    [
      { value: 0, degrees: 0 },
      { value: 5, degrees: 30 },
      { value: 10, degrees: 60 },
      { value: 15, degrees: 90 },
      { value: 20, degrees: 120 },
      { value: 25, degrees: 150 },
      { value: 30, degrees: 180 },
      { value: 35, degrees: 210 },
      { value: 40, degrees: 240 },
      { value: 45, degrees: 270 },
      { value: 50, degrees: 300 },
      { value: 55, degrees: 330 }
    ]
  )

  readonly hourLabels = computed(() => {
    const hour = this.engine().hour();
    const format = this.timeFormat();

    const firstHour = format === '12h' ? 12 : Math.floor(hour / 12) * 12;

    const labels = Array.from({ length: 12 }, (_, index) => ({
      value: format === '12h' ? (index === 0 ? 12 : index) : firstHour + index,
      degrees: index * 30
    }))

    return buildLabels(
      this.center,
      this.center,
      this.radius * 0.43,
      labels
    )
  })

  readonly hourAngle = computed(() => (this.engine().hour() % 12) * 30);
  readonly minuteAngle = computed(() => this.engine().minute() * 6);

  readonly displayHours = computed(() => {
    const hour = this.engine().hour();

    if (this.timeFormat() === '24h') {
      return hour.toString().padStart(2, '0');
    }

    return (hour % 12 || 12).toString();
  })

  readonly displayMinutes = computed(() =>
    String(this.engine().minute()).padStart(2, '0')
  )

  readonly meridiem = computed(() => this.engine().hour() < 12 ? 'AM' : 'PM');
}
