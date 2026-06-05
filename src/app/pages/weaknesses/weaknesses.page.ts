import { Component, effect, OnInit, AfterViewInit, OnDestroy, ElementRef, inject, DestroyRef, ViewChild, HostListener } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { AnalyticsSignalStore } from '../../signal_stores/analytics.signal.store';
import { ChartOptions, ChartDataset } from 'chart.js';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { CommonButtonComponent } from '../../components/shared/common-button/common-button.component';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { AdvancedSearchComponent } from '../../components/shared/advanced-search/advanced-search.component';
import { FormsModule } from '@angular/forms';
import { CascadeAnimator } from '../../utils/cascade-animation';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-weaknesses',
  imports: [
    SidebarComponent,
    TranslatePipe,
    GraphComponent,
    RefreshButtonComponent,
    SearcherComponent,
    FormInputComponent,
    CommonButtonComponent,
    ModalComponent,
    AdvancedSearchComponent,
    FormsModule,
    NgStyle,
  ],
  templateUrl: './weaknesses.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class WeaknessesPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private animator?: CascadeAnimator;
  tag = localStorage.getItem('tag');
  // game mode filter (same as BattlesPage)
  gameModes = [
    { value: 'all', label: 'PAGES.BATTLES.ALL' },
    { value: 'Ladder', label: 'Ladder' },
    { value: 'Overtime_Ladder', label: 'Overtime Ladder' },
    { value: 'TripleElixir_Ladder', label: 'Triple Elixir Ladder' },
    { value: 'Showdown_Friendly', label: 'Showdown Friendly' },
    { value: '7xElixir_Ladder', label: '7x Elixir Ladder' },
    { value: 'Crazy_Arena', label: 'Crazy Arena' },
    { value: 'CW_Battle_1v1', label: 'Clan War 1v1' },
    { value: 'ClanWar_BoatBattle', label: 'Clan War Boat Battle' },
    { value: 'RampUpElixir_Ladder', label: 'Ramp Up Elixir Ladder' },
    { value: 'Rage_Ladder', label: 'Rage Ladder' },
  ];

  selectedMode: string = 'all';
  advancedOpen = false;
  public pageTitle: string = '';
  // current advanced filter state (persist between actions)
  currentMinBattles: number | undefined = undefined;
  currentLimit: number | undefined = undefined;
  currentMinAppearances: number | undefined = undefined;
  currentFrom: string | undefined = undefined;
  currentTo: string | undefined = undefined;
  constructor(
    public analyticsStore: AnalyticsSignalStore,
    private destroyRef: DestroyRef,
    private translate: TranslateService,
  ) {
    // Initialize page title synchronously to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.pageTitle = this.translate.instant('PAGES.WEAKNESSES.TITLE');
    // Update on language change
    this.translate.onLangChange?.subscribe(() => {
      this.pageTitle = this.translate.instant('PAGES.WEAKNESSES.TITLE');
    });
    effect(() => {
      if (this.tag != null) {
        this.analyticsStore.loadSummary(this.tag);
        this.analyticsStore.loadWeaknesses(this.tag);
        this.analyticsStore.loadProblematicCards(this.tag);
      }
    });

    effect(() => {
      const wr = this.analyticsStore.weaknesses();
      if (wr) {
        this.createOrUpdateChart();
      } else {
        this.weaknessesLabels = [];
        this.weaknessesDatasets = [];
      }
    });
    // Populate small summary charts when summary is available
    effect(() => {
      const s = this.analyticsStore.summary();
      if (!s) return;
      const anyS: any = s as any;
      const raw25 = anyS.winRateLast25;
      const raw7 = anyS.winRateLast7d;

      const extract = (raw: any) => {
        if (raw === undefined || raw === null) return 0;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'object')
          return (
            Number(raw.value ?? raw.percentage ?? raw.last25Battles ?? raw.last7Days ?? 0) || 0
          );
        return Number(raw) || 0;
      };

      const normalize = (v: any) => {
        const n = Number(v);
        if (Number.isFinite(n)) return n >= 0 && n <= 1 ? n * 100 : n;
        return 0;
      };

      const pw25 = Math.max(0, Math.min(100, normalize(extract(raw25))));
      const pw7 = Math.max(0, Math.min(100, normalize(extract(raw7))));
      this.summaryWinData25 = [pw25, Math.max(0, 100 - pw25)];
      this.summaryWinData7 = [pw7, Math.max(0, 100 - pw7)];
    });
  }

  private asNumber(v: any): number | undefined {
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  // Normaliza valores que pueden venir como fracción (0..1) o ya en porcentaje (0..100)
  private normalizePercent(n?: number): number {
    if (n === undefined || isNaN(n)) return 0;
    if (n >= 0 && n <= 1) return n * 100;
    return n;
  }

  // Formatea cualquier valor posible (number, string, objeto con propiedades comunes)
  // devolviendo una cadena con el porcentaje con 'decimals' decimales (sin el sufijo '%').
  public formatPercentValue(v: any, decimals = 2): string {
    if (v === null || v === undefined) return (0).toFixed(decimals);

    // Si es objeto, intentar extraer propiedades comunes usadas por el backend
    if (typeof v === 'object') {
      v = v.value ?? v.percentage ?? v.last25Battles ?? v.last7Days ?? v;
    }

    const n = Number(v);
    if (!Number.isFinite(n)) return (0).toFixed(decimals);

    const percent = this.normalizePercent(n);
    return (percent ?? 0).toFixed(decimals);
  }

  // Period filter applied from app-searcher (format yyyy-mm-dd - yyyy-mm-dd or dd/mm/yyyy - dd/mm/yyyy)
  onPeriodFilter(range: { from: string; to: string } | null) {
    if (!this.tag) return;
    if (!range) {
      // reload default (no date filters)
      this.analyticsStore.loadWeaknesses(this.tag);
      this.analyticsStore.loadSummary(this.tag);
      this.analyticsStore.loadProblematicCards(this.tag);
      return;
    }
    // Ask the store/service to reload weaknesses for the specified date range
    // loadWeaknesses signature: (tag, gameMode?, from?, to?, minBattles?)
    const gameModeParam =
      this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;
    // persist current range
    this.currentFrom = range.from;
    this.currentTo = range.to;

    this.analyticsStore.loadWeaknesses(
      this.tag,
      gameModeParam,
      range.from,
      range.to,
      this.currentMinBattles,
    );
    this.analyticsStore.loadSummary(this.tag, gameModeParam, range.from, range.to);
    this.analyticsStore.loadProblematicCards(
      this.tag,
      gameModeParam,
      range.from,
      range.to,
      this.currentLimit,
      this.currentMinAppearances,
    );
  }

  // Open advanced modal
  openAdvanced() {
    this.advancedOpen = true;
  }

  closeAdvanced() {
    this.advancedOpen = false;
  }

  // Handle apply from advanced search
  onAdvancedApply(filters: {
    gameMode?: string | null;
    mode?: string | null;
    from?: string | null;
    to?: string | null;
    minBattles?: number | null;
    limit?: number | null;
    minAppearances?: number | null;
  }) {
    if (!this.tag) return;
    // Update selectedMode from advanced form (support both 'mode' and 'gameMode')
    const newMode = filters.mode ?? filters.gameMode ?? this.selectedMode;
    this.selectedMode = newMode ?? 'all';

    // persist advanced filter values
    this.currentMinBattles = filters.minBattles ?? undefined;
    this.currentLimit = filters.limit ?? undefined;
    this.currentMinAppearances = filters.minAppearances ?? undefined;

    const gameModeParam =
      this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;

    // Call store to reload weaknesses, summary and problematic cards with provided filters
    // persist current range
    this.currentFrom = filters.from ?? undefined;
    this.currentTo = filters.to ?? undefined;

    this.analyticsStore.loadWeaknesses(
      this.tag,
      gameModeParam,
      this.currentFrom,
      this.currentTo,
      this.currentMinBattles,
    );

    this.analyticsStore.loadSummary(this.tag, gameModeParam, this.currentFrom, this.currentTo);

    this.analyticsStore.loadProblematicCards(
      this.tag,
      gameModeParam,
      this.currentFrom,
      this.currentTo,
      this.currentLimit,
      this.currentMinAppearances,
    );

    this.advancedOpen = false;
  }

  onAdvancedReset() {
    if (!this.tag) return;
    this.selectedMode = 'all';
    this.currentFrom = undefined;
    this.currentTo = undefined;
    this.currentMinBattles = undefined;
    this.currentLimit = undefined;
    this.currentMinAppearances = undefined;
    this.analyticsStore.loadWeaknesses(this.tag);
    this.advancedOpen = false;
  }

  // Handle mode change from the page select: reload backend-filtered data
  onModeChange(mode: string) {
    if (!this.tag) return;
    this.selectedMode = mode ?? 'all';
    const gameModeParam =
      this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;
    this.analyticsStore.loadWeaknesses(
      this.tag,
      gameModeParam,
      this.currentFrom,
      this.currentTo,
      this.currentMinBattles,
    );
    this.analyticsStore.loadSummary(this.tag, gameModeParam, this.currentFrom, this.currentTo);
    this.analyticsStore.loadProblematicCards(
      this.tag,
      gameModeParam,
      this.currentFrom,
      this.currentTo,
      this.currentLimit,
      this.currentMinAppearances,
    );
    // chart will update when store emits new weaknesses
  }

  // Datos para el componente reutilizable `app-graph`
  public weaknessesLabels: string[] = [];
  public weaknessesDatasets: ChartDataset[] = [];
  // Summary small charts
  public summaryWinLabels: string[] = ['Victorias', 'Derrotas'];
  public summaryWinData25: number[] = [0, 100];
  public summaryWinData7: number[] = [0, 100];
  public summaryWinBackground: string[] = ['#EBF9C8', '#F8C9C9'];

  // Opciones para los pequeños doughnuts de resumen: ocultar el recuadro de la leyenda
  public smallDoughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          // eliminar el cuadro de color junto al texto de la leyenda
          boxWidth: 0,
          // un poco de padding para separar texto del borde
          padding: 8,
        },
      },
    },
  } as ChartOptions;
  public get barChartOptions(): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.ARCHETYPE') } },
        y: {
          title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL') },
          beginAtZero: true,
        },
      },
    } as ChartOptions;
  }

  protected createOrUpdateChart() {
    const wr = this.analyticsStore.weaknesses();
    if (!wr) return;
    let byArchetype: any[] = [];
    if (Array.isArray((wr as any).byArchetype)) {
      byArchetype = (wr as any).byArchetype;
    } else if (typeof (wr as any).byArchetypeJson === 'string') {
      try {
        byArchetype = JSON.parse((wr as any).byArchetypeJson);
      } catch (e) {
        console.warn('WeaknessesPage: error parsing byArchetypeJson', e);
        return;
      }
    } else {
      // No tenemos datos en el formato esperado
      return;
    }

    // If a mode is selected, try to filter the byArchetype entries by mode.
    let filtered = byArchetype;
    if (this.selectedMode && this.selectedMode !== 'all') {
      const sel = String(this.selectedMode).toLowerCase();
      const candidates = byArchetype.filter((a: any) => {
        // Support multiple possible property names coming from backend and different shapes
        let gm: any = undefined;
        if (a.gameMode !== undefined) gm = a.gameMode;
        else if (a.mode !== undefined) gm = a.mode;
        else if (a.gameModeName !== undefined) gm = a.gameModeName;
        else if (a.modeName !== undefined) gm = a.modeName;

        if (gm === undefined || gm === null) return false;
        // gm can be an object like { name: 'Ladder' } or a string
        const gmName = typeof gm === 'string' ? gm : (gm.name ?? gm.gameModeId ?? String(gm));
        if (!gmName) return false;
        return String(gmName).toLowerCase() === sel;
      });

      // If filtering yielded results, use them. If none matched, keep original data
      if (candidates.length > 0) {
        filtered = candidates;
      } else {
        // No matching entries found: backend may not include mode per archetype. Fallback silently.
        filtered = byArchetype;
      }
    }

    const labels = filtered.map((a: any) => a.archetype);
    const data = filtered.map((a: any) => a.battles);
    // Colors must match the filtered entries (not the original byArchetype) to avoid mismatch
    const bgColors = filtered.map((a: any) => {
      if (a.label && a.label.toLowerCase().includes('fort')) return '#EBF9C8';
      if (a.label && a.label.toLowerCase().includes('debil')) return '#F8C9C9';
      return '#F8E2C9';
    });

    // Asignar a propiedades usadas por <app-graph>
    this.weaknessesLabels = labels;
    this.weaknessesDatasets = [
      {
        label: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL'),
        data,
        backgroundColor: bgColors,
        borderColor: bgColors,
        borderWidth: 1,
      } as any,
    ];
  }

  // --- Card detail logic ---
  selectedCard: any = null;
  cardDetailStyle: { top?: string; left?: string } = {};
  @ViewChild('cardDetail') cardDetailRef!: ElementRef<HTMLElement>;

  toggleCardDetails(card: any, event: MouseEvent): void {
    event.stopPropagation();
    if (this.selectedCard && this.selectedCard.cardId === card.cardId) {
      this.selectedCard = null;
      this.cardDetailStyle = {};
      return;
    }
    this.selectedCard = card;
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      this.cardDetailStyle = { right: '20px', top: '120px' } as any;
      return;
    }
    const rect = target.getBoundingClientRect();
    let left = rect.right + 8;
    let top = rect.top;
    this.cardDetailStyle = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` };
    setTimeout(() => {
      try {
        const el = this.cardDetailRef?.nativeElement;
        if (!el) return;
        const boxW = el.offsetWidth;
        const boxH = el.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (left + boxW > vw - 8) {
          left = rect.left - boxW - 8;
        }
        if (left < 8) left = 8;
        if (top + boxH > vh - 8) {
          top = Math.max(8, vh - boxH - 8);
        }
        this.cardDetailStyle = { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` };
      } catch (e) {}
    }, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(_: MouseEvent): void {
    this.selectedCard = null;
  }

  ngOnInit(): void {
    this.createOrUpdateChart();
    this.destroyRef.onDestroy(() => {});
  }

  ngAfterViewInit(): void {
    this.animator = new CascadeAnimator(this.elementRef.nativeElement, [
      { selector: '.chart-wrapper', stagger: 0.15 },
      { selector: '.problematic-card', stagger: 0.1 },
    ]);
  }

  ngOnDestroy(): void {
    this.animator?.destroy();
  }
}
