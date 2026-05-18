import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormInputComponent } from '../form-input/form-input.component';
import { CommonButtonComponent } from '../common-button/common-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-search',
  imports: [CommonModule, FormsModule, TranslateModule, FormInputComponent, CommonButtonComponent],
  templateUrl: './advanced-search.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class AdvancedSearchComponent {
  // form fields
  periodFrom: string | null = null; // ISO-like string from datetime-local
  periodTo: string | null = null;
  minBattles: number | null = null;
  limit: number | null = null;
  minAppearances: number | null = null;
  // game mode select
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

  @Output() apply = new EventEmitter<{
    from?: string | null;
    to?: string | null;
    minBattles?: number | null;
    limit?: number | null;
    minAppearances?: number | null;
    mode?: string | null;
  }>();

  @Output() reset = new EventEmitter<void>();

  applyFilters() {
    // simple validation: if both dates provided ensure from <= to
    if (this.periodFrom && this.periodTo) {
      const f = new Date(this.periodFrom);
      const t = new Date(this.periodTo);
      if (isNaN(f.getTime()) || isNaN(t.getTime()) || f > t) {
        // invalid range: swap or ignore; here we swap to keep UX friendly
        const tmp = this.periodFrom;
        this.periodFrom = this.periodTo;
        this.periodTo = tmp;
      }
    }

    this.apply.emit({
      from: this.periodFrom,
      to: this.periodTo,
      minBattles: this.minBattles,
      limit: this.limit,
      minAppearances: this.minAppearances,
      mode: this.selectedMode,
    });
  }

  resetFilters() {
    this.periodFrom = null;
    this.periodTo = null;
    this.minBattles = null;
    this.limit = null;
    this.minAppearances = null;
    this.reset.emit();
  }
}
