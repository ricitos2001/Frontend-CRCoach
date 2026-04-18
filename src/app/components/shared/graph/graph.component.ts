import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartDataset, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrl: '../../../../styles/styles.css',
})
export class GraphComponent implements AfterViewInit, OnChanges {
  @Input() type: 'line' | 'bar' | 'doughnut' | 'pie' = 'line';
  @Input() labels: string[] = [];
  @Input() datasets: ChartDataset[] = [];
  // for circular charts
  @Input() data: number[] = [];
  @Input() backgroundColor: string[] = [];
  @Input() options?: ChartOptions;
  @Input() width = 400;
  @Input() height = 200;
  @Input() noDataMessage = 'No data';

  @ViewChild('canvas', { static: true }) private canvasRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  constructor(private destroyRef: DestroyRef) {}

  ngAfterViewInit(): void {
    this.createOrUpdateChart();
    this.destroyRef.onDestroy(() => {
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.chart) {
      // rebuild datasets for chart types
      const chartDatasets = this.buildDatasets();
      this.chart.data.labels = this.labels as any;
      this.chart.data.datasets = chartDatasets as any;
      if (this.options) this.chart.options = this.options as any;
      this.chart.update();
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

  private createOrUpdateChart() {
    if (!this.canvasRef?.nativeElement) return;

    const noDataPlugin = {
      id: 'noDataPlugin',
      beforeDraw: (chart: any) => {
        const datasets = chart.data && chart.data.datasets ? chart.data.datasets : [];
        const hasDataLocal = Array.isArray(datasets) && datasets.some((ds: any) => {
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
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const fontSize = Math.max(12, Math.floor(Math.min(width, height) / 25));
        ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial`;
        ctx.fillText(this.noDataMessage, width / 2, height / 2);
        ctx.restore();
      },
    };

    const config = {
      type: (this.type || 'line') as any,
      data: { labels: this.labels, datasets: this.buildDatasets() },
      options: this.options,
      plugins: [noDataPlugin],
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

