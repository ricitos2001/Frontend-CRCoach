import { Component, effect, OnInit, AfterViewInit, OnDestroy, ElementRef, inject, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { ChartOptions } from 'chart.js';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { GraphComponent } from '../../components/shared/graph/graph.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SnapshotsSignalStore } from '../../signal_stores/snapshots.signal.store';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { CascadeAnimator } from '../../utils/cascade-animation';

@Component({
  selector: 'app-progress',
  imports: [SidebarComponent, TranslatePipe, GraphComponent, RefreshButtonComponent, DecimalPipe],
  templateUrl: './progress.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class ProgressPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private animator?: CascadeAnimator;
  constructor(
    public metricsStore: MetricsSignalStore,
    public snapshotsStore: SnapshotsSignalStore,
    public destroyRef: DestroyRef,
    public translate: TranslateService,
    public battlesStore: BattlesSignalStore,
  ) {

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) {
        this.updateTrophies(metric);
        this.updateWinrate(metric);
      } else {
        this.trophiesLabels = [];
        this.trophiesDatasets = [];
        this.donationsLabels = [];
        this.donationsDatasets = [];
        this.battlesCompLabels = [];
        this.battlesCompDatasets = [];
      }
    });

    effect(() => {
      const _snaps = this.snapshotsStore.snapshots();
      const metric = this.metricsStore.metric();
      if (metric) {
        this.updateDonations(metric);
        this.updateBattles(metric);
      }
    });

    effect(() => {
      const battles = this.battlesStore.battles();
      const metric = this.metricsStore.metric();

      // Priorizar batallas (si existen)
      if (Array.isArray(battles) && battles.length > 0) {
        const slice = battles.slice(0, 12);
        const pills = slice.map((b: any) => {
          // Preferir trophyChange si está disponible
          const teamChange = this.asNumber(b.team?.trophyChange);
          if (teamChange !== undefined && teamChange !== null) {
            if (teamChange > 0) return 'victory' as const;
            if (teamChange < 0) return 'defeat' as const;
            return 'draw' as const;
          }
          // Fallback a comparar crowns si no hay trophyChange
          const teamCrowns = this.asNumber(b.team?.crowns);
          const oppCrowns = this.asNumber(b.opponent?.crowns);
          if (teamCrowns !== undefined && oppCrowns !== undefined) {
            if (teamCrowns > oppCrowns) return 'victory' as const;
            if (teamCrowns < oppCrowns) return 'defeat' as const;
            return 'draw' as const;
          }
          // Si no se puede determinar, marcar como 'none' (neutral)
          return 'none' as const;
        });
        // Mostrar de izquierda (más antiguo) a derecha (más reciente)
        this.streakPills = pills.slice().reverse().map((p: any, i: number) => ({ id: i, type: p }));
        return;
      }

      // Si metric trae historia de racha
      if (
        metric &&
        Array.isArray((metric as any).streak?.history) &&
        (metric as any).streak.history.length > 0
      ) {
        const pills = (metric as any).streak.history.slice(0, 12).map((h: any) => {
          const v = String(h).toLowerCase();
          if (v.includes('win') || v === 'victory' || v === 'v') return 'victory' as const;
          if (v.includes('loss') || v.includes('defeat') || v === 'd') return 'defeat' as const;
          if (v.includes('draw') || v === 'draw' || v === 'tie') return 'draw' as const;
          return 'none' as const;
        });
        this.streakPills = pills.slice().reverse().map((p: any, i: number) => ({ id: i, type: p }));
        return;
      }

      // Fallback: construir a partir de metric.streak.current (número de victorias consecutivas)
      const current = metric?.streak?.current ? Number(metric.streak.current) : 0;
      const total = 12;
      // Llenar con 'victory' para las victorias actuales y 'none' para el resto
      this.streakPills = Array.from({ length: total }, (_, i) =>
        i < current ? 'victory' : 'none',
      ).map((p: any, i: number) => ({ id: i, type: p }));
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
  public streakPills: { id: number; type: 'victory' | 'defeat' | 'draw' | 'none' }[] = [];

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
      this.snapshotsStore.loadSnapshots(tag);
    }

    void this.winLabels;
    this.destroyRef.onDestroy(() => {});
  }

  ngAfterViewInit(): void {
    this.animator = new CascadeAnimator(this.elementRef.nativeElement, [
      { selector: '.chart-wrapper', stagger: 0.15 },
    ]);
  }

  ngOnDestroy(): void {
    this.animator?.destroy();
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

  // Helper copied from dashboard to format win/loss percentages in template
  public displayPercent(metric: any, rateKey: 'winRate' | 'lossRate'): string {
    if (!metric) return '0.00';

    const rate = metric[rateKey];

    const value7 = this.asNumber(rate?.last7Days);

    let percent: number | undefined;

    if (value7 !== undefined) {
      percent = this.normalizePercent(value7);
    } else {
      const value25 = this.asNumber(rate?.last25Battles);
      if (value25 !== undefined) {
        percent = this.normalizePercent(value25);
      } else {
        const generic = this.asNumber(rate);
        percent = this.normalizePercent(generic);
      }
    }

    return (percent ?? 0).toFixed(2);
  }

  private updateTrophies(metricOrArray: any) {
    if (!metricOrArray) {
      this.trophiesLabels = [];
      this.trophiesDatasets = [];
      this.trophiesOptions = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { title: { display: true, text: 'Trofeos' }, beginAtZero: false },
        },
      } as ChartOptions;
      this.trophiesNoDataMessage = this.translate.instant('PAGES.DASHBOARD.NO_DATA_TROPHIES');
      return;
    }

    let labels: string[];
    let data: number[];

    if (Array.isArray(metricOrArray) && metricOrArray.length > 0) {
      const sorted = [...metricOrArray].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
      data = sorted.map((s) => s.trophies);
    } else if (metricOrArray && Array.isArray(metricOrArray.history)) {
      const sorted = [...metricOrArray.history].sort(
        (a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.generatedAt).toLocaleDateString());
      data = sorted.map((s) => s.trophies);
    } else {
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
        labels = [];
        data = [];
      }
    }

    // Si hay solo un punto, duplicarlo para poder renderizar la linea.
    if (data.length === 1) {
      const singleDateLabel = labels[0];
      const originalDate = new Date(
        metricOrArray.history?.[0]?.generatedAt ?? metricOrArray[0]?.capturedAt ?? new Date(),
      );
      const prevDate = new Date(originalDate.getTime() - 24 * 60 * 60 * 1000);
      labels = [prevDate.toLocaleDateString(), singleDateLabel];
      data = [data[0], data[0]];
    }

    let hasUsefulData = data.length >= 1;
    // Fallback de dashboard: intentar con snapshots si metrics no trae datos utiles.
    if (!hasUsefulData) {
      const snaps = this.snapshotsStore.snapshots();
      if (Array.isArray(snaps) && snaps.length > 0) {
        const sorted = [...snaps].sort(
          (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
        );
        labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
        data = sorted.map((s) => s.trophies);
        if (data.length === 1) {
          const originalDate = new Date(sorted[0].capturedAt ?? new Date());
          const prevDate = new Date(originalDate.getTime() - 24 * 60 * 60 * 1000);
          labels = [prevDate.toLocaleDateString(), labels[0]];
          data = [data[0], data[0]];
        }
      }
      hasUsefulData = data.length >= 1;
    }

    this.trophiesLabels = hasUsefulData ? labels : [];
    this.trophiesDatasets = hasUsefulData
      ? [
          {
            label: 'Trofeos',
            data,
            borderColor: '#C9DAF8',
            tension: 0.3,
          },
        ]
      : [];

    this.trophiesOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: 'Trofeos' }, beginAtZero: false },
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
    this.winBackground = ['#EBF9C8', '#F8C9C9'];
    // Hide Chart.js legend (the colored squares) and keep tooltip
    this.winOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
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
    const snaps = this.snapshotsStore.snapshots();
    let labels: string[];
    let data: number[];

    if (Array.isArray(snaps) && snaps.length > 0) {
      const sorted = [...snaps].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
      data = sorted.map((s) => s.donations);
      if (data.length === 1) {
        const prevDate = new Date(new Date(sorted[0].capturedAt).getTime() - 24 * 60 * 60 * 1000);
        labels = [prevDate.toLocaleDateString(), labels[0]];
        data = [data[0], data[0]];
      }
    } else {
      const donations = this.asNumber(metric.donations) ?? 0;
      labels = [this.translate.instant('PAGES.PROGRESS.DONATIONS_LABEL')];
      data = [donations];
    }

    const hasUsefulData = data.length >= 1;
    this.donationsLabels = hasUsefulData ? labels : [];
    this.donationsDatasets = hasUsefulData
      ? [
          {
            label: this.translate.instant('PAGES.PROGRESS.DONATIONS_TITLE') || 'Donaciones',
            data,
            borderColor: '#EBF9C8',
            tension: 0.3,
          },
        ]
      : [];
    this.donationsOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: '' }, beginAtZero: false },
      },
    } as ChartOptions;
  }

  private updateBattles(metric: any) {
    const snaps = this.snapshotsStore.snapshots();
    let labels: string[];
    let data: number[];

    if (Array.isArray(snaps) && snaps.length > 0) {
      const sorted = [...snaps].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
      data = sorted.map((s) => s.battleCount);
      if (data.length === 1) {
        const prevDate = new Date(new Date(sorted[0].capturedAt).getTime() - 24 * 60 * 60 * 1000);
        labels = [prevDate.toLocaleDateString(), labels[0]];
        data = [data[0], data[0]];
      }
    } else {
      const total = this.asNumber(metric.battles?.total) ?? 0;
      const last24 = this.asNumber(metric.battles?.last24hr) ?? 0;
      labels = [
        this.translate.instant('PAGES.PROGRESS.BATTLES_TOTAL_LABEL'),
        this.translate.instant('PAGES.PROGRESS.BATTLES_LAST24_LABEL'),
      ];
      data = [total, last24];
    }

    const hasUsefulData = data.length >= 1;
    this.battlesCompLabels = hasUsefulData ? labels : [];
    this.battlesCompDatasets = hasUsefulData
      ? [
          {
            label: this.translate.instant('PAGES.PROGRESS.BATTLES_LABEL') || 'Batallas',
            data,
            borderColor: '#C9DAF8',
            tension: 0.3,
          },
        ]
      : [];
    this.battlesCompOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: '' }, beginAtZero: false },
      },
    } as ChartOptions;
  }
}
