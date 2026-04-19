import { Component, effect, OnInit, DestroyRef } from '@angular/core';
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
  ],
  templateUrl: './weaknesses.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class WeaknessesPage implements OnInit {
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
  ];

  selectedMode: string = 'all';
  advancedOpen = false;
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
    const gameModeParam = this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;
    // persist current range
    this.currentFrom = range.from;
    this.currentTo = range.to;

    this.analyticsStore.loadWeaknesses(this.tag, gameModeParam, range.from, range.to, this.currentMinBattles);
    this.analyticsStore.loadSummary(this.tag, gameModeParam, range.from, range.to);
    this.analyticsStore.loadProblematicCards(this.tag, gameModeParam, range.from, range.to, this.currentLimit, this.currentMinAppearances);
  }

  // Open advanced modal
  openAdvanced() {
    this.advancedOpen = true;
  }

  closeAdvanced() {
    this.advancedOpen = false;
  }

  // Handle apply from advanced search
  onAdvancedApply(filters: { gameMode?: string | null; mode?: string | null; from?: string | null; to?: string | null; minBattles?: number | null; limit?: number | null; minAppearances?: number | null; }) {
    if (!this.tag) return;
    // Update selectedMode from advanced form (support both 'mode' and 'gameMode')
    const newMode = filters.mode ?? filters.gameMode ?? this.selectedMode;
    this.selectedMode = newMode ?? 'all';

    // persist advanced filter values
    this.currentMinBattles = filters.minBattles ?? undefined;
    this.currentLimit = filters.limit ?? undefined;
    this.currentMinAppearances = filters.minAppearances ?? undefined;

    const gameModeParam = this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;

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
    const gameModeParam = this.selectedMode && this.selectedMode !== 'all' ? this.selectedMode : undefined;
    this.analyticsStore.loadWeaknesses(this.tag, gameModeParam, this.currentFrom, this.currentTo, this.currentMinBattles);
    this.analyticsStore.loadSummary(this.tag, gameModeParam, this.currentFrom, this.currentTo);
    this.analyticsStore.loadProblematicCards(this.tag, gameModeParam, this.currentFrom, this.currentTo, this.currentLimit, this.currentMinAppearances);
    // chart will update when store emits new weaknesses
  }

  // Datos para el componente reutilizable `app-graph`
  public weaknessesLabels: string[] = [];
  public weaknessesDatasets: ChartDataset[] = [];

  public get barChartOptions(): ChartOptions {
    return {
      responsive: true,
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
        const gmName = typeof gm === 'string' ? gm : gm.name ?? gm.gameModeId ?? String(gm);
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
      if (a.label && a.label.toLowerCase().includes('fort')) return 'rgba(46, 204, 113, 0.9)';
      if (a.label && a.label.toLowerCase().includes('debil')) return 'rgba(231, 76, 60, 0.9)';
      return 'rgba(149, 165, 166, 0.9)';
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

  ngOnInit(): void {
    // Intentar crear/actualizar al inicializar (si ya hay datos)
    this.createOrUpdateChart();

    // No hay chart DOM directo aquí: el componente `app-graph` se encarga de su limpieza.
    this.destroyRef.onDestroy(() => {});
  }
}
