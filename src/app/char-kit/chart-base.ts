import { Directive, input, signal } from "@angular/core";
import { DEFAULT_CHART_OPTIONS } from "./chart-config";

@Directive()
export abstract class ChartBase {
    readonly animate = input(DEFAULT_CHART_OPTIONS.animate);
    readonly duration = input(DEFAULT_CHART_OPTIONS.duration);
    readonly easing = input(DEFAULT_CHART_OPTIONS.easing);
    readonly colors = input(DEFAULT_CHART_OPTIONS.colors);
    readonly showLegend = input(DEFAULT_CHART_OPTIONS.showLegend);
    readonly showTooltip = input(DEFAULT_CHART_OPTIONS.showTooltip);
    readonly showGrid = input(DEFAULT_CHART_OPTIONS.showGrid);
    readonly showLabels = input(DEFAULT_CHART_OPTIONS.showLabels);
    readonly strokeWidth = input(DEFAULT_CHART_OPTIONS.strokeWidth);
    readonly padding = input(DEFAULT_CHART_OPTIONS.padding);
    readonly animationDelay = input(DEFAULT_CHART_OPTIONS.animationDelay);
}