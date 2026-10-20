import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import { AlarmTimeUnit } from '../models/alarm-time-unit.type';
import { AlarmDialStep } from '../models/alarm-dial-step.interface';

@Directive({
  selector: '[alarmDialEditor]',
})
export class AlarmDialEditor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentHour = input(0);
  readonly step = output<AlarmDialStep>();

  private pointerId: number | null = null;
  private activeUnit: AlarmTimeUnit | null = null;

  private lastHourAngle = 0;
  private turns = 0;

  constructor() {
    const element = this.host.nativeElement;

    element.addEventListener('pointerdown', this.pointerDown);
    element.addEventListener('pointermove', this.pointerMove);
    element.addEventListener('pointerup', this.pointerUp);
    element.addEventListener('pointercancel', this.pointerUp);

    this.destroyRef.onDestroy(() => {
      element.removeEventListener('pointerdown', this.pointerDown);
      element.removeEventListener('pointermove', this.pointerMove);
      element.removeEventListener('pointerup', this.pointerUp);
      element.removeEventListener('pointercancel', this.pointerUp);
    })
  }

  private readonly pointerDown = (event: PointerEvent) => {
    const element = this.host.nativeElement;
    const position = this.getPosition(event);
    if (!position) return;

    const target = event.target;
    let unit: AlarmTimeUnit | null = null;

    if (target instanceof Element && target.closest('.hour-hand')) {
      unit = 'hour'
    } else if (target instanceof Element && target.closest('.minute-hand')) {
      unit = 'minute'
    } else if (position.radius >= 0.60 && position.radius <= 0.96) {
      unit = 'minute'
    } else if (position.radius >= 0.25 && position.radius < 0.56) {
      unit = 'hour'
    }

    if (!unit) return;

    this.pointerId = event.pointerId;
    this.activeUnit = unit;

    element.setPointerCapture(event.pointerId);

    if (unit === 'hour') {
      this.turns = Math.floor(this.currentHour() / 12);
      this.lastHourAngle = position.angle;
    }

    this.emitValue(position.angle);
    event.preventDefault();
  }

  private readonly pointerMove = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId || !this.activeUnit) return;

    const position = this.getPosition(event);
    if (!position) return;

    this.emitValue(position.angle);
    event.preventDefault();
  }

  private readonly pointerUp = (event: PointerEvent) => {
    if (event.pointerId !== this.pointerId) return;

    const element = this.host.nativeElement;

    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }

    this.pointerId = null;
    this.activeUnit = null;
  }

  private emitValue(angle: number) {
    if (this.activeUnit === 'minute') {
      this.step.emit({
        unit: 'minute',
        value: Math.floor(angle / 6) % 60,
      });

      return;
    }

    if (this.activeUnit !== 'hour') return;

    // При пересечении отметки 12 переключаем половину суток:
    // 23 -> 00 и 00 -> 23, 11 -> 12 и 12 -> 11.
    const angleDelta = angle - this.lastHourAngle;

    if (angleDelta < -180 || angleDelta > 180) {
      this.turns = this.turns === 0 ? 1 : 0;
    }

    this.lastHourAngle = angle;

    const dialHour = Math.floor(angle / 30) % 12;

    this.step.emit({
      unit: 'hour',
      value: dialHour + this.turns * 12,
    });
  }

  private getPosition(event: PointerEvent,): { angle: number; radius: number } | null {
    const rect = this.host.nativeElement.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const dialRadius = Math.min(rect.width, rect.height) / 2;

    if (dialRadius === 0) return null;

    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;

    if (angle < 0) angle += 360;

    return {
      angle,
      radius: Math.hypot(dx, dy) / dialRadius,
    };
  }
}
