import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartDataset, ChartOptions } from 'chart.js';
import { ThemeService } from '../../../services/theme/theme.service';

@Component({
  selector: 'app-graph',
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class GraphComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() type: 'line' | 'bar' | 'doughnut' | 'pie' = 'line';
  @Input() labels: string[] = [];
  @Input() datasets: ChartDataset[] = [];
  @Input() data: number[] = [];
  @Input() backgroundColor: string[] = [];
  @Input() options?: ChartOptions;
  @Input() width = 400;
  @Input() height = 200;
  @Input() noDataMessage = 'No data';

  @ViewChild('canvas', { static: false }) private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private themeService = inject(ThemeService);

  constructor() {}

  ngAfterViewInit(): void {
    this.themeService.isDark$.subscribe(() => {
      if (this.chart) this.applyThemeToChart();
    });
    this.createOrUpdateChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.chart) {
      const chartDatasets = this.buildDatasets();
      this.chart.data.labels = this.labels as any;
      this.chart.data.datasets = chartDatasets as any;
      this.chart.options = this.getMergedOptions() as any;
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  private buildDatasets(): ChartDataset[] {
    if (this.type === 'doughnut' || this.type === 'pie') {
      return [
        {
          data: this.data ?? [],
          backgroundColor: this.backgroundColor ?? [],
        } as any,
      ];
    }
    return this.datasets ?? [];
  }

  private getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  private getThemeDefaults(): any {
    const textColor = this.getCSSVar('--elements-color') || '#FFFFFF';
    const fontFamily = this.getCSSVar('--font-primary') || 'system-ui, -apple-system, sans-serif';
    const gridColor = this.getCSSVar('--second-background-color') || 'rgba(255,255,255,0.1)';
    const tooltipBg = this.getCSSVar('--components-color') || '#184262';
    const isCartesian = this.type === 'line' || this.type === 'bar';

    const defaults: any = {
      responsive: true,
      color: textColor,
      font: { family: fontFamily },
      plugins: {
        legend: {
          labels: { color: textColor, font: { family: fontFamily } },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: textColor,
          bodyColor: textColor,
          titleFont: { family: fontFamily },
          bodyFont: { family: fontFamily },
          padding: 10,
          cornerRadius: 6,
        },
      },
    };

    if (isCartesian) {
      const borderColor = 'rgba(255,255,255,0.08)';
      defaults.scales = {
        x: {
          ticks: { color: textColor, font: { family: fontFamily } },
          grid: { color: gridColor },
          title: { color: textColor, font: { family: fontFamily } },
          border: { color: borderColor },
        },
        y: {
          ticks: { color: textColor, font: { family: fontFamily } },
          grid: { color: gridColor },
          title: { color: textColor, font: { family: fontFamily } },
          border: { color: borderColor },
        },
      };
    }

    return defaults;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] instanceof Object &&
        target[key] instanceof Object &&
        !Array.isArray(source[key])
      ) {
        output[key] = this.deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  private getMergedOptions(): any {
    const defaults = this.getThemeDefaults();
    if (!this.options) return defaults;
    return this.deepMerge(defaults, this.options);
  }

  private applyThemeToChart() {
    if (!this.chart) return;
    const merged = this.getMergedOptions();
    Object.assign(this.chart.options, merged);
    this.chart.update();
  }

  private createOrUpdateChart() {
    if (!this.canvasRef?.nativeElement) return;

    const textColor = this.getCSSVar('--elements-color');
    const fontFamily = this.getCSSVar('--font-primary');

    const valenoDataPlugin = {
      id: 'noDataPlugin',
      beforeDraw: (chart: any) => {
        const datasets = chart.data && chart.data.datasets ? chart.data.datasets : [];
        const hasDataLocal =
          Array.isArray(datasets) &&
          datasets.some((ds: any) => {
            const d = ds.data || [];
            return Array.isArray(d) && d.some((n: any) => typeof n === 'number');
          });
        if (hasDataLocal) return;
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.6;
        const fontSize = Math.max(12, Math.floor(Math.min(width, height) / 25));
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillText(this.noDataMessage, width / 2, height / 2);
        ctx.restore();
      },
    };

    const config = {
      type: (this.type || 'line') as any,
      data: { labels: this.labels, datasets: this.buildDatasets() },
      options: this.getMergedOptions(),
    };

    Chart.register(...registerables);

    if (this.chart) {
      this.chart.data.labels = config.data.labels as any;
      this.chart.data.datasets = config.data.datasets as any;
      this.chart.options = config.options as any;
      this.chart.update();
    } else {
      const ctx = this.canvasRef.nativeElement.getContext('2d');
      if (!ctx) return;
      this.chart = new Chart(ctx, config as any);
    }
  }
}
