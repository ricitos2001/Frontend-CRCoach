import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Battle } from '../../interfaces/Battle';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { SearcherComponent } from '../../components/shared/searcher/searcher.component';
import { FormInputComponent } from '../../components/shared/form-input/form-input.component';

@Component({
  selector: 'app-battles',
  imports: [
    SidebarComponent,
    RefreshButtonComponent,
    TranslateModule,
    SearcherComponent,
    FormInputComponent,
    FormsModule,
  ],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class BattlesPage {
  tag = localStorage.getItem('tag');
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
  constructor(public battlesStore: BattlesSignalStore) {
    effect(() => {
      if (this.tag != null) {
        this.battlesStore.loadByTag(this.tag);
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm = term ?? '';
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
}
