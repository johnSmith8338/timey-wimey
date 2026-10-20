import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

export interface SheetSelectItem<T = string> {
  id: T;
  title: string;
  subtitle?: string;
  icon?: string;
}

@Component({
  selector: 'app-sheet-select',
  imports: [],
  templateUrl: './sheet-select.html',
  styleUrl: './sheet-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetSelect<T> {
  readonly title = input.required<string>();
  readonly items = input.required<SheetSelectItem<T>[]>();

  readonly selected = input.required<T>();
  readonly opened = model(false);

  readonly selectedChange = output<T>();

  readonly selectedItem = computed(() =>
    this.items().find(item => item.id === this.selected())
  );

  select(item: SheetSelectItem<T>) {
    this.selectedChange.emit(item.id);
    this.opened.set(false);
  }

  toggle() {
    this.opened.update(v => !v);
  }
}
