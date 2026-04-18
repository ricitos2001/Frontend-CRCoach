import { Component, effect, OnInit, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { AnalyticsSignalStore } from '../../signal_stores/analytics.signal.store';
import { ChartOptions, ChartDataset } from 'chart.js';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { GraphComponent } from '../../components/shared/graph/graph.component';

@Component({
  selector: 'app-weaknesses',
  imports: [SidebarComponent, TranslatePipe, GraphComponent],
  templateUrl: './weaknesses.page.html',
  styleUrl: '../../../styles/styles.css',
  standalone: true,
})
export class WeaknessesPage implements OnInit {
  tag = localStorage.getItem('tag');
  constructor(
    public analyticsStore: AnalyticsSignalStore,
    private destroyRef: DestroyRef,
    private translate: TranslateService,
  ) {
    effect(() => {
      if (this.tag != null) {
        this.analyticsStore.loadSummary(this.tag);
        this.analyticsStore.loadWeaknesses(this.tag);
        this.analyticsStore.loadProblematicCards(this.tag);
      }
    });

    effect(() => {
      const wr = this.analyticsStore.weaknesses();
      if (wr) {
        this.createOrUpdateChart();
      } else {
        this.weaknessesLabels = [];
        this.weaknessesDatasets = [];
      }
    });
  }

  // Datos para el componente reutilizable `app-graph`
  public weaknessesLabels: string[] = [];
  public weaknessesDatasets: ChartDataset[] = [];

  public get barChartOptions(): ChartOptions {
    return {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.ARCHETYPE') } },
        y: {
          title: { display: true, text: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL') },
          beginAtZero: true,
        },
      },
    } as ChartOptions;
  }

  private createOrUpdateChart() {
    const wr = this.analyticsStore.weaknesses();
    if (!wr) return;
    let byArchetype: any[] = [];
    if (Array.isArray((wr as any).byArchetype)) {
      byArchetype = (wr as any).byArchetype;
    } else if (typeof (wr as any).byArchetypeJson === 'string') {
      try {
        byArchetype = JSON.parse((wr as any).byArchetypeJson);
      } catch (e) {
        console.warn('WeaknessesPage: error parsing byArchetypeJson', e);
        return;
      }
    } else {
      // No tenemos datos en el formato esperado
      return;
    }

    const labels = byArchetype.map((a: any) => a.archetype);
    const data = byArchetype.map((a: any) => a.battles);
    const bgColors = byArchetype.map((a: any) => {
      if (a.label && a.label.toLowerCase().includes('fort')) return 'rgba(46, 204, 113, 0.9)';
      if (a.label && a.label.toLowerCase().includes('debil')) return 'rgba(231, 76, 60, 0.9)';
      return 'rgba(149, 165, 166, 0.9)';
    });

    // Asignar a propiedades usadas por <app-graph>
    this.weaknessesLabels = labels;
    this.weaknessesDatasets = [
      {
        label: this.translate.instant('PAGES.WEAKNESSES.BATTLES_LABEL'),
        data,
        backgroundColor: bgColors,
        borderColor: bgColors,
        borderWidth: 1,
      } as any,
    ];
  }

  ngOnInit(): void {
    // Intentar crear/actualizar al inicializar (si ya hay datos)
    this.createOrUpdateChart();

    // No hay chart DOM directo aquí: el componente `app-graph` se encarga de su limpieza.
    this.destroyRef.onDestroy(() => {});
  }
}
