import { Component, effect, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';

@Component({
  selector: 'app-battles',
  imports: [SidebarComponent],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
})
export class BattlesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(
    public battlesStore: Battles,
  ) {
    effect(() => {
      if (this.tag != null) {
        this.analyticsStore.loadSummary(this.tag);
        this.analyticsStore.summary();
      }
      if (this.tag != null) {
        this.analyticsStore.loadWeaknesses(this.tag);
        this.analyticsStore.weaknesses();
      }
      if (this.tag != null) {
        this.analyticsStore.loadProblematicCards(this.tag);
        this.analyticsStore.problematicCards();
      }
    });
  }

  ngOnInit(): void {
    const tag = localStorage.getItem('tag');
    if (!tag) return;
    this.analyticsStore.loadSummary(tag);
    this.analyticsStore.loadWeaknesses(tag);
    this.analyticsStore.loadProblematicCards(tag);
  }
}
