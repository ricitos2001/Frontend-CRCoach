import { Component, OnDestroy } from '@angular/core';
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
export class RefreshButtonComponent implements OnDestroy {
  public loading = false;
  private _pollHandle: any = null;

  constructor(
    private battlesStore: BattlesSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private metricsStore: MetricsSignalStore,
    private analyticsStore: AnalyticsSignalStore,
    private toast: ToastService,
  ) {}

  /**
   * Lanza las llamadas para importar/recargar datos del jugador.
   * - importa batallas
   * - importa perfil
   * - carga métricas
   * - carga analíticas (summary, weaknesses, problematic cards)
   */
  refreshAll() {
    const tag = localStorage.getItem('tag');
    if (!tag) {
      console.warn('RefreshButton: no tag found in localStorage');
      this.toast.show({ type: 'error', message: 'PAGES.REFRESH.NO_TAG', duration: 4000 });
      return;
    }

    // Importar batallas y perfil (llamadas que pueden realizar import si hace falta)
    this.toast.show({ type: 'info', message: 'PAGES.REFRESH.STARTED', duration: 2000 });
    // Set loading state and start poller to stop animation when all stores finished
    this.loading = true;
    this.startPoller();
    try {
      this.battlesStore.importBattles(tag);
    } catch (e) {
      console.warn('Error triggering importBattles', e);
    }

    try {
      this.profileStore.importProfile(tag);
    } catch (e) {
      console.warn('Error triggering importProfile', e);
    }

    // Cargar métricas
    try {
      this.metricsStore.loadMetrics(tag);
    } catch (e) {
      console.warn('Error triggering loadMetrics', e);
    }

    // Cargar analíticas: resumen, debilidades y cartas problemáticas (parámetros por defecto)
    try {
      this.analyticsStore.loadSummary(tag);
      this.analyticsStore.loadWeaknesses(tag);
      this.analyticsStore.loadProblematicCards(tag);
    } catch (e) {
      console.warn('Error triggering analytics loads', e);
    }
  }

  private startPoller() {
    // clear existing if any
    if (this._pollHandle) clearInterval(this._pollHandle);
    this._pollHandle = setInterval(() => {
      try {
        const anyLoading = !!(
          this.battlesStore.loading() ||
          this.profileStore.loading() ||
          this.metricsStore.loading() ||
          this.analyticsStore.loading()
        );
        if (!anyLoading) {
          this.loading = false;
          clearInterval(this._pollHandle);
          this._pollHandle = null;
          this.toast.show({ type: 'success', message: 'PAGES.REFRESH.DONE', duration: 2000 });
        }
      } catch (e) {
        // keep trying, but avoid silent crash
        console.warn('RefreshButton poller error', e);
      }
    }, 250);
  }

  ngOnDestroy(): void {
    if (this._pollHandle) {
      clearInterval(this._pollHandle);
      this._pollHandle = null;
    }
  }
}
