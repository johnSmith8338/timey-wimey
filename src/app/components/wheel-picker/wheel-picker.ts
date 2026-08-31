import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { WHEEL_HEIGHT, WHEEL_ITEM_HEIGHT } from '../../constants/wheel-picker.constants';

@Component({
  selector: 'app-wheel-picker',
  imports: [],
  templateUrl: './wheel-picker.html',
  styleUrl: './wheel-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--item-height.px]': 'itemHeight',
    '[style.--wheel-height.px]': 'wheelHeight',
  }
})
export class WheelPicker {
  readonly items = input.required<number[]>();
  readonly value = input.required<number>();
  readonly valueChange = output<number>();
  readonly name = input('');
  readonly disabled = input(false);
  readonly formatItem = input<(item: number) => string>(
    item => item.toString().padStart(2, '0')
  );

  readonly wheelRef = viewChild<ElementRef<HTMLDivElement>>('wheel');

  readonly wheelHeight = WHEEL_HEIGHT;
  readonly itemHeight = WHEEL_ITEM_HEIGHT;
  private scrollTimer?: number;

  readonly centerIndex = signal(0);
  readonly scrolling = signal(false);

  readonly displayItems = computed(() => {
    const items = this.items();

    return [...items, ...items, ...items];
  })

  constructor() {
    afterNextRender(() => {
      this.scrollToValue(this.value());
    });

    effect(() => {
      this.scrollToValue(this.value());
    })
  }

  private scrollToValue(value: number) {
    const wheel = this.wheelRef()?.nativeElement;
    if (!wheel) return;

    const baseIndex = this.items().indexOf(this.value());
    if (baseIndex < 0) return;

    const middleIndex = baseIndex + this.items().length;
    wheel.scrollTop = middleIndex * this.itemHeight;
  }

  onScroll() {
    if (this.disabled()) return;

    this.scrolling.set(true);
    window.clearTimeout(this.scrollTimer);
    this.scrollTimer = window.setTimeout(() => {
      this.snapToNearest();
      this.scrolling.set(false);
    }, 100)
  }

  private snapToNearest() {
    const wheel = this.wheelRef()?.nativeElement;
    if (!wheel) return;

    const itemCount = this.items().length;
    let index = Math.round(wheel.scrollTop / this.itemHeight);
    wheel.scrollTop = index * this.itemHeight;
    this.centerIndex.set(index);

    if (index < itemCount / 2) {
      wheel.scrollTop += itemCount * this.itemHeight;
      index += itemCount;
    }
    if (index > itemCount * 2.5) {
      wheel.scrollTop = itemCount * this.itemHeight;
      index -= itemCount;
    }

    const realIndex = index % itemCount;
    const value = this.items()[realIndex];
    if (value !== undefined) this.valueChange.emit(value);
  }

  getItemClass(index: number): string {
    const diff = index - this.centerIndex();

    if (diff === 0) return 'center';
    if (diff === -1) return 'near-top';
    if (diff === 1) return 'near-bottom';
    if (diff === -2) return 'far-top';
    if (diff === 2) return 'far-bottom';

    return 'hidden';
  }
}
