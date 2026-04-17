import { ChangeDetectorRef, Component, effect, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { RefreshButtonComponent } from '../../components/shared/refresh-button/refresh-button.component';

@Component({
  selector: 'app-battles',
  imports: [SidebarComponent, RefreshButtonComponent],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class BattlesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(public battlesStore: BattlesSignalStore, public cd: ChangeDetectorRef) {
    effect(() => {
      if (this.tag != null) {
        this.battlesStore.loadByTag(this.tag);
      }
    });
  }

  ngOnInit(): void {
    if (!this.tag) return;
    this.battlesStore.loadByTag(this.tag);
  }

  refreshBattles() {
    if (!this.tag) return;
    this.battlesStore.importBattles(this.tag);
  }
}
