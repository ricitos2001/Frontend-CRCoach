import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonButtonComponent } from '../common-button/common-button.component';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: '../../../../styles/styles.css',
  imports: [TranslatePipe, CommonButtonComponent],
})
export class PaginationComponent {
  @Input() page: any;
  @Output() prev = new EventEmitter<any>();
  @Output() next = new EventEmitter<any>();

  onPrev() {
    this.prev.emit(this.page ?? null);
  }

  onNext() {
    this.next.emit(this.page ?? null);
  }

  getPageNumber(): number {
    if (!this.page) return 0;
    return (this.page.number ?? 0) + 1;
  }

  getTotalPages(): number {
    return this.page?.totalPages ?? 1;
  }

  isFirst(): boolean {
    return !!this.page?.first;
  }

  isLast(): boolean {
    return (this.page?.number ?? 0) >= (this.page?.totalPages ?? 1) - 1;
  }
}
