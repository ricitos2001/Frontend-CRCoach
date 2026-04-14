import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HeaderContentService {
  private content = new BehaviorSubject<TemplateRef<any> | null>(null);
  content$ = this.content.asObservable();

  setContent(template: TemplateRef<any>) {
    this.content.next(template);
  }
}
