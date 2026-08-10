import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { AlarmListFacade } from '../../../../services/alarm-list.facade';
import { Alarm, AlarmGroupView } from '../../../../models/alarm.interface';
import { AlarmCard } from "./alarm-card/alarm-card";
import { CdkDragDrop, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-alarms-group',
  imports: [AlarmCard, CdkDropList, CdkDrag],
  templateUrl: './alarms-group.html',
  styleUrl: './alarms-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmsGroup {
  readonly facade = inject(AlarmListFacade);

  readonly group = input.required<AlarmGroupView>();

  readonly editing = signal(false);

  readonly dragDisabled = computed(() => this.facade.settings.alarmSortMode() === 'time');

  startRename() {
    this.editing.set(true);
  }

  cancelRename() {
    this.editing.set(false);
  }

  async saveTitle(title: string) {
    const value = title.trim();

    if (!value) {
      this.editing.set(false);
      return;
    }

    if (value === this.group().title) {
      this.editing.set(false);
      return;
    }

    await this.facade.renameGroup(this.group(), value);
    this.editing.set(false);
  }

  drop(event: CdkDragDrop<Alarm[]>) {
    this.facade.reorderAlarm(this.group().id, event);
  }
}
