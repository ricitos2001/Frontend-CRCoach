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
  // `loading` mantiene el estado global (deshabilita el botón hasta que
  // todas las operaciones terminen). `spinning` controla únicamente la
  // animación (se detendrá cuando llegue la primera respuesta).
  public loading = false;
  public spinning = false;
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
    // Set loading state and start poller to wait until all stores finished
    // `spinning` controla la animación y será detenida cuando llegue la
    // primera respuesta (Promise.race). `loading` se mantendrá true hasta
    // que el poller confirme que todas las cargas terminaron.
    this.loading = true;
    this.spinning = true;
    this.startPoller();
    const promises: Promise<any>[] = [];
    try {
      const p = this.battlesStore.importBattles(tag);
      if (p) promises.push(p);
    } catch (e) {
      console.warn('Error triggering importBattles', e);
    }

    try {
      const p = this.profileStore.importProfile(tag);
      if (p) promises.push(p);
    } catch (e) {
      console.warn('Error triggering importProfile', e);
    }

    // Cargar métricas
    try {
      const p = this.metricsStore.loadMetrics(tag);
      if (p) promises.push(p);
    } catch (e) {
      console.warn('Error triggering loadMetrics', e);
    }

    // Cargar analíticas: resumen, debilidades y cartas problemáticas (parámetros por defecto)
    try {
      const p1 = this.analyticsStore.loadSummary(tag);
      const p2 = this.analyticsStore.loadWeaknesses(tag);
      const p3 = this.analyticsStore.loadProblematicCards(tag);
      if (p1) promises.push(p1);
      if (p2) promises.push(p2);
      if (p3) promises.push(p3);
    } catch (e) {
      console.warn('Error triggering analytics loads', e);
    }

    // Si alguna promesa se resuelve/rechaza, paramos la animación (spinning=false)
    // pero mantenemos `loading` hasta que el poller confirme que todas
    // las cargas han finalizado.
    if (promises.length > 0) {
      Promise.race(promises)
        .then(() => {
          this.spinning = false;
        })
        .catch(() => {
          // aunque haya error, queremos parar la animación cuando recibimos
          // la primera respuesta (fallida o exitosa)
          this.spinning = false;
        });
    } else {
      // por seguridad, si no se recogió ninguna promesa, paramos la animación
      // para evitar quedar girando indefinidamente
      this.spinning = false;
    }
  }

  private startPoller() {
    // clear existing if any
    if (this._pollHandle) clearInterval(this._pollHandle);
    this._pollHandle = setInterval(() => {
      try {
        const anyLoading = (
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
          window.location.reload();
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
