import { Component, effect } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-battles',
  imports: [SidebarComponent, RefreshButtonComponent, TranslateModule],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class BattlesPage {
  tag = localStorage.getItem('tag');
  constructor(
    public battlesStore: BattlesSignalStore,
  ) {
    effect(() => {
      if (this.tag != null) {
        this.battlesStore.loadByTag(this.tag);
      }
    });
  }

  refreshBattles() {
    if (!this.tag) return;
    this.battlesStore.importBattles(this.tag);
  }
}
