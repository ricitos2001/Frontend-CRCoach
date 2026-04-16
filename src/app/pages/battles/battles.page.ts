import { Component, effect, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { UsersSignalStore } from '../../signal_stores/users.signal.store';
import { PlayerProfileSignalStore } from '../../signal_stores/player-profile.signal.store';
import { HeaderContentService } from '../../services/header-content/header-content.service';
import { BattlesSignalStore } from '../../signal_stores/battles.signal.store';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-battles',
  imports: [SidebarComponent],
  templateUrl: './battles.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class BattlesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(public battlesStore: BattlesSignalStore) {
    effect(() => {
      if (this.tag != null) {
        this.battlesStore.loadByTag(this.tag);
        this.battlesStore.battles();
      }
    });
  }

  ngOnInit(): void {
    if (!this.tag) return;
    this.battlesStore.loadByTag(this.tag);
  }
}
