import { Component } from '@angular/core';
import { BattlesSignalStore } from '../../../signal_stores/battles.signal.store';
import { PlayerProfileSignalStore } from '../../../signal_stores/player-profile.signal.store';
import { MetricsSignalStore } from '../../../signal_stores/metrics.signal.store';
import { AnalyticsSignalStore } from '../../../signal_stores/analytics.signal.store';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-refresh-button',
  imports: [],
  templateUrl: './refresh-button.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class RefreshButtonComponent {
  public loading = false;
  public spinning = false;

  constructor(
    private battlesStore: BattlesSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private metricsStore: MetricsSignalStore,
    private analyticsStore: AnalyticsSignalStore,
    private toast: ToastService,
  ) {}

  async refreshAll() {
    const tag = localStorage.getItem('tag');
    if (!tag) {
      console.warn('RefreshButton: no tag found in localStorage');
      this.toast.show({ type: 'error', message: 'PAGES.REFRESH.NO_TAG', duration: 4000 });
      return;
    }

    this.toast.show({ type: 'info', message: 'PAGES.REFRESH.STARTED', duration: 2000 });
    this.loading = true;
    this.spinning = true;

    const promises: Promise<any>[] = [];

    const collect = (p: Promise<any> | undefined) => {
      if (p) promises.push(p);
    };

    try { collect(this.battlesStore.importBattles(tag)); }
    catch (e) { console.warn('Error triggering importBattles', e); }

    try { collect(this.profileStore.importProfile(tag)); }
    catch (e) { console.warn('Error triggering importProfile', e); }

    try { collect(this.metricsStore.loadMetrics(tag)); }
    catch (e) { console.warn('Error triggering loadMetrics', e); }

    try {
      collect(this.analyticsStore.loadSummary(tag));
      collect(this.analyticsStore.loadWeaknesses(tag));
      collect(this.analyticsStore.loadProblematicCards(tag));
    } catch (e) {
      console.warn('Error triggering analytics loads', e);
    }

    await Promise.allSettled(promises);

    this.spinning = false;
    this.loading = false;
    this.toast.show({ type: 'success', message: 'PAGES.REFRESH.DONE', duration: 2000 });
    window.location.reload();
  }
}
