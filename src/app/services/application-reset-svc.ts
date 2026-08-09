import { inject, Injectable } from '@angular/core';
import { AlarmHistorySvc } from './alarm-history-svc';
import { TimerHistorySvc } from './timer-history-svc';
import { StopwatchHistorySvc } from './stopwatch-history-svc';
import { SettingsSvc } from './settings-svc';
import { AlarmRepository } from '../core/repositories/alarm.repository';
import { TimerRepository } from '../core/repositories/timer.repository';

@Injectable({
  providedIn: 'root',
})
export class ApplicationResetSvc {
  private readonly alarmRepo = inject(AlarmRepository);
  private readonly timerRepo = inject(TimerRepository);

  private readonly alarmHistory = inject(AlarmHistorySvc);
  private readonly timerHistory = inject(TimerHistorySvc);
  private readonly stopwatchHistory = inject(StopwatchHistorySvc);
  private readonly settings = inject(SettingsSvc);

  async reset(): Promise<void> {
    await Promise.all([
      this.alarmRepo.clear(),
      this.timerRepo.clear(),

      this.alarmHistory.clear(),
      this.timerHistory.clear(),
      this.stopwatchHistory.clear()
    ])

    await this.settings.reset();
  }
}
