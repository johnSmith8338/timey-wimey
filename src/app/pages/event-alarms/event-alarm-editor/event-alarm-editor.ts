import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventAlarmEditorFacade } from '../../../services/event-alarm-editor.facade';
import { SoundSvc, TimerSound } from '../../../services/sound-svc';
import { EventAlarmRepeat, WeekDay } from '../../../models/alarm.interface';
import { AlarmTimePicker } from "../../alarm/alarm-editor/alarm-time-picker/alarm-time-picker";
import { DatePicker } from "../../../components/date-picker/date-picker";
import { VibrationMode, VibrationSetting } from '../../../models/settings.model';
import { VibrationPicker } from "../../../components/vibration-picker/vibration-picker";

@Component({
  selector: 'app-event-alarm-editor',
  imports: [AlarmTimePicker, DatePicker, VibrationPicker],
  templateUrl: './event-alarm-editor.html',
  styleUrl: './event-alarm-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAlarmEditor {
  readonly facade = inject(EventAlarmEditorFacade);
  private sound = inject(SoundSvc);

  readonly weekdays: WeekDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  readonly repeatTypes = [
    { value: 'once', title: 'once' },
    { value: 'daily', title: 'daily' },
    { value: 'weekly', title: 'weekly' },
    { value: 'monthly', title: 'monthly' },
    { value: 'yearly', title: 'yearly' }
  ] as const;

  readonly sounds: { value: TimerSound; title: string }[] = [
    { value: 'none', title: 'none' },
    { value: 'ding', title: 'ding' },
    { value: 'alarm', title: 'alarm' },
  ]

  onRepeatTypeChange(type: EventAlarmRepeat['type']) {
    switch (type) {
      case 'once':
        this.facade.setRepeat({
          type: 'once'
        });
        break;
      case 'daily':
        this.facade.setRepeat({
          type: 'daily',
          interval: 1
        });
        break;
      case 'weekly':
        this.facade.setRepeat({
          type: 'weekly',
          days: []
        });
        break;
      case 'monthly':
        this.facade.setRepeat({
          type: 'monthly',
          day: 1
        });
        break;
      case 'yearly':
        this.facade.setRepeat({
          type: 'yearly',
          month: 1,
          day: 1
        });
        break;
    }
  }

  onDailyIntervalChange(value: string) {
    const interval = Math.max(1, Number(value) || 1);
    this.facade.setRepeat({
      type: 'daily',
      interval
    })
  }

  isWeekDaySelected(day: WeekDay): boolean {
    const repeat = this.facade.repeat();
    return repeat.type === 'weekly' && repeat.days.includes(day);
  }

  toggleWeekDay(day: WeekDay) {
    const repeat = this.facade.repeat();

    if (repeat.type !== 'weekly') return;

    const days = repeat.days.includes(day) ?
      repeat.days.filter(x => x !== day) :
      [...repeat.days, day];

    this.facade.setRepeat({
      type: 'weekly',
      days
    })
  }

  onMonthlyDayChange(value: string) {
    const day = Math.min(31, Math.max(1, Number(value) || 1));
    this.facade.setRepeat({
      type: 'monthly',
      day
    })
  }

  onYearlyMonthChange(value: string) {
    const month = Math.min(12, Math.max(1, Number(value) || 1));
    const repeat = this.facade.repeat();

    if (repeat.type !== 'yearly') return;

    this.facade.setRepeat({
      ...repeat,
      month
    })
  }

  onYearlyDayChange(value: string) {
    const day = Math.min(31, Math.max(1, Number(value) || 1));
    const repeat = this.facade.repeat();

    if (repeat.type !== 'yearly') return;

    this.facade.setRepeat({
      ...repeat,
      day
    })
  }

  onSoundchange(sound: TimerSound) {
    this.facade.setSound(sound);
  }

  previewSound(sound: TimerSound) {
    this.sound.preview(sound);
  }
}
