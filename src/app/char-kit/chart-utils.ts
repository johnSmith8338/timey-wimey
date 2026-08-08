import { MorphPoint } from "./chart-morph";
import { ChartPoint, DonutArc, SvgPoint } from "./chart-point";
import { polarToCartession } from "./geometry-utils";

const FULL = Math.PI * 2;

export function minValue(points: ChartPoint[]): number {
    return Math.min(...points.map(p => p.value));
}

export function maxValue(points: ChartPoint[]): number {
    return Math.max(...points.map(p => p.value));
}

export function normalizeValues(points: ChartPoint[]): number[] {
    if (!points.length) return [];

    const min = minValue(points);
    const max = maxValue(points);

    if (min === max) return points.map(() => 0.5);

    return points.map(point => (point.value - min) / (max - min));
}

export function buildPolyline(points: MorphPoint[]): string {
    return points.map(p => `${p.currentX},${p.currentY}`).join(' ');
}

export function normalizeToPercent(points: ChartPoint[]): number[] {
    if (!points.length) return [];

    const max = maxValue(points);

    if (max === 0) return points.map(() => 0);

    return points.map(point => point.value / max * 100);
}

export function buildPoints(
    points: ChartPoint[],
    width: number,
    height: number,
    padding = 8
): SvgPoint[] {
    if (!points.length) return [];

    const normalized = normalizeValues(points);
    const step = points.length === 1 ? 0 : (width - padding * 2) / (points.length - 1);
    const result: SvgPoint[] = [];
    let accumulated = 0;

    for (let i = 0; i < points.length; i++) {
        const x = padding + i * step;
        const y = height - padding - normalized[i] * (height - padding * 2);

        if (i > 0) {
            const prev = result[i - 1];
            accumulated += Math.hypot(x - prev.x, y - prev.y);
        }

        result.push({
            ...points[i],
            x,
            y,
            length: accumulated
        })
    }

    return result;
}

export function buildArea(
    points: ChartPoint[],
    width: number,
    height: number,
    padding = 8
): string {
    const svgPoints = buildPoints(points, width, height, padding);

    if (!svgPoints.length) return '';

    const start = `${padding},${height - padding}`;
    const last = svgPoints.at(-1)!;

    return [
        start,
        ...svgPoints.map(p => `${p.x},${p.y}`),
        `${last.x},${height - padding}`
    ].join(' ');
}

export function buildAnimatedArea(
    points: MorphPoint[],
    height: number,
    padding = 8
): string {
    if (points.length) return '';

    const start = `${padding},${height - padding}`;
    const last = points.at(-1)!;

    return [
        start,
        ...points.map(p => `${p.currentX},${p.currentY}`),
        `${last.currentX},${height - padding}`
    ].join(' ')
}

// DONUT
export function buildDonut(slices: ChartPoint[]): DonutArc[] {
    if (!slices.length) return [];

    const total = slices.reduce((sum, slice) => sum + slice.value, 0);

    if (total === 0) {
        return slices.map(slice => ({
            label: slice.label,
            value: slice.value,
            percent: 0,
            startAngle: -Math.PI / 2,
            endAngle: -Math.PI / 2
        }));
    }

    let current = -Math.PI / 2;

    return slices.map(slice => {
        const percent = slice.value / total;
        const angle = FULL * percent;

        const startAngle = current;
        const endAngle = current + angle;

        current = endAngle;

        return {
            label: slice.label,
            value: slice.value,
            percent,
            startAngle,
            endAngle
        };
    });
}

export function buildArcPath(
    cx: number,
    cy: number,
    radius: number,
    start: number,
    end: number
): string {
    const p1 = polarToCartession(cx, cy, radius, start);
    const p2 = polarToCartession(cx, cy, radius, end);
    const large = end - start > Math.PI ? 1 : 0;

    return `
    M ${p1.x} ${p1.y}
    A ${radius} ${radius}
    0
    ${large}
    1
    ${p2.x}
    ${p2.y}
    `;
}