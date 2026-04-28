import { Component } from '@angular/core';
import { BattlesSignalStore } from '../../../signal_stores/battles.signal.store';
import { PlayerProfileSignalStore } from '../../../signal_stores/player-profile.signal.store';
import { MetricsSignalStore } from '../../../signal_stores/metrics.signal.store';
import { AnalyticsSignalStore } from '../../../signal_stores/analytics.signal.store';

@Component({
  selector: 'app-refresh-button',
  imports: [],
  templateUrl: './refresh-button.component.html',
  styleUrl: '../../../../styles/styles.css',
  standalone: true,
})
export class RefreshButtonComponent {
  constructor(
    private battlesStore: BattlesSignalStore,
    private profileStore: PlayerProfileSignalStore,
    private metricsStore: MetricsSignalStore,
    private analyticsStore: AnalyticsSignalStore,
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
      return;
    }

    // Importar batallas y perfil (llamadas que pueden realizar import si hace falta)
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
}
