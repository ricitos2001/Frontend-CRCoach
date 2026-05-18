import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-searcher',
  imports: [FormInputComponent, FormsModule],
  templateUrl: './searcher.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class SearcherComponent implements OnDestroy {
  @Input() placeholder: string = 'Type to search...';
  @Input() labelText?: string;
  @Input() debounce: number = 300; // milliseconds
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  /** Emits a period range when user types a range like `YYYY-MM-DD - YYYY-MM-DD` or `DD/MM/YYYY - DD/MM/YYYY` */
  @Output() periodFilter: EventEmitter<{ from: string; to: string } | null> = new EventEmitter();

  searchTerm: string = '';

  private searchSubject = new Subject<string>();
  private sub = this.searchSubject
    .pipe(debounceTime(this.debounce), distinctUntilChanged())
    .subscribe((t) => this.search.emit(t));

  onSearch(): void {
    this.searchSubject.next(this.searchTerm ?? '');
    // Detect period range like YYYY-MM-DD - YYYY-MM-DD or DD/MM/YYYY - DD/MM/YYYY
    const rangeRegex = /^\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\s*$/;
    const m = (this.searchTerm || '').match(rangeRegex);
    if (m) {
      const rawFrom = m[1];
      const rawTo = m[2];

      const normalize = (s: string) => {
        if (s.includes('/')) {
          // dd/mm/yyyy -> yyyy-mm-dd
          const parts = s.split('/');
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return s; // assume already yyyy-mm-dd
      };

      const from = normalize(rawFrom);
      const to = normalize(rawTo);
      this.periodFilter.emit({ from, to });
      return;
    }

    // if not a range, emit null to clear any previous period filter
    this.periodFilter.emit(null);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
