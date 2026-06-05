import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImportStateService {
  public importing = signal<boolean>(false);

  start() {
    this.importing.set(true);
  }

  stop() {
    this.importing.set(false);
  }
}
