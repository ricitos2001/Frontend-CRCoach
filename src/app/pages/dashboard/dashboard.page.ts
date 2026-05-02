import { Component, effect, OnInit, TemplateRef, ViewChild, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { SessionsSignalStore } from '../../signal_stores/sessions.signal.store';
import { GoalsSignalStore } from '../../signal_stores/goals.signal.store';
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ChartOptions } from 'chart.js';
import { SnapshotsSignalStore } from '../../signal_stores/snapshots.signal.store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    DatePipe,
    TranslatePipe,
    GraphComponent,
    DecimalPipe,
    RefreshButtonComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class DashboardPage implements OnInit {
  // Referencias para evitar que el compilador/linter marque los componentes como "no usados" cuando
  // la plantilla está en un archivo externo. Estas referencias son inofensivas y serán eliminadas
  // por el tree-shaker si no se usan en producción.
  constructor(
    public usersStore: UsersSignalStore,
    public profileStore: PlayerProfileSignalStore,
    public headerContentService: HeaderContentService,
    public battlesStore: BattlesSignalStore,
    public sessionsStore: SessionsSignalStore,
    public goalsStore: GoalsSignalStore,
    public metricsStore: MetricsSignalStore,
    public snapshotsStore: SnapshotsSignalStore,
    private destroyRef: DestroyRef,
    private translate: TranslateService,
  ) {
    effect(() => {
      const email = localStorage.getItem('email');
      if (!email) return;
      this.usersStore.loadByEmail(email);
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        localStorage.setItem('tag', user.playerTag);
        this.profileStore.loadByTag(user.playerTag);
        this.battlesStore.loadByTag(user.playerTag);
        this.metricsStore.loadMetrics(user.playerTag);
        this.snapshotsStore.loadSnapshots(user.playerTag);
      }
    });
    // Ahora la gráfica de trofeos se alimenta desde MetricsSignalStore
    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) this.createOrUpdateTrophiesChart(metric);
      else {
        this.trophiesLabels = [];
        this.trophiesDatasets = [];
      }
    });

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) {
        this.createOrUpdateWinrateChart();
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
        this.streakPills = pills
          .slice()
          .reverse()
          .map((p: any, i: number) => ({ id: i, type: p }));
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
  @ViewChild('headerContent', { static: true }) headerContent!: TemplateRef<any>;

  // Datos para componentes reutilizables
  public trophiesLabels: string[] = [];
  public trophiesDatasets: any[] = [];
  public trophiesOptions?: ChartOptions;
  public trophiesNoDataMessage = '';

  public winLabels: string[] = ['Victorias', 'Derrotas'];
  public winData: number[] = [];
  public winBackground: string[] = [];
  public winOptions?: ChartOptions;
  // Pills to render the recent streak (each item has an id and a type)
  public streakPills: { id: number; type: 'victory' | 'defeat' | 'draw' | 'none' }[] = [];

  // Usamos ngOnInit para inicializar la vista y también para registrar la
  // destrucción de los charts (según petición del usuario: evitar ngAfterViewInit y ngOnDestroy).
  ngOnInit(): void {
    this.headerContentService.setContent(this.headerContent);
    void this.winLabels;
    this.destroyRef.onDestroy(() => {});
  }

  // Convierte un valor que puede ser fracción (0.2857) o ya porcentaje (28.57)
  private asNumber(v: any): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private normalizePercent(n?: number): number {
    if (n === undefined || isNaN(n)) return 0;
    // si está en rango [0,1], se asume fracción y se multiplica por 100
    if (n >= 0 && n <= 1) return n * 100;
    return n;
  }

  // Helpers para exponer porcentajes preparados a la plantilla y evitar uso de operadores
  // opcionales/?? en la plantilla que generan advertencias del compilador.
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

  // Devuelve un array desde una respuesta que puede ser paginada o un array directo
  public pageToArray(page: any): any[] {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    if (page.content && Array.isArray(page.content)) return page.content;
    return [];
  }

  public get lineChartOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { title: { display: true, text: 'Trofeos' }, beginAtZero: false },
      },
    } as ChartOptions;
  }

  public get pieChartOptions(): ChartOptions {
    return { responsive: true, plugins: { legend: { position: 'right' } } } as ChartOptions;
  }

  private createOrUpdateTrophiesChart(metricOrArray?: any) {
    if (!metricOrArray) {
      this.trophiesLabels = [];
      this.trophiesDatasets = [];
      this.trophiesOptions = this.lineChartOptions;
      this.trophiesNoDataMessage = this.translate.instant('PAGES.DASHBOARD.NO_DATA_TROPHIES');
      return;
    }

    let labels: string[];
    let data: number[];

    // Si viene un array (compatibilidad con snapshots)
    if (Array.isArray(metricOrArray) && metricOrArray.length > 0) {
      const sorted = [...metricOrArray].sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
      );
      labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
      data = sorted.map((s) => s.trophies);
    } else if (metricOrArray && Array.isArray(metricOrArray.history)) {
      // Si metric trae historia
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
        labels = [];
        data = [];
      }
    }

    // If only one data point is available, duplicate it (previous day) so the line chart can render a flat line.
    if (data.length === 1) {
      const singleDateLabel = labels[0];
      // try to parse original date from metric history dates if possible
      const originalDate = new Date(
        metricOrArray.history?.[0]?.generatedAt ?? metricOrArray[0]?.capturedAt ?? new Date(),
      );
      const prevDate = new Date(originalDate.getTime() - 24 * 60 * 60 * 1000);
      const prevLabel = prevDate.toLocaleDateString();
      labels = [prevLabel, singleDateLabel];
      data = [data[0], data[0]];
    }

    let hasUsefulData = data.length >= 1;
    // If no useful data from metrics, try fallback to snapshotsStore (older implementation)
    if (!hasUsefulData) {
      const snaps = this.snapshotsStore.snapshots();
      if (Array.isArray(snaps) && snaps.length > 0) {
        const sorted = [...snaps].sort(
          (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
        );
        labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
        data = sorted.map((s) => s.trophies);
        // duplicate single point if needed
        if (data.length === 1) {
          const originalDate = new Date(sorted[0].capturedAt ?? new Date());
          const prevDate = new Date(originalDate.getTime() - 24 * 60 * 60 * 1000);
          labels = [prevDate.toLocaleDateString(), labels[0]];
          data = [data[0], data[0]];
        }
      }
      // recompute usefulness after fallback
      hasUsefulData = data.length >= 1;
    }

    this.trophiesLabels = hasUsefulData ? labels : [];
    // debug: console.log('trophiesLabels', this.trophiesLabels, 'data', data);
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

    this.trophiesOptions = this.lineChartOptions;
    this.trophiesNoDataMessage = this.translate.instant('PAGES.DASHBOARD.NO_DATA_TROPHIES');
  }

  private createOrUpdateWinrateChart() {
    const metric = this.metricsStore.metric();
    if (!metric) return;

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
    this.winOptions = {
      ...this.pieChartOptions,
      plugins: {
        ...(this.pieChartOptions.plugins ?? {}),
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
  protected readonly JSON = JSON;
}

