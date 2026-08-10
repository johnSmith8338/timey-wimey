import { animate, lerp } from "./chart-animation";
import { DonutArc, SvgPoint } from "./chart-point";

export interface MorphPoint extends SvgPoint {
    currentX: number;
    currentY: number;
}

export interface MorphArc extends DonutArc {
    currentStart: number;
    currentEnd: number;
}

export function morphArray<T>(
    current: T[],
    target: T[],
    interpolate: (from: T, to: T, progress: number) => T,
    update: (value: T[]) => void,
    duration = 600
) {
    const previous = structuredClone(current.length ? current : target);

    animate(duration, progress => {
        update(
            target.map((item, index) =>
                interpolate(
                    previous[index] ?? item,
                    item,
                    progress
                )
            )
        );
    });
}

export function morphPoints(
    current: MorphPoint[],
    target: SvgPoint[],
    update: (points: MorphPoint[]) => void,
    duration = 600
) {
    morphArray(
        current,
        target.map(p => ({
            ...p,
            currentX: p.x,
            currentY: p.y
        })),
        (from, to, progress) => ({
            ...to,
            currentX: lerp(from.currentX, to.x, progress),
            currentY: lerp(from.currentY, to.y, progress)
        }),
        update,
        duration
    );
}

export function morphArcs(
    current: MorphArc[],
    target: DonutArc[],
    update: (arcs: MorphArc[]) => void,
    duration = 600
) {
    if (!target.length) {
        update([]);
        return;
    }

    if (!current.length) {
        update(target.map(arc => ({
            ...arc,
            currentStart: arc.startAngle,
            currentEnd: arc.endAngle
        })))
        return;
    }

    const previous = structuredClone(current);

    animate(duration, progress => {
        update(
            target.map((arc, index) => {
                const old = previous[index];

                return {
                    ...arc,

                    currentStart: lerp(
                        old?.currentStart ?? arc.startAngle,
                        arc.startAngle,
                        progress
                    ),

                    currentEnd: lerp(
                        old?.currentEnd ?? arc.endAngle,
                        arc.endAngle,
                        progress
                    )
                };
            })
        );
    });
}

export function morphNumber(
    from: number,
    to: number,
    update: (value: number) => void,
    duration = 500
) {
    animate(duration, p => update(Math.round(lerp(from, to, p))));
}