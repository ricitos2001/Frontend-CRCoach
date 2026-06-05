import { Component, effect, AfterViewInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Battle } from '../../interfaces/Battle';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { CascadeAnimator } from '../../utils/cascade-animation';

@Component({
  selector: 'app-battles',
  imports: [
    SidebarComponent,
    RefreshButtonComponent,
    TranslateModule,
    SearcherComponent,
    FormInputComponent,
    FormsModule,
    PaginationComponent,
  ],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class BattlesPage implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private animator?: CascadeAnimator;
  tag = localStorage.getItem('tag');
  private lastLoadedTag: string | null = null;
  // filter options
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

  resultOptions = [
    { value: 'all', label: 'PAGES.BATTLES.ALL' },
    { value: 'victory', label: 'PAGES.BATTLES.VICTORY' },
    { value: 'draw', label: 'PAGES.BATTLES.DRAW' },
    { value: 'defeat', label: 'PAGES.BATTLES.DEFEAT' },
  ];

  selectedMode: string = 'all';
  selectedResult: string = 'all';
  searchTerm: string = '';

  currentPage = 0;
  pageSize = 20;

  constructor(public battlesStore: BattlesSignalStore) {
    effect(() => {
      const tag = this.tag;
      if (!tag) return;
      if (this.lastLoadedTag === tag) return;
      this.lastLoadedTag = tag;

      (async () => {
        await this.battlesStore.loadByTag(tag);
        const battles = this.battlesStore.battles();
        if (!battles || (Array.isArray(battles) && battles.length === 0)) {
          await this.battlesStore.importBattles(tag);
        }
      })();
    });
  }

  onSearch(term: string) {
    this.searchTerm = term ?? '';
    this.resetPage();
  }

  // Determine battle result: 'victory' | 'defeat' | 'draw'
  getBattleResult(battle: Battle): 'victory' | 'defeat' | 'draw' {
    const tChange = battle.team.trophyChange;
    const oChange = battle.opponent.trophyChange;

    // trophyChange path
    if (tChange > 0 && oChange < 0) return 'victory';
    if (tChange < 0 && oChange > 0) return 'defeat';
    if (tChange === 0 && oChange === 0) return 'draw';

    // Fallback to crowns comparison
    const tCrowns = battle.team.crowns ?? 0;
    const oCrowns = battle.opponent.crowns ?? 0;
    if (tCrowns > oCrowns) return 'victory';
    if (tCrowns < oCrowns) return 'defeat';
    return 'draw';
  }

  // Return the translation key for a battle result
  getBattleResultKey(battle: Battle): string {
    const r = this.getBattleResult(battle);
    switch (r) {
      case 'victory':
        return 'PAGES.BATTLES.VICTORY';
      case 'defeat':
        return 'PAGES.BATTLES.DEFEAT';
      default:
        return 'PAGES.BATTLES.DRAW';
    }
  }

  // Return filtered battles according to selected filters
  filteredBattles(): Battle[] | null {
    const all = this.battlesStore.battles();
    if (!all) return null;

    return all
      .filter((b) => {
        // filter by mode
        if (this.selectedMode && this.selectedMode !== 'all') {
          const gmName = b.gameMode?.name ?? '';
          if (gmName !== this.selectedMode) return false;
        }
        // filter by result
        if (this.selectedResult && this.selectedResult !== 'all') {
          const res = this.getBattleResult(b);
          if (res !== this.selectedResult) return false;
        }
        // optional: filter by search term (team/opponent name)
        if (this.searchTerm && this.searchTerm.trim()) {
          const q = this.searchTerm.trim().toLowerCase();
          const team = (b.team?.name ?? '').toLowerCase();
          const opp = (b.opponent?.name ?? '').toLowerCase();
          if (!team.includes(q) && !opp.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.battleTime < b.battleTime ? 1 : -1));
  }

  refreshBattles() {
    if (!this.tag) return;
    this.battlesStore.importBattles(this.tag);
  }

  resetPage() {
    this.currentPage = 0;
  }

  get pageObj() {
    const battles = this.filteredBattles();
    const total = battles?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    const page = Math.min(this.currentPage, totalPages - 1);
    return {
      number: page,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
    };
  }

  paginatedBattles(): Battle[] | null {
    const all = this.filteredBattles();
    if (!all) return null;
    const start = this.currentPage * this.pageSize;
    return all.slice(start, start + this.pageSize);
  }

  onPrev() {
    if (this.currentPage > 0) this.currentPage--;
  }

  onNext() {
    const total = this.filteredBattles()?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage < totalPages - 1) this.currentPage++;
  }

  onModeChange(value: string) {
    this.selectedMode = value;
    this.resetPage();
  }

  onResultChange(value: string) {
    this.selectedResult = value;
    this.resetPage();
  }

  getClanBadgeUrl(badgeId: number) {
    console.log(badgeId);
    return `https://royaleapi.github.io/cr-api-assets/badges/medium/${badgeId}.png`;
  }

  ngAfterViewInit(): void {
    this.animator = new CascadeAnimator(this.elementRef.nativeElement, [
      { selector: '.battle-card', stagger: 0.08 },
    ]);
  }

  ngOnDestroy(): void {
    this.animator?.destroy();
  }
}
