import { DestroyRef, effect, inject, Injectable, signal } from "@angular/core";
import { EventAlarmRingingFacade } from "./event-alarm-ringing.facade";
import { AlarmSvc } from "./alarm-svc";
import { EventAlarm, EventAlarmRepeat, WeekDay } from "../models/alarm.interface";

type DailyRepeat = Extract<EventAlarmRepeat, { type: 'daily' }>;
type WeeklyRepeat = Extract<EventAlarmRepeat, { type: 'weekly' }>;

@Injectable({
    providedIn: 'root'
})
export class EventAlarmScheduler {
    private readonly alarmSvc = inject(AlarmSvc);
    private readonly ringing = inject(EventAlarmRingingFacade);
    private readonly destroyRef = inject(DestroyRef);

    private readonly loaded = signal(false);

    private timeoutId: number | null = null;
    private firing = new Set<string>();

    constructor() {
        effect(() => {
            if (!this.loaded()) return;
            this.alarmSvc.events();
            this.schedule();
        })

        this.destroyRef.onDestroy(() => {
            this.clearTimeout();
        })
    }

    private events(): EventAlarm[] {
        return this.alarmSvc.events();
    }

    async load() {
        if (this.loaded()) return;

        await this.alarmSvc.load();

        this.loaded.set(true);

        await this.checkMissed();
        this.schedule();
    }

    private async fire(alarm: EventAlarm) {
        if (this.firing.has(alarm.id)) {
            return;
        }

        this.firing.add(alarm.id);

        try {
            await this.ringing.ring(alarm);

            await this.alarmSvc.updateEvent(alarm.id, {
                enabled: alarm.repeat.type !== 'once',
                lastFiredAt: Date.now()
            })
        } finally {
            this.firing.delete(alarm.id);
        }
    }

    private parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private isSameDate(a: Date, b: Date): boolean {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        )
    }

    private daysBetween(from: Date, to: Date): number {
        const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        return Math.floor(
            (end.getTime() - start.getTime()) / 86_400_000
        )
    }

    private getWeekDay(date: Date): WeekDay {
        const days: WeekDay[] = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ]

        return days[date.getDay()];
    }

    private findNextOccurrence(alarm: EventAlarm, from: Date) {
        const start = this.createDate(alarm.date, alarm.time);

        if (alarm.repeat.type === 'once') {
            return start > from ? start : null;
        }

        switch (alarm.repeat.type) {
            case "daily":
                return this.findNextDaily(alarm, from, start);
            case "weekly":
                return this.findNextWeekly(alarm, from, start);
            case "monthly":
                return this.findNextMonthly(alarm, from, start);
            case "yearly":
                return this.findNextYearly(alarm, from, start);
        }
    }

    private findNextDaily(alarm: EventAlarm, from: Date, start: Date): Date | null {
        if (from < start) return new Date(start);

        const diffDays = this.daysBetween(start, from);
        const interval = alarm.repeat.type === 'daily' ?
            alarm.repeat.interval : 1;
        const occurrence = Math.ceil(diffDays / interval);

        const next = new Date(start);
        next.setDate(next.getDate() + occurrence * interval);

        if (next <= from) next.setDate(next.getDate() + interval);

        return next;
    }

    private findNextWeekly(alarm: EventAlarm, from: Date, start: Date): Date | null {
        if (alarm.repeat.type !== 'weekly') return null;

        const selectedDays = new Set(alarm.repeat.days);
        const candidate = new Date(
            Math.max(from.getTime(), start.getTime())
        )

        candidate.setHours(
            start.getHours(),
            start.getMinutes(),
            0, 0
        );

        for (let i = 0; i < 8; i++) {
            const day = this.getWeekDay(candidate);

            if (selectedDays.has(day) && candidate >= start && candidate > from) return new Date(candidate);

            candidate.setDate(candidate.getDate() + 1);
        }

        return null;
    }

    private findNextMonthly(alarm: EventAlarm, from: Date, start: Date): Date | null {
        if (alarm.repeat.type !== 'monthly') return null;

        const candidate = new Date(
            Math.max(from.getTime(), start.getTime())
        )

        candidate.setSeconds(0, 0);
        candidate.setDate(1);

        for (let i = 0; i < 120; i++) {
            const year = candidate.getFullYear();
            const month = candidate.getMonth();
            const daysInMonth = new Date(
                year,
                month + 1,
                0
            ).getDate();

            if (alarm.repeat.day <= daysInMonth) {
                const next = new Date(
                    year,
                    month,
                    alarm.repeat.day,
                    start.getHours(),
                    start.getMinutes(),
                    0, 0
                )

                if (next >= start && next > from) return next;
            }
            candidate.setMonth(month + 1);
        }
        return null;
    }

    private findNextYearly(alarm: EventAlarm, from: Date, start: Date): Date | null {
        if (alarm.repeat.type !== 'yearly') return null;

        let year = Math.max(from.getFullYear(), start.getFullYear());

        for (let i = 0; i < 100; i++, year++) {
            const next = new Date(
                year,
                alarm.repeat.month - 1,
                alarm.repeat.day,
                start.getHours(),
                start.getMinutes(),
                0, 0
            )

            if (
                next.getFullYear() !== year ||
                next.getMonth() !== alarm.repeat.month - 1 ||
                next.getDate() !== alarm.repeat.day
            ) {
                continue;
            }

            if (next >= start && next > from) return next;
        }
        return null;
    }

    private createDate(date: string, time: string): Date {
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    private schedule() {
        this.clearTimeout();

        const now = new Date();
        const next = this.events()
            .filter(event => event.enabled)
            .map(event => ({
                event,
                occurrence: this.findNextOccurrence(event, now)
            }))
            .filter(item => item.occurrence !== null)
            .sort((a, b) => a.occurrence!.getTime() - b.occurrence!.getTime())[0]

        if (!next?.occurrence) return;

        this.scheduleTimeout(next.occurrence)
    }

    private clearTimeout() {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private scheduleTimeout(target: Date) {
        const MAX_DELAY = 2_147_483_647;
        const delay = target.getTime() - Date.now();

        if (delay <= 0) {
            void this.checkAndSchedule();
            return;
        }

        this.timeoutId = window.setTimeout(() => {
            this.timeoutId = null;
            void this.checkAndSchedule();
        }, Math.min(delay, MAX_DELAY));
    }

    private async checkAndSchedule() {
        await this.checkMissed();
        this.schedule();
    }

    private async checkMissed() {
        const now = new Date();

        for (const alarm of this.events()) {
            if (!alarm.enabled) {
                continue;
            }

            const occurrence = this.findLastOccurrence(alarm, now);

            if (!occurrence) {
                continue;
            }
            if (alarm.lastFiredAt !== null && alarm.lastFiredAt >= occurrence.getTime()) continue;

            await this.fire(alarm);
        }
    }

    private findLastOccurrence(
        alarm: EventAlarm,
        now: Date
    ): Date | null {
        const start = this.createDate(alarm.date, alarm.time);

        if (now < start) return null;

        switch (alarm.repeat.type) {
            case 'once':
                return start;
            case 'daily':
                return this.findLastDaily(alarm.repeat, now, start);
            case 'weekly':
                return this.findLastWeekly(alarm.repeat, now, start);
            case 'monthly':
                return this.findLastMonthly(alarm.repeat, now, start);
            case 'yearly':
                return this.findLastYearly(alarm.repeat, now, start);
        }
    }

    private findLastDaily(
        repeat: DailyRepeat,
        now: Date,
        start: Date
    ): Date | null {
        const diffDays = this.daysBetween(start, now);

        if (diffDays < 0) {
            return null;
        }

        const occurrenceDays = Math.floor(diffDays / repeat.interval) * repeat.interval;

        const last = new Date(start);
        last.setDate(last.getDate() + occurrenceDays);

        if (last > now) {
            last.setDate(last.getDate() - repeat.interval);
        }

        return last >= start ? last : null;
    }

    private findLastWeekly(
        repeat: WeeklyRepeat,
        now: Date,
        start: Date
    ): Date | null {
        const selectedDays = new Set(repeat.days);

        const candidate = new Date(now);

        candidate.setSeconds(0, 0);
        candidate.setHours(
            start.getHours(),
            start.getMinutes(),
            0,
            0
        );

        for (let i = 0; i < 7; i++) {
            const day = this.getWeekDay(candidate);

            if (
                selectedDays.has(day) &&
                candidate >= start &&
                candidate <= now
            ) {
                return candidate;
            }

            candidate.setDate(candidate.getDate() - 1);
        }

        return null;
    }

    private findLastMonthly(
        repeat: Extract<EventAlarmRepeat, { type: 'monthly' }>,
        now: Date,
        start: Date
    ): Date | null {
        let candidate = new Date(now);

        candidate.setDate(1);
        candidate.setHours(
            start.getHours(),
            start.getMinutes(),
            0,
            0
        );

        for (let i = 0; i < 120; i++) {
            const year = candidate.getFullYear();
            const month = candidate.getMonth();

            const daysInMonth = new Date(
                year,
                month + 1,
                0
            ).getDate();

            if (repeat.day <= daysInMonth) {
                const last = new Date(
                    year,
                    month,
                    repeat.day,
                    start.getHours(),
                    start.getMinutes(),
                    0,
                    0
                );

                if (
                    last >= start &&
                    last <= now
                ) {
                    return last;
                }
            }

            candidate.setMonth(month - 1);
        }

        return null;
    }

    private findLastYearly(
        repeat: Extract<EventAlarmRepeat, { type: 'yearly' }>,
        now: Date,
        start: Date
    ): Date | null {
        let year = now.getFullYear();

        for (let i = 0; i < 100; i++, year--) {
            const last = new Date(
                year,
                repeat.month - 1,
                repeat.day,
                start.getHours(),
                start.getMinutes(),
                0,
                0
            );

            // JS умеет превратить 31 февраля в март.
            // Поэтому обязательно проверяем, что дата не была "исправлена".
            if (
                last.getFullYear() !== year ||
                last.getMonth() !== repeat.month - 1 ||
                last.getDate() !== repeat.day
            ) {
                continue;
            }

            if (
                last >= start &&
                last <= now
            ) {
                return last;
            }
        }

        return null;
    }
}