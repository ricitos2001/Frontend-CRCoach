import { Component, HostBinding } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class FooterComponent {
  constructor(protected router: Router) {}
  // Controla si los textos "solo en código" deben renderizarse en la UI.
  // Por defecto está desactivado; se puede activar en tiempo de ejecución desde la consola:
  // window.__SHOW_CODE_ONLY = true
  showCodeOnly = !!(window as any).__SHOW_CODE_ONLY;

  @HostBinding('class.show-code-only')
  get hostShowCodeOnly(): boolean {
    return this.showCodeOnly;
  }
}
