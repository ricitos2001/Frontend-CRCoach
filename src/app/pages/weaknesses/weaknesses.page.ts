import { Component, effect, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { AnalyticsSignalStore } from '../../signal_stores/analytics.signal.store';

@Component({
  selector: 'app-weaknesses',
  imports: [SidebarComponent],
  templateUrl: './weaknesses.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class WeaknessesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(public analyticsStore: AnalyticsSignalStore) {
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
    if (!this.tag) return;
    this.analyticsStore.loadSummary(this.tag);
    this.analyticsStore.loadWeaknesses(this.tag);
    this.analyticsStore.loadProblematicCards(this.tag);
  }
}
