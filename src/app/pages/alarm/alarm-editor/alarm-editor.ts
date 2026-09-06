import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlarmListFacade } from '../../../services/alarm-list.facade';
import { AlarmWorkspaceFacade } from '../../../services/alarm-workspace.facade';
import { FormsModule } from '@angular/forms';
import { AlarmRepeatEditor } from "./alarm-repeat-editor/alarm-repeat-editor";
import { AlarmTimePicker } from "./alarm-time-picker/alarm-time-picker";
import { AlarmPreview } from "./alarm-preview/alarm-preview";
import { AlarmTitleEditor } from "./alarm-title-editor/alarm-title-editor";
import { AlarmGroupPicker } from "./alarm-group-picker/alarm-group-picker";
import { AlarmSoundPicker } from "./alarm-sound-picker/alarm-sound-picker";
import { AlarmGroupView } from '../../../models/alarm.interface';
import { VibrationPicker } from "../../../components/vibration-picker/vibration-picker";

@Component({
  selector: 'app-alarm-editor',
  imports: [
    FormsModule,
    AlarmRepeatEditor,
    AlarmTimePicker,
    AlarmPreview,
    AlarmTitleEditor,
    AlarmGroupPicker,
    AlarmSoundPicker,
    VibrationPicker
  ],
  templateUrl: './alarm-editor.html',
  styleUrl: './alarm-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmEditor {
  readonly list = inject(AlarmListFacade);
  readonly workspace = inject(AlarmWorkspaceFacade);

  readonly draft = this.workspace.draft;

  readonly groups = computed(() =>
    this.list.groupViews().filter(g => !g.system));

  save() {
    void this.list.saveAlarm();
  }

  cancel() {
    this.list.cancelEditing();
  }
}
