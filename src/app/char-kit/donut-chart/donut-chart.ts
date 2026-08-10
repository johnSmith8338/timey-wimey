import { ChangeDetectionStrategy, Component, computed, effect, input, signal, untracked } from '@angular/core';
import { ChartPoint, DonutArc } from '../chart-point';
import { buildArcPath, buildDonut } from '../chart-utils';
import { animate, lerp } from '../chart-animation';
import { PercentPipe } from '@angular/common';
import { MorphArc, morphArcs, morphNumber } from '../chart-morph';
import { DEFAULT_COLORS } from '../chart-config';
import { ChartBase } from '../chart-base';

@Component({
  selector: 'app-donut-chart',
  imports: [PercentPipe],
  templateUrl: './donut-chart.html',
  styleUrl: './donut-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChart extends ChartBase {
  readonly slices = input.required<ChartPoint[]>();
  readonly size = input(180);
  readonly stroke = input(18);

  private hoverJob = 0;
  private currentAnimatedValue = 0;

  readonly renderArcs = signal<MorphArc[]>([]);
  readonly visibleCount = signal(0);
  readonly animatedTotal = signal(0);
  readonly totalScale = signal(1);
  readonly hovered = signal<string | null>(null);
  readonly hoverProgress = signal(0);
  protected readonly initialized = signal(false);

  readonly viewBox = computed(() => {
    const p = this.padding();
    const s = this.size();

    return `${-p} ${-p} ${s + p * 2} ${s + p * 2}`;
  });

  readonly radius = computed(() => (this.size() - this.stroke()) / 2);

  readonly arcs = computed(() => buildDonut(this.slices()));

  readonly selectedArc = computed(() => {
    const id = this.hovered();
    if (!id) return null;

    return this.arcs().find(a => a.label === id) ?? null;
  })

  readonly centerValue = computed(() => {
    const selected = this.selectedArc();
    return selected ? selected.value : this.slices().reduce((a, b) => a + b.value, 0);
  })

  readonly centerLabel = computed(() => {
    const selected = this.selectedArc();
    return selected ? selected.label : 'total'
  })

  constructor() {
    super();

    /**
     * Donut geometry.
     *
     * First render:
     *   start = end
     *   => every arc has zero length.
     *
     * After the browser has painted that state:
     *   initialized = true
     *   => morph from zero-length arcs to real arcs.
     */
    effect(() => {
      const arcs = this.arcs();

      if (!arcs.length) {
        this.renderArcs.set([]);
        this.visibleCount.set(0);

        this.currentAnimatedValue = 0;
        this.animatedTotal.set(0);

        return;
      }

      if (!this.initialized()) {
        // Initial visual state: all arcs have zero length.
        this.renderArcs.set(
          this.toZeroMorphArcs(arcs)
        );

        // Elements already exist in the DOM.
        this.visibleCount.set(arcs.length);

        // Center starts from zero too.
        this.currentAnimatedValue = 0;
        this.animatedTotal.set(0);

        this.totalScale.set(1);

        /**
         * One RAF waits for the current rendering cycle.
         * The second RAF guarantees that the zero-state has
         * actually made it through a browser paint opportunity.
         */
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.initialized.set(true);
          });
        });

        return;
      }

      // Normal subsequent updates.
      morphArcs(
        this.renderArcs(),
        arcs,
        next => this.renderArcs.set(next),
        this.duration()
      );
    });

    /**
     * Center number animation.
     *
     * On first render the number stays at 0.
     * After initialization it morphs to the real total.
     */
    effect(() => {
      const value = this.centerValue();

      if (!this.initialized()) {
        return;
      }

      morphNumber(
        this.currentAnimatedValue,
        value,
        nextValue => {
          this.currentAnimatedValue = nextValue;

          untracked(() => {
            this.animatedTotal.set(nextValue);
          });
        },
        this.duration()
      );
    });

    /**
     * Center number "pop" animation when selected value changes.
     */
    effect(() => {
      this.centerValue();

      if (!this.initialized()) {
        return;
      }

      this.totalScale.set(1.08);

      setTimeout(() => {
        this.totalScale.set(1);
      }, 150);
    });
  }

  private toZeroMorphArcs(arcs: DonutArc[]): MorphArc[] {
    return arcs.map(arc => ({
      ...arc,
      currentStart: arc.startAngle,
      currentEnd: arc.startAngle
    }));
  }

  private toMorphArcs(arcs: DonutArc[]): MorphArc[] {
    return arcs.map(arc => ({
      ...arc,
      currentStart: arc.startAngle,
      currentEnd: arc.endAngle
    }));
  }

  buildPath(arc: MorphArc) {
    return buildArcPath(
      this.size() / 2,
      this.size() / 2,
      this.radius(),
      arc.currentStart,
      arc.currentEnd
    )
  }

  buildTransform(arc: MorphArc) {
    if (this.hovered() !== arc.label) return '';
    const offset = this.hoverProgress() * 8;
    const middle = (arc.currentStart + arc.currentEnd) / 2;

    return `
    translate(
      ${Math.cos(middle) * offset}
      ${Math.sin(middle) * offset}
    )
  `;
  }

  hoverEnter(id: string) {
    this.hovered.set(id);
    const job = ++this.hoverJob;

    animate(this.duration() / 2, progress => {
      if (job !== this.hoverJob) return;
      this.hoverProgress.set(progress);
    })
  }

  hoverLeave() {
    const job = ++this.hoverJob;

    animate(200, progress => {
      if (job !== this.hoverJob) return;
      this.hoverProgress.set(1 - progress);
    }, () => {
      if (job !== this.hoverJob) return;
      this.hovered.set(null);
    })
  }
}
