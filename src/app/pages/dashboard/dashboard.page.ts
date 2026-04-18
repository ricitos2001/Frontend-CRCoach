import { Component, effect, OnInit, TemplateRef, ViewChild, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { SessionsSignalStore } from '../../signal_stores/sessions.signal.store';
import { GoalsSignalStore } from '../../signal_stores/goals.signal.store';
import { MetricsSignalStore } from '../../signal_stores/metrics.signal.store';
import { DatePipe } from '@angular/common';
import { ChartOptions } from 'chart.js';
// Replaced old specific graph components with unified GraphComponent
import { SnapshotsSignalStore } from '../../signal_stores/snapshots.signal.store';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    DatePipe,
    TranslatePipe,
    GraphComponent,
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
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        localStorage.setItem('tag', user.playerTag);
        this.profileStore.loadByTag(user.playerTag);
        // Cargar batallas y métricas cuando el usuario tenga tag
        this.battlesStore.loadByTag(user.playerTag);
        this.metricsStore.loadMetrics(user.playerTag);
        this.snapshotsStore.loadSnapshots(user.playerTag);
      }
    });

    effect(() => {
      const snaps = this.snapshotsStore.snapshots();
      if (snaps && snaps.length > 0) {
        this.createOrUpdateTrophiesChart();
      }
    });

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) {
        this.createOrUpdateWinrateChart();
      }
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

  // Usamos ngOnInit para inicializar la vista y también para registrar la
  // destrucción de los charts (según petición del usuario: evitar ngAfterViewInit y ngOnDestroy).
  ngOnInit(): void {
    const email = localStorage.getItem('email');
    const tag = localStorage.getItem('tag');
    if (!email) return;
    this.usersStore.loadByEmail(email);
    this.sessionsStore.loadSessions(0, 3, email);
    this.goalsStore.loadGoals(0, 3, email);
    if (tag) {
      this.profileStore.loadByTag(tag);
      this.battlesStore.loadByTag(tag);
      this.metricsStore.loadMetrics(tag);
    }
    this.headerContentService.setContent(this.headerContent);
    // Referenciar una propiedad usada en la plantilla para evitar falsas alarmas de analizador.
    // (No hace nada funcional.)
    void this.winLabels;

    // No destruimos charts aquí: los componentes reutilizables manejan su propia limpieza.
    this.destroyRef.onDestroy(() => {});

    // Intentar crear/actualizar los charts al inicializar la vista (siempre que las referencias existan).
    // Los efectos en el constructor seguirán actualizando los charts cuando lleguen datos.
    this.createOrUpdateTrophiesChart();
    this.createOrUpdateWinrateChart();
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

  private createOrUpdateTrophiesChart() {
    const snaps = this.snapshotsStore.snapshots();
    // Ordenar por fecha asc (si hay snapshots)
    const sorted =
      snaps && snaps.length > 0
        ? [...snaps].sort(
            (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
          )
        : [];
    const labels = sorted.map((s) => new Date(s.capturedAt).toLocaleDateString());
    const data = sorted.map((s) => s.trophies);

    // Determinar si hay datos útiles: necesitamos al menos 2 puntos y que haya algún cambio en trofeos.
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
    this.winBackground = ['rgba(46, 204, 113, 0.9)', 'rgba(231, 76, 60, 0.9)'];
    this.winOptions = {
      ...this.pieChartOptions,
      plugins: {
        ...(this.pieChartOptions.plugins ?? {}),
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
