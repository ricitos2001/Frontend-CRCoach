import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ImportStateService } from '../../../services/import-state/import-state.service';

@Component({
  selector: 'app-importing-spinner',
  imports: [TranslatePipe],
  templateUrl: './importing-spinner.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class ImportingSpinnerComponent {
  public importState = inject(ImportStateService);
}
