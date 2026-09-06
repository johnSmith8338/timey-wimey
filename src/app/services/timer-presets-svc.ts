import { inject, Injectable, resource, signal } from '@angular/core';
import { TimerPreset, TimerRepository } from '../core/repositories/timer.repository';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export type PresetsFilter = 'all' | 'favorite';

@Injectable({
  providedIn: 'root',
})
export class TimerPresetsSvc {
  private readonly repo = inject(TimerRepository);

  readonly filter = signal<PresetsFilter>('all');
  readonly search = signal('');
  readonly presets = resource({
    params: () => ({
      filter: this.filter(),
      search: this.search()
    }),
    loader: async ({ params }) => {
      let timers = await this.repo.getAll();

      if (params.search.trim()) {
        const text = params.search.toLowerCase();
        timers = timers.filter(x => x.title.toLowerCase().includes(text));
      }

      if (params.filter === 'favorite') {
        timers = timers.filter(x => x.favorite);
      }

      timers.sort((a, b) => {
        if (a.favorite !== b.favorite) {
          return Number(b.favorite) - Number(a.favorite);
        }
        return a.order - b.order;
      })

      return timers;
    }
  });

  async save(timer: TimerPreset) {
    timer.updatedAt = Date.now();
    await this.repo.save(timer);
    this.presets.reload();
  }

  async delete(id: string) {
    await this.repo.delete(id);
    this.presets.reload();
  }

  create(): TimerPreset {
    const now = Date.now();

    return {
      id: crypto.randomUUID(),
      title: '',
      hours: 0,
      minutes: 0,
      seconds: 0,
      color: 'transparent',
      icon: '',
      sound: 'inherit',
      vibration: 'short',
      favorite: false,
      order: now,
      createdAt: now,
      updatedAt: now
    }
  }

  async toggleFavorite(timer: TimerPreset) {
    await this.save({
      ...timer,
      favorite: !timer.favorite
    })
  }

  async reorder(event: CdkDragDrop<TimerPreset[]>) {
    const visible = [...event.container.data];
    const moved = visible[event.previousIndex];
    const group = visible.filter(x => x.favorite === moved.favorite);
    const prev = group.findIndex(x => x.id === moved.id);
    const target = visible[event.currentIndex];
    const curr = group.findIndex(x => x.id === target.id);

    if (curr === -1) return;

    moveItemInArray(group, prev, curr);

    await Promise.all(
      group.map((timer, index) =>
        this.repo.save({
          ...timer,
          order: index,
        }),
      ),
    );

    this.presets.reload();
  }
}
