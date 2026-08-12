import { computed, inject, Injectable, signal } from "@angular/core";
import { AlarmSvc } from "./alarm-svc";
import { AlarmWorkspaceFacade } from "./alarm-workspace.facade";
import { Alarm, AlarmGroup, AlarmGroupView } from "../models/alarm.interface";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { SettingsSvc } from "./settings-svc";
import { NotificationSvc } from "./notification-svc";

@Injectable({
    providedIn: 'root'
})
export class AlarmListFacade {
    readonly alarmSvc = inject(AlarmSvc);
    readonly workspace = inject(AlarmWorkspaceFacade);
    readonly settings = inject(SettingsSvc);
    readonly notification = inject(NotificationSvc);

    readonly editorOpened = signal(false);
    readonly deletingAlarm = signal<Alarm | null>(null);
    readonly deletingGroup = signal<AlarmGroupView | null>(null);
    readonly search = signal('');
    readonly notificationPrompt = signal(false);

    readonly groupViews = this.alarmSvc.filteredGroupViews(this.search);

    readonly alarms = computed(() => this.alarmSvc.alarms());
    readonly loading = computed(() => this.alarmSvc.loading());
    readonly groups = computed(() => this.alarmSvc.groups());

    openEditor() {
        this.editorOpened.set(true);
    }

    closeEditor() {
        this.editorOpened.set(false);
    }

    createAlarm() {
        const alarm = this.alarmSvc.createAlarm();
        this.workspace.loadAlarm(alarm);
        this.openEditor();
    }

    editAlarm(alarm: Alarm) {
        this.workspace.loadAlarm(structuredClone(alarm));
        this.openEditor();
    }

    cancelEditing() {
        this.workspace.clear();
        this.closeEditor();
    }

    async saveAlarm() {
        const alarm = this.workspace.draft.alarm();
        if (!alarm) return;

        const shouldAskForNotifications = !this.settings.notificationPromptShown();
        await this.alarmSvc.saveAlarm(alarm);
        this.workspace.clear();
        this.closeEditor();

        if (shouldAskForNotifications && this.notification.supported && this.notification.permission === 'default') {
            this.notificationPrompt.set(true);
        }
    }

    requestDeleteAlarm(alarm: Alarm) {
        this.deletingAlarm.set(alarm);
    }

    cancelDeleteAlarm() {
        this.deletingAlarm.set(null);
    }

    async confirmDeleteAlarm() {
        const alarm = this.deletingAlarm();
        if (!alarm) return;

        await this.alarmSvc.deleteAlarm(alarm.id);
        this.deletingAlarm.set(null);
    }

    async toggleAlarm(alarm: Alarm) {
        await this.alarmSvc.toggleAlarm(alarm);
    }

    async reorderAlarm(groupId: string | null, event: CdkDragDrop<Alarm[]>) {
        await this.alarmSvc.reorderAlarm(groupId, event);
    }

    async reorderAlarmInGroup(groupId: string | null, event: CdkDragDrop<Alarm[]>) {
        await this.alarmSvc.reorderAlarm(groupId, event);
    }

    async duplicateAlarm(alarm: Alarm) {
        const copy = await this.alarmSvc.duplicateAlarm(alarm);
        this.workspace.loadAlarm(copy);
        this.openEditor();
    }

    async createGroup() {
        await this.alarmSvc.createGroup();
    }

    async renameGroup(view: AlarmGroupView, title: string) {
        const group = this.alarmSvc.getGroup(view.id);
        if (!group) return;
        await this.alarmSvc.renameGroup(group, title);
    }

    requestDeleteGroup(group: AlarmGroupView) {
        return this.deletingGroup.set(group);
    }

    cancelDeleteGroup() {
        this.deletingGroup.set(null);
    }

    async confirmDeleteGroup() {
        const group = this.deletingGroup();
        if (!group) return;

        await this.alarmSvc.deleteGroup(group.id!);
        this.deletingGroup.set(null);
    }

    toggleGroup(view: AlarmGroupView) {
        const group = this.alarmSvc.getGroup(view.id);
        if (!group) return;
        return this.alarmSvc.toggleGroup(group);
    }

    async moveAlarmToGroup(alarm: Alarm, groupId: string | null) {
        await this.alarmSvc.moveAlarmToGroup(alarm, groupId);
    }

    setSearch(value: string) {
        this.search.set(value.trim().toLowerCase());
    }

    async confirmNotificationPrompt() {
        const permission = await this.notification.requestPermission();

        if (permission === 'granted') await this.settings.setNotificationsEnabled(true);

        await this.settings.markNotificationsPromptShown();
        this.notificationPrompt.set(false);
    }

    async cancelNotificationPrompt() {
        await this.settings.markNotificationsPromptShown();
        this.notificationPrompt.set(false);
    }
}