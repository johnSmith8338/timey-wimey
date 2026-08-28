import { Signal } from "@angular/core";

export interface AlarmFaceEngine {
    hour: Signal<number>;
    minute: Signal<number>;
}

export interface AlarmTimeEngine extends AlarmFaceEngine {
    updateHour(value: number): void;
    updateMinute(value: number): void;
}