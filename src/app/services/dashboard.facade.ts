import { computed, inject, Injectable, signal } from "@angular/core";
import { AlarmHistorySvc } from "./alarm-history-svc";
import { TimerHistorySvc } from "./timer-history-svc";
import { StopwatchHistorySvc } from "./stopwatch-history-svc";
import { getConsistencyLabel } from "../utils/stopwatch-session-stats";
import { DashboardLastActivity, DashboardStatCard } from "../models/dashboard";
import { calculateStreak } from "../utils/calculate-streak";
import { getStreakLabel } from "../utils/get-steak-label";
import { buildActivityMap, groupActivityWeeks } from "../utils/build-activity-map";
import { ChartPoint } from "../char-kit/chart-point";

@Injectable({
    providedIn: 'root'
})
export class DashboardFacade {
    private readonly alarmHistory = inject(AlarmHistorySvc);
    private readonly timerHistory = inject(TimerHistorySvc);
    private readonly stopwatchHistory = inject(StopwatchHistorySvc);

    readonly activityDate = signal(this.startOfDay(Date.now()));

    readonly alarms = computed(() => this.alarmHistory.history());
    readonly timers = computed(() => this.timerHistory.history());
    readonly stopwatchSessions = computed(() => this.stopwatchHistory.history());

    readonly totalAlarmRuns = computed(() => this.alarms().length);
    readonly totalTimerRuns = computed(() => this.timers().length);
    readonly totalStopwatchSessions = computed(() => this.stopwatchSessions().length);

    readonly alarmStats = computed(() => {
        const history = this.alarmHistory.history();

        return {
            total: history.length,
            stopped: history.filter(x => x.status === 'stop').length,
            snoozed: history.filter(x => x.status === 'snooze').length,
            missed: history.filter(x => x.status === 'missed').length,
        }
    })

    readonly timerStats = computed(() => {
        const history = this.timerHistory.history();

        return {
            total: history.length,
            finished: history.filter(x => x.status === 'finished').length,
            cancelled: history.filter(x => x.status === 'cancelled').length
        }
    })

    readonly stopwatchStats = computed(() => {
        const sessions = this.stopwatchHistory.history();
        const validSessions = sessions.filter(s => s.laps.length > 0);
        const totalSessions = sessions.length;
        const totalLaps = sessions.reduce((sum, s) => sum + s.laps.length, 0);
        const longestSession = sessions.length ? Math.max(
            ...sessions.map(s => s.duration)
        ) : 0;
        const longestLap = sessions.length ? Math.max(
            0, ...sessions.flatMap(s =>
                s.laps.map(i => i.lapTime)
            )
        ) : 0;
        const averageLaps = totalSessions ? Math.round(totalLaps / totalSessions * 10) / 10 : 0;
        const averageConsistency = validSessions.length ?
            Math.round(validSessions.reduce(
                (sum, s) => sum + s.stats.consistency, 0
            ) / validSessions.length) : 100;
        const consistencyLabel = getConsistencyLabel(averageConsistency);

        return {
            totalSessions,
            totalLaps,
            longestSession,
            longestLap,
            averageLaps,
            averageConsistency,
            consistencyLabel
        }
    })

    readonly lastActivity = computed<DashboardLastActivity | null>(() => {
        const candidates: DashboardLastActivity[] = [];

        const stopwatch = this.stopwatchHistory.history()[0];
        if (stopwatch) {
            candidates.push({
                type: 'stopwatch',
                timestamp: stopwatch.finishedAt,
                title: 'stopwatch',
                subtitle: this.format(stopwatch.duration)
            })
        }

        const timer = this.timerHistory.history()[0];
        if (timer) {
            candidates.push({
                type: 'timer',
                timestamp: timer.finishedAt,
                title: timer.snapshot.title,
                subtitle: this.format(timer.elapsedMs)
            })
        }

        const alarm = this.alarmHistory.history()[0];
        if (alarm) {
            candidates.push({
                type: 'alarm',
                timestamp: alarm.fireAt,
                title: alarm.snapshot.title,
                subtitle:
                    `${alarm.snapshot.hour.toString().padStart(2, '0')}` +
                    `${alarm.snapshot.minute.toString().padStart(2, '0')}`
            })
        }

        if (!candidates.length) return null;
        return candidates.sort((a, b) => b.timestamp - a.timestamp)[0];
    })

    readonly streak = computed(() => {
        const days: number[] = [];

        for (const session of this.stopwatchHistory.history()) {
            days.push(this.dayId(session.finishedAt));
        }
        for (const timer of this.timerHistory.history()) {
            days.push(this.dayId(timer.finishedAt));
        }
        for (const alarm of this.alarmHistory.history()) {
            days.push(this.dayId(alarm.fireAt));
        }

        return calculateStreak(days);
    })

    readonly streakLabel = computed(() => getStreakLabel(this.streak()));

    readonly activity = computed(() => {
        const timestamps: number[] = [];

        for (const alarm of this.alarmHistory.history()) timestamps.push(alarm.fireAt);
        for (const timer of this.timerHistory.history()) timestamps.push(timer.finishedAt);
        for (const session of this.stopwatchHistory.history()) timestamps.push(session.finishedAt);

        /**
         * @param 84 - how many days to show
         */
        return buildActivityMap(timestamps, 84);
    })

    readonly activityWeeks = computed(() => groupActivityWeeks(this.activity()));

    readonly favoriteTimers = computed(() => {
        return this.getTopItems(
            this.timerHistory.history().map(x => x.snapshot.title)
        )
    })

    readonly favoriteAlarms = computed(() => {
        return this.getTopItems(
            this.alarmHistory.history().map(x => x.snapshot.title)
        )
    })

    readonly activityOverTime = computed<ChartPoint[]>(() => {
        const map = new Map<number, number>();
        const add = (timestamp: number) => {
            const d = new Date(timestamp);
            d.setHours(0, 0, 0, 0);

            const key = d.getTime();
            map.set(key, (map.get(key) ?? 0) + 1);
        }

        this.alarms().forEach(a => add(a.fireAt));
        this.timers().forEach(t => add(t.finishedAt));
        this.stopwatchSessions().forEach(s => add(s.finishedAt));

        const result: ChartPoint[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);

            result.push({
                label: d.toLocaleDateString('en', { weekday: 'short' }),
                value: map.get(d.getTime()) ?? 0
            })
        }
        return result;
    })

    readonly usageDistribution = computed<ChartPoint[]>(() => [
        {
            label: 'timers',
            value: this.totalTimerRuns()
        },
        {
            label: 'alarms',
            value: this.totalAlarmRuns()
        },
        {
            label: 'stopwatch',
            value: this.totalStopwatchSessions()
        }
    ])

    readonly activityDateLabel = computed(() => {
        const date = new Date(this.activityDate());

        return new Intl.DateTimeFormat('en-En', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    })

    readonly canGoNextActivityDate = computed(() => {
        return this.activityDate() < this.startOfDay(Date.now());
    })

    readonly hourDistribution = computed<ChartPoint[]>(() => {
        const selectedDay = this.activityDate();
        const start = selectedDay;
        const end = this.addDays(selectedDay, 1);

        const buckets = Array(24).fill(0);
        const add = (time: number) => {
            if (time < start || time >= end) return;
            buckets[new Date(time).getHours()]++;
        }

        this.alarms().forEach(x => add(x.fireAt));
        this.timers().forEach(x => add(x.finishedAt));
        this.stopwatchSessions().forEach(x => add(x.finishedAt));

        return buckets.map((count, h) => ({
            label: h.toString(),
            value: count
        }));
    })

    readonly successRatioChart = computed<ChartPoint[]>(() => {
        const success =
            this.alarmStats().stopped +
            this.timerStats().finished +
            this.stopwatchStats().totalSessions;

        const failed =
            this.alarmStats().missed +
            this.timerStats().cancelled;

        return [
            {
                label: 'Success',
                value: success
            },
            {
                label: 'Failed',
                value: failed
            }
        ];
    });

    readonly successRatio = computed(() => {
        const success = this.successRatioChart()[0].value;
        const failed = this.successRatioChart()[1].value;

        const total = success + failed;

        return total ? Math.round(success / total * 100) : 100;
    });

    readonly statCards = computed<DashboardStatCard[]>(() => [
        {
            title: 'Activities',
            value: this.totalActivities(),
            subtitle: 'all time',
            icon: '📊',
            color: 'blue'
        },
        {
            title: 'Current streak',
            value: this.streak(),
            subtitle: this.streakLabel(),
            icon: '🔥',
            color: 'orange'
        },
        {
            title: 'Success',
            value: `${this.successRatio()}%`,
            icon: '🎯',
            color: 'green'
        },
        {
            title: 'Sessions',
            value: this.stopwatchStats().totalSessions,
            subtitle: `${this.stopwatchStats().totalLaps} laps`,
            icon: '⏱️',
            color: 'purple'
        }
    ]);

    readonly totalActivities = computed(() =>
        this.totalAlarmRuns() +
        this.totalTimerRuns() +
        this.totalStopwatchSessions()
    );

    format(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = hours > 0 ?
            Math.floor((totalSeconds % 3600) / 60) :
            Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        const short =
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}:` +
            `${centiseconds.toString().padStart(2, '0')}`;

        return hours ? `${hours.toString().padStart(2, '0')}:${short}` : short;
    }

    private dayId(timestamp: number): number {
        return Math.floor(timestamp / 86_400_000);
    }

    private getTopItems(items: string[], limit = 3): Array<{
        name: string;
        count: number;
        percent: number;
    }> {
        if (!items.length) return [];

        const map = new Map<string, number>();

        for (const item of items) {
            map.set(item, (map.get(item) ?? 0) + 1);
        }

        const total = items.length;

        return [...map.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, count]) => ({
                name,
                count,
                percent: Math.round(count / total * 100)
            }))
    }

    private startOfDay(timestamp: number): number {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }

    private addDays(timestamp: number, days: number) {
        const date = new Date(timestamp);
        date.setDate(date.getDate() + days);
        return date.getTime();
    }

    previousActivityDay() {
        this.activityDate.update(date =>
            this.addDays(date, -1)
        )
    }

    nextActivityDay() {
        const today = this.startOfDay(Date.now());
        this.activityDate.update(date => {
            const next = this.addDays(date, 1);
            return Math.min(next, today);
        })
    }
}