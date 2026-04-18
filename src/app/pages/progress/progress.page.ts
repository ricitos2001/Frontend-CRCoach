import { Component, effect, OnInit, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { SnapshotsSignalStore } from '../../signal_stores/snapshots.signal.store';
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { ChartOptions } from 'chart.js';
// Replaced old specific graph components with unified GraphComponent
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    SidebarComponent,
    TranslatePipe,
    GraphComponent,
  ],
  templateUrl: './progress.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class ProgressPage implements OnInit {
  constructor(
    public snapshotsStore: SnapshotsSignalStore,
    public metricsStore: MetricsSignalStore,
    public destroyRef: DestroyRef,
    public translate: TranslateService,
  ) {
    effect(() => {
      const snaps = this.snapshotsStore.snapshots();
      if (snaps && snaps.length > 0) this.updateTrophies(snaps);
    });

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) this.updateWinrate(metric);
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

  private updateTrophies(snaps: any[]) {
    const sorted =
      snaps && snaps.length > 0
        ? [...snaps].sort(
            (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
          )
        : [];
    const labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
    const data = sorted.map((s) => s.trophies);
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

    // Preparar datos para donaciones (por snapshot)
    const donations = sorted.map((s) => s.donations ?? 0);
    this.donationsLabels = labels;
    this.donationsDatasets = [
      {
        label: this.translate.instant('PAGES.PROGRESS.DONATIONS_LABEL'),
        data: donations,
        borderColor: 'rgba(155,89,182,0.9)',
        backgroundColor: 'rgba(155,89,182,0.2)',
        tension: 0.3,
      },
    ];
    this.donationsOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: this.translate.instant('PAGES.PROGRESS.TROPHIES_TITLE') } },
        y: { title: { display: true, text: this.translate.instant('PAGES.PROGRESS.DONATIONS_LABEL') }, beginAtZero: true },
      },
    } as ChartOptions;

    // Preparar datos para comparación de batallas: total batalla por snapshot y batallas en últimas 24h
    const battleTotals = sorted.map((s) => s.battleCount ?? 0);
    const battles24h: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const tCurrent = new Date(current.capturedAt).getTime();
      let delta = 0;
      for (let j = i - 1; j >= 0; j--) {
        const tPrev = new Date(sorted[j].capturedAt).getTime();
        if (tCurrent - tPrev <= 24 * 60 * 60 * 1000) {
          delta = current.battleCount - sorted[j].battleCount;
          break;
        }
        if (tCurrent - tPrev > 24 * 60 * 60 * 1000) break;
      }
      battles24h.push(delta);
    }

    this.battlesCompLabels = labels;
    this.battlesCompDatasets = [
      {
        label: this.translate.instant('PAGES.PROGRESS.BATTLES_TOTAL_LABEL'),
        data: battleTotals,
        borderColor: 'rgba(52,152,219,0.9)',
        backgroundColor: 'rgba(52,152,219,0.2)',
        tension: 0.3,
      },
      {
        label: this.translate.instant('PAGES.PROGRESS.BATTLES_LAST24_LABEL'),
        data: battles24h,
        borderColor: 'rgba(241,196,15,0.9)',
        backgroundColor: 'rgba(241,196,15,0.2)',
        tension: 0.3,
      },
    ];
    this.battlesCompOptions = {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
    } as ChartOptions;
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
}
