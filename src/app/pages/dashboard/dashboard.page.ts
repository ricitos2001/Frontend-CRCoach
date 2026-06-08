import { Component, effect, OnInit, AfterViewInit, TemplateRef, ViewChild, DestroyRef, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
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
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../enviroments/enviroment';
import { CascadeAnimator } from '../../utils/cascade-animation';
import { ImportingSpinnerComponent } from '../../components/shared/importing-spinner/importing-spinner.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    DatePipe,
    TranslatePipe,
    GraphComponent,
    DecimalPipe,
    RefreshButtonComponent,
    ImportingSpinnerComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class DashboardPage implements OnInit, AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private animator?: CascadeAnimator;
  // Track last loaded identifiers to avoid duplicate network requests
  private lastLoadedEmail: string | null = null;
  private lastLoadedTag: string | null = null;

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
    private usersService: UsersService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    // Initialize chart options and messages synchronously so bindings
    // have stable values during the first change-detection cycle.
    this.trophiesNoDataMessage = this.translate.instant('PAGES.DASHBOARD.NO_DATA_TROPHIES');
    // React to changes in the current user; do NOT trigger loadByEmail() from here to avoid loops.
    effect(() => {
      const user = this.usersStore.user();
      if (user && user.playerTag && user.playerTag.trim() !== '') {
        const tagToLoad = user.playerTag.trim();
        if (this.lastLoadedTag === tagToLoad) return;
        this.lastLoadedTag = tagToLoad;
        localStorage.setItem('tag', tagToLoad);

        (async () => {
          const token = localStorage.getItem('token');
          if (!token) return;
          try {
            await this.profileStore.loadByTag(tagToLoad);
            await this.snapshotsStore.loadSnapshots(tagToLoad);
            await this.metricsStore.loadMetrics(tagToLoad);
            await this.battlesStore.loadByTag(tagToLoad);
            await this.goalsStore.loadGoals(0, 3, localStorage.getItem('email'));
            await this.sessionsStore.loadSessions(0, 3, localStorage.getItem('email'));
          } catch (err) {
            console.error('Dashboard initial load sequence failed', err);
          }
        })();
      }
    });

    // React to user changes to load avatar if needed
    effect(() => {
      const u = this.usersStore.user();
      if (u) this.loadUserAvatar(u as any);
      else this.clearAvatarObjectUrl();
    });

    // Keep recentBattles in sync with the store, but avoid triggering loads here
    effect(() => {
      const battles = this.battlesStore.battles();
      this.recentBattles = this.pageToArray(battles).slice(0, 3);
    });

    effect(() => {
      const goalsPage = this.goalsStore.goalsPage();
      this.recentGoals = this.pageToArray(goalsPage).slice(0, 3);
    });

    effect(() => {
      const sessionsPage = this.sessionsStore.sessionsPage();
      this.recentSessions = this.pageToArray(sessionsPage).slice(0, 3);
    });

    effect(() => {
      const metric = this.metricsStore.metric();
      if (metric) {
        this.updateTrophies(metric);
        this.updateWinrate(metric);
      } else {
        this.trophiesLabels = [];
        this.trophiesDatasets = [];
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
        this.streakPills = pills
          .slice()
          .reverse()
          .map((p: any, i: number) => ({ id: i, type: p }));
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
  @ViewChild('avatarInput') avatarInputRef!: ElementRef<HTMLInputElement>;

  // Avatar handling (similar to profile.page)
  private lastAvatarPath: string | null = null;
  avatarObjectUrl: string | null = null;
  avatarLoading = false;

  // Resolver URLs de imágenes: si la URL es absoluta la dejamos (pero si contiene localhost la reescribimos contra apiUrl),
  // si es relativa la prefijamos con apiUrl
  public resolveUrl(url?: string | null, fallback: string = 'assets/img/icons/user.svg'): string {
    if (!url || url === 'null') return fallback;
    if (/^https?:\/\//i.test(url)) {
      if (/localhost/i.test(url)) {
        const rest = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
        return `${environment.apiUrl}/${rest}`;
      }
      return url;
    }
    const cleaned = url.replace(/^\/+/, '');
    return `${environment.apiUrl}/${cleaned}`;
  }

  // Cuando la imagen de perfil (fallback) también falla, mostrar el SVG por defecto
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/img/icons/user.svg';
    }
  }

  // Datos para componentes reutilizables
  public trophiesLabels: string[] = [];
  public trophiesDatasets: any[] = [];
  public trophiesOptions?: ChartOptions;
  public trophiesNoDataMessage = '';
  public winLabels: string[] = ['Victorias', 'Derrotas'];
  public winData: number[] = [];
  public winBackground: string[] = [];
  public winOptions?: ChartOptions;
  public streakPills: { id: number; type: 'victory' | 'defeat' | 'draw' | 'none' }[] = [];
  public recentGoals: any[] = [];
  public recentBattles: any[] = [];
  public recentSessions: any[] = [];

  ngOnInit(): void {
    const email = localStorage.getItem('email');
    if (email && this.lastLoadedEmail !== email) {
      this.lastLoadedEmail = email;
      this.usersStore.loadByEmail(email);
    }
    this.headerContentService.setContent(this.headerContent);
    void this.winLabels;
    this.destroyRef.onDestroy(() => {});
    this.destroyRef.onDestroy(() => this.animator?.destroy());
  }

  ngAfterViewInit(): void {
    this.animator = new CascadeAnimator(this.elementRef.nativeElement, [
      { selector: '.stat-card', stagger: 0.1 },
      { selector: '.chart-wrapper', stagger: 0.15 },
      { selector: '.dashboard__recent__victory, .dashboard__recent__defeat, .dashboard__recent__draw', stagger: 0.08 },
      { selector: '.dashboard__recent__content', stagger: 0.1 },
    ]);
  }

  private clearAvatarObjectUrl(): void {
    if (this.avatarObjectUrl) {
      try {
        URL.revokeObjectURL(this.avatarObjectUrl);
      } catch (e) {}
      this.avatarObjectUrl = null;
    }
    this.lastAvatarPath = null;
  }

  private loadUserAvatar(user: any): void {
    const token = localStorage.getItem('token');
    const idNumber = Number(user?.id);
    if (!token || !Number.isFinite(idNumber)) {
      this.clearAvatarObjectUrl();
      return;
    }

    const path = user?.avatarUrl ?? null;
    if (this.lastAvatarPath === path) return;
    this.lastAvatarPath = path;

    this.avatarLoading = true;
    this.usersService.token = token;
    this.usersService.getImageProfile(idNumber, true).subscribe({
      next: (blob) => {
        try {
          if (this.avatarObjectUrl) {
            try { URL.revokeObjectURL(this.avatarObjectUrl); } catch (e) {}
          }
          this.avatarObjectUrl = URL.createObjectURL(blob);
        } catch (e) {
          this.avatarObjectUrl = null;
        }
        this.avatarLoading = false;
        try { this.cdr.detectChanges(); } catch (e) {}
      },
      error: (err) => {
        if (err && err.status === 401) {
          console.warn('Dashboard: avatar request returned 401 - token may be expired');
        } else {
          console.error('Dashboard: error loading avatar', err);
        }
        this.avatarLoading = false;
        this.avatarObjectUrl = null;
        try { this.cdr.detectChanges(); } catch (e) {}
      }
    });
  }

  // Trigger file input to select a new avatar (and upload)
  triggerAvatarInput(event: MouseEvent): void {
    event.stopPropagation();
    try {
      this.avatarInputRef?.nativeElement?.click();
    } catch (e) {}
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    const user = this.usersStore.user();
    if (!user) return;
    const form = new FormData();
    form.append('file', file);
    this.usersService.postImageProfile(user.id, form).subscribe({
      next: () => {
        const email = localStorage.getItem('email');
        if (email) this.usersStore.loadByEmail(email);
      },
      error: (err) => {
        console.error('Dashboard: error uploading avatar', err);
      },
    });
    input.value = '';
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

  /**
   * Waits until battles are available in the store for the given tag.
   * This performs repeated calls to loadByTag and polls the store until
   * at least one battle is present or the timeout expires.
   * Returns true if battles were found, false on timeout.
   */
  private async ensureBattlesAvailable(
    tag: string,
    timeoutMs = 60000,
    intervalMs = 2000,
  ): Promise<boolean> {
    const start = Date.now();
    try {
      // Try at least once immediately
      while (Date.now() - start < timeoutMs) {
        try {
          await this.battlesStore.loadByTag(tag);
        } catch (e) {
          // ignore transient load errors and retry until timeout
        }

        const battles = this.battlesStore.battles();
        if (Array.isArray(battles) && battles.length > 0) return true;

        // Wait a bit before retrying
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    } catch (e) {
      // swallow unexpected errors and return false to let caller continue
    }
    return false;
  }

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

  public pageToArray(page: any): any[] {
    if (!page) return [];
    if (Array.isArray(page)) return page;
    if (page.content && Array.isArray(page.content)) return page.content;
    return [];
  }

  protected readonly JSON = JSON;
}

