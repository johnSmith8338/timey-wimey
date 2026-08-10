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

function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angle: number
) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

export function buildArcPath(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
): string {
    const fullCircle = Math.PI * 2;
    const sweep = endAngle - startAngle;

    // Нулевая дуга.
    // Важно явно вернуть корректный SVG path,
    // а не отдавать SVG совпадающие точки для A.
    if (sweep <= 0.00001) {
        const point = polarToCartesian(
            cx,
            cy,
            radius,
            startAngle
        );

        return `M ${point.x} ${point.y}`;
    }

    // Полный круг SVG одной A-командой нормально
    // не рисует, поэтому разбиваем его на две половины.
    if (sweep >= fullCircle - 0.0001) {
        const start = polarToCartesian(
            cx,
            cy,
            radius,
            startAngle
        );

        const middle = polarToCartesian(
            cx,
            cy,
            radius,
            startAngle + Math.PI
        );

        return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 1 1 ${middle.x} ${middle.y}
      A ${radius} ${radius} 0 1 1 ${start.x} ${start.y}
    `;
    }

    const start = polarToCartesian(
        cx,
        cy,
        radius,
        startAngle
    );

    const end = polarToCartesian(
        cx,
        cy,
        radius,
        endAngle
    );

    const largeArcFlag = sweep > Math.PI ? 1 : 0;

    return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
  `;
}