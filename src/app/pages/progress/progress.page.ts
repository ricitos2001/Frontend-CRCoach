import { Component, effect, OnInit, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
// snapshots were previously used for trophies, now trophies come from MetricsSignalStore
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { ChartOptions } from 'chart.js';
// Replaced old specific graph components with unified GraphComponent
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';

@Component({
  selector: 'app-progress',
  imports: [
    SidebarComponent,
    TranslatePipe,
    GraphComponent,
    RefreshButtonComponent,
    SearcherComponent,
  ],
  templateUrl: './progress.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class ProgressPage implements OnInit {
  constructor(
    public metricsStore: MetricsSignalStore,
    public destroyRef: DestroyRef,
    public translate: TranslateService,
  ) {
    // Ahora la gráfica de trofeos se alimenta desde MetricsSignalStore
    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) this.updateTrophies(metric);
      else {
        this.trophiesLabels = [];
        this.trophiesDatasets = [];
      }
    });

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) {
        this.updateWinrate(metric);
        this.updateDonations(metric);
        this.updateBattles(metric);
      } else {
        // Clear charts when there's no metric
        this.donationsLabels = [];
        this.donationsDatasets = [];
        this.battlesCompLabels = [];
        this.battlesCompDatasets = [];
      }
    });
  }

  public trophiesLabels: string[] = [];
  public trophiesDatasets: any[] = [];
  public trophiesOptions?: ChartOptions;
  public trophiesNoDataMessage = '';

  public winLabels: string[] = ['Victorias', 'Derrotas'];
  public winData: number[] = [];
  public winBackground: string[] = [];
  public winOptions?: ChartOptions;

  // Nuevos gráficos: donaciones y comparación de trofeos vs cambio últimas 24h
  public donationsLabels: string[] = [];
  public donationsDatasets: any[] = [];
  public donationsOptions?: ChartOptions;

  public battlesCompLabels: string[] = [];
  public battlesCompDatasets: any[] = [];
  public battlesCompOptions?: ChartOptions;

  ngOnInit(): void {
    const tag = localStorage.getItem('tag');
    if (tag) {
      this.metricsStore.loadMetrics(tag);
    }

    void this.winLabels;
    this.destroyRef.onDestroy(() => {});
  }

  private asNumber(v: any): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private normalizePercent(n?: number): number {
    if (n === undefined || isNaN(n)) return 0;
    if (n >= 0 && n <= 1) return n * 100;
    return n;
  }

  private updateTrophies(metricOrArray: any) {
    // Soportar varios formatos por compatibilidad: array de snapshots, objeto metric, o metric con history
    if (!metricOrArray) {
      this.trophiesLabels = [];
      this.trophiesDatasets = [];
      return;
    }

    let labels: string[] = [];
    let data: number[] = [];

    // Caso: arreglo (compatibilidad con snapshots)
    if (Array.isArray(metricOrArray) && metricOrArray.length > 0) {
      const sorted = [...metricOrArray].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
      data = sorted.map((s) => s.trophies);
    } else if (Array.isArray(metricOrArray)) {
      // arreglo vacío
      labels = [];
      data = [];
    } else if (metricOrArray.history && Array.isArray(metricOrArray.history)) {
      // Caso: metric.history: [{ generatedAt, trophies }, ...]
      const sorted = [...metricOrArray.history].sort(
        (a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.generatedAt).toLocaleDateString());
      data = sorted.map((s) => s.trophies);
    } else {
      // Caso: único metric -> intentar construir un pequeño historial si disponemos de changeTrophiesIn24h
      const metric = metricOrArray;
      if (metric.trophies === undefined || metric.trophies === null) {
        labels = [];
        data = [];
      } else if (metric.changeTrophiesIn24h !== undefined && metric.changeTrophiesIn24h !== null) {
        const currentDate = new Date(metric.generatedAt ?? new Date());
        const prevDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        const prev =
          (this.asNumber(metric.trophies) ?? 0) - (this.asNumber(metric.changeTrophiesIn24h) ?? 0);
        labels = [prevDate.toLocaleDateString(), currentDate.toLocaleDateString()];
        data = [prev, this.asNumber(metric.trophies) ?? 0];
      } else {
        // Solo un punto: no mostrar (seguimos la lógica previa que requiere >=2 puntos)
        labels = [];
        data = [];
      }
    }

    const hasUsefulData =
      data.length >= 2 && data.some((v, i, arr) => (i === 0 ? false : v !== arr[i - 1]));

    this.trophiesLabels = hasUsefulData ? labels : [];
    this.trophiesDatasets = hasUsefulData
      ? [
          {
            label: 'Trofeos',
            data,
            borderColor: 'rgba(52,152,219,0.9)',
            backgroundColor: 'rgba(52,152,219,0.2)',
            tension: 0.3,
          },
        ]
      : [];

    this.trophiesOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: 'Trofeos' } },
      },
    } as ChartOptions;

    this.trophiesNoDataMessage = this.translate.instant('PAGES.DASHBOARD.NO_DATA_TROPHIES');
  }

  private updateWinrate(metric: any) {
    const win7 = this.asNumber(metric.winRate?.last7Days);
    const loss7 = this.asNumber(metric.lossRate?.last7Days);

    let winsPercent: number | undefined;
    let lossesPercent: number | undefined;

    if (win7 !== undefined && loss7 !== undefined) {
      winsPercent = this.normalizePercent(win7);
      lossesPercent = this.normalizePercent(loss7);
    } else {
      const win25 = this.asNumber(metric.winRate?.last25Battles);
      const loss25 = this.asNumber(metric.lossRate?.last25Battles);
      if (win25 !== undefined) {
        winsPercent = this.normalizePercent(win25);
        lossesPercent =
          loss25 !== undefined
            ? this.normalizePercent(loss25)
            : Math.max(0, 100 - (winsPercent ?? 0));
      } else {
        const winGeneric = this.asNumber(metric.winRate);
        const lossGeneric = this.asNumber(metric.lossRate);
        winsPercent = this.normalizePercent(winGeneric);
        lossesPercent =
          lossGeneric !== undefined
            ? this.normalizePercent(lossGeneric)
            : Math.max(0, 100 - (winsPercent ?? 0));
      }
    }

    this.winData = [winsPercent ?? 0, lossesPercent ?? 0];
    this.winBackground = ['rgba(46, 204, 113, 0.9)', 'rgba(231, 76, 60, 0.9)'];
    this.winOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.label || '';
              const val = Number(context.parsed ?? context.raw ?? 0) || 0;
              return `${label}: ${val.toFixed(2)}%`;
            },
          },
        },
      },
    } as ChartOptions;
  }

  private updateDonations(metric: any) {
    const donations = this.asNumber(metric.donations) ?? 0;
    this.donationsLabels = [this.translate.instant('PAGES.PROGRESS.DONATIONS_LABEL')];
    this.donationsDatasets = [
      {
        label: this.translate.instant('PAGES.PROGRESS.DONATIONS_TITLE') || 'Donaciones',
        data: [donations],
        backgroundColor: 'rgba(46, 204, 113, 0.9)',
      },
    ];
    this.donationsOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: '' } },
        y: { title: { display: true, text: '' } },
      },
    } as ChartOptions;
  }

  private updateBattles(metric: any) {
    const total = this.asNumber(metric.battles?.total) ?? 0;
    const last24 = this.asNumber(metric.battles?.last24hr) ?? 0;

    this.battlesCompLabels = [
      this.translate.instant('PAGES.PROGRESS.BATTLES_TOTAL_LABEL'),
      this.translate.instant('PAGES.PROGRESS.BATTLES_LAST24_LABEL'),
    ];

    this.battlesCompDatasets = [
      {
        label: this.translate.instant('PAGES.PROGRESS.BATTLES_LABEL') || 'Batallas',
        data: [total, last24],
        backgroundColor: ['rgba(52,152,219,0.9)', 'rgba(241,196,15,0.9)'],
      },
    ];

    this.battlesCompOptions = {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
    } as ChartOptions;
  }
}
